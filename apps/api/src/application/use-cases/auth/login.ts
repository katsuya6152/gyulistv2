// ログインユースケース

import { type AuthRepository, UserRepository } from "../../../domain/contracts/repositories";
import type { Farm } from "../../../domain/entities/farm";
import type { User } from "../../../domain/entities/user";
import { authenticateUser, validateLoginRequest } from "../../../domain/functions/auth";
import { createAuthenticationService } from "../../../domain/services/authentication";
import { createDateTimeProvider } from "../../../domain/services/date-time";
import { createIdGenerator } from "../../../domain/services/id-generator";
import { createTokenGenerator } from "../../../domain/services/token-generator";
import { createUserRegistrationService } from "../../../domain/services/user-registration";
import {
  AuthenticationError,
  type LoginRequest,
  type LoginResponse,
  type Result,
} from "../../../domain/types/auth";
import type { Email } from "../../../domain/value-objects/email";
import { type Password, verifyPassword } from "../../../domain/value-objects/password";

// ログインユースケース
export class LoginUseCase {
  private readonly tokenGenerator: ReturnType<typeof createTokenGenerator>;
  private readonly authenticationService: ReturnType<typeof createAuthenticationService>;

  constructor(private readonly authRepository: AuthRepository) {
    const dateTimeProvider = createDateTimeProvider();
    this.tokenGenerator = createTokenGenerator(dateTimeProvider);
    this.authenticationService = createAuthenticationService(this.tokenGenerator);
  }

  async execute(request: LoginRequest): Promise<LoginResponse> {
    try {
      // 1. リクエスト検証
      const validationResult = validateLoginRequest(request);
      if (!validationResult.success) {
        return {
          success: false,
          error: validationResult.error.message,
        };
      }

      const { email, password } = validationResult.data;

      // 2. ユーザー検索
      const userResult = await this.authRepository.findUserByEmail(email);
      if (!userResult.success) {
        return {
          success: false,
          error: "Authentication failed",
        };
      }

      if (!userResult.data) {
        return {
          success: false,
          error: "Invalid email or password",
        };
      }

      const user = userResult.data;

      // 3. 認証処理（ビジネスルールをドメインサービスに委譲）
      const authValidationResult = this.authenticationService.authenticateUser(
        email,
        password,
        user
      );
      if (!authValidationResult.success) {
        return {
          success: false,
          error: authValidationResult.error.message,
        };
      }

      if (!authValidationResult.data.isValid) {
        return {
          success: false,
          error: authValidationResult.data.error?.message || "Invalid email or password",
        };
      }

      // 4. トークン生成
      const authResult = authenticateUser(email, password, user, this.tokenGenerator);
      if (!authResult.success) {
        return {
          success: false,
          error: authResult.error.message,
        };
      }

      return {
        success: true,
        data: authResult.data,
      };
    } catch {
      return {
        success: false,
        error: "Internal server error",
      };
    }
  }
}

// ユーザー登録ユースケース
export class RegisterUseCase {
  private readonly userRegistrationService: ReturnType<typeof createUserRegistrationService>;
  private readonly tokenGenerator: ReturnType<typeof createTokenGenerator>;
  private readonly authenticationService: ReturnType<typeof createAuthenticationService>;

  constructor(private readonly authRepository: AuthRepository) {
    const idGenerator = createIdGenerator();
    const dateTimeProvider = createDateTimeProvider();
    this.userRegistrationService = createUserRegistrationService(idGenerator, dateTimeProvider);
    this.tokenGenerator = createTokenGenerator(dateTimeProvider);
    this.authenticationService = createAuthenticationService(this.tokenGenerator);
  }

  async execute(request: {
    email: string;
    password: string;
    farmName: string;
    role?: "farmer" | "admin" | "viewer";
  }): Promise<LoginResponse> {
    try {
      // 1. メールアドレス重複チェック（ビジネスルールをドメインサービスに委譲）
      const email = { value: request.email } as Email;
      const existsResult = await this.authRepository.findUserByEmail(email);
      if (!existsResult.success) {
        return {
          success: false,
          error: "Registration failed",
        };
      }

      const emailUniquenessResult = this.userRegistrationService.validateEmailUniqueness(
        email,
        existsResult.data
      );
      if (!emailUniquenessResult.success) {
        return {
          success: false,
          error: emailUniquenessResult.error.message,
        };
      }

      // 2. ユーザー・農場作成
      const { registerUser } = await import("../../../domain/functions/auth");
      const registrationResult = registerUser(
        request.email,
        request.password,
        request.farmName,
        this.userRegistrationService,
        request.role || "farmer"
      );

      if (!registrationResult.success) {
        return {
          success: false,
          error: registrationResult.error.message,
        };
      }

      const { user, farm } = registrationResult.data;

      // 3. データベース保存
      const saveResult = await this.authRepository.saveUserWithFarm(user, farm);
      if (!saveResult.success) {
        return {
          success: false,
          error: "Failed to save user data",
        };
      }

      // 4. 認証トークン生成
      const { authenticateUser } = await import("../../../domain/functions/auth");
      // 登録時は平文パスワードをそのまま使用
      const plainPassword = { hashedValue: request.password } as Password;
      const authResult = authenticateUser(user.email, plainPassword, user, this.tokenGenerator);
      if (!authResult.success) {
        return {
          success: false,
          error: authResult.error.message,
        };
      }

      return {
        success: true,
        data: authResult.data,
      };
    } catch {
      return {
        success: false,
        error: "Internal server error",
      };
    }
  }
}

// トークン検証ユースケース
export class VerifyTokenUseCase {
  private readonly tokenGenerator: ReturnType<typeof createTokenGenerator>;

  constructor(private readonly authRepository: AuthRepository) {
    const dateTimeProvider = createDateTimeProvider();
    this.tokenGenerator = createTokenGenerator(dateTimeProvider);
  }

  async execute(token: string): Promise<Result<{ user: User; farm: Farm }, AuthenticationError>> {
    try {
      const { verifyToken } = await import("../../../domain/functions/auth");
      const tokenResult = verifyToken(token, this.tokenGenerator);

      if (!tokenResult.success) {
        return { success: false, error: tokenResult.error };
      }

      const { userId } = tokenResult.data;
      const userWithFarmResult = await this.authRepository.findUserWithFarm(userId);

      if (!userWithFarmResult.success) {
        return { success: false, error: userWithFarmResult.error };
      }

      if (!userWithFarmResult.data) {
        return {
          success: false,
          error: new AuthenticationError("User not found", "USER_NOT_FOUND"),
        };
      }

      return { success: true, data: userWithFarmResult.data };
    } catch {
      return {
        success: false,
        error: new AuthenticationError("Token verification failed", "INVALID_TOKEN"),
      };
    }
  }
}
