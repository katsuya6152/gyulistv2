// ログインユースケース

import { 
  LoginRequest, 
  LoginResponse, 
  Result, 
  AuthenticationError 
} from '../../../domain/types/auth';
import { validateLoginRequest, authenticateUser } from '../../../domain/functions/auth';
import { UserRepository, AuthRepository } from '../../../domain/contracts/repositories';
import { Email } from '../../../domain/value-objects/email';
import { Password, verifyPassword } from '../../../domain/value-objects/password';

// ログインユースケース
export class LoginUseCase {
  constructor(
    private readonly authRepository: AuthRepository
  ) {}

  async execute(request: LoginRequest): Promise<LoginResponse> {
    try {
      // 1. リクエスト検証
      const validationResult = validateLoginRequest(request);
      if (!validationResult.success) {
        return {
          success: false,
          error: validationResult.error.message
        };
      }

      const { email, password } = validationResult.data;

      // 2. ユーザー検索
      const userResult = await this.authRepository.findUserByEmail(email);
      if (!userResult.success) {
        return {
          success: false,
          error: 'Authentication failed'
        };
      }

      if (!userResult.data) {
        return {
          success: false,
          error: 'Invalid email or password'
        };
      }

      const user = userResult.data;

      // 3. パスワード検証
      if (!verifyPassword(request.password, user.password)) {
        return {
          success: false,
          error: 'Invalid email or password'
        };
      }

      // 4. 認証処理
      const authResult = authenticateUser(email, password, user);
      if (!authResult.success) {
        return {
          success: false,
          error: authResult.error.message
        };
      }

      return {
        success: true,
        data: authResult.data
      };

    } catch (error) {
      return {
        success: false,
        error: 'Internal server error'
      };
    }
  }
}

// ユーザー登録ユースケース
export class RegisterUseCase {
  constructor(
    private readonly authRepository: AuthRepository
  ) {}

  async execute(request: {
    email: string;
    password: string;
    farmName: string;
    role?: 'farmer' | 'admin' | 'viewer';
  }): Promise<LoginResponse> {
    try {
      // 1. メールアドレス重複チェック
      const email = { value: request.email } as Email;
      const existsResult = await this.authRepository.findUserByEmail(email);
      if (!existsResult.success) {
        return {
          success: false,
          error: 'Registration failed'
        };
      }

      if (existsResult.data) {
        return {
          success: false,
          error: 'Email already exists'
        };
      }

      // 2. ユーザー・農場作成
      const { registerUser } = await import('../../../domain/functions/auth');
      const registrationResult = registerUser(
        request.email,
        request.password,
        request.farmName,
        request.role || 'farmer'
      );

      if (!registrationResult.success) {
        return {
          success: false,
          error: registrationResult.error.message
        };
      }

      const { user, farm } = registrationResult.data;

      // 3. データベース保存
      const saveResult = await this.authRepository.saveUserWithFarm(user, farm);
      if (!saveResult.success) {
        return {
          success: false,
          error: 'Failed to save user data'
        };
      }

      // 4. 認証トークン生成
      const { authenticateUser } = await import('../../../domain/functions/auth');
      // 登録時は平文パスワードをそのまま使用
      const plainPassword = { hashedValue: request.password } as Password;
      const authResult = authenticateUser(user.email, plainPassword, user);
      if (!authResult.success) {
        return {
          success: false,
          error: authResult.error.message
        };
      }

      return {
        success: true,
        data: authResult.data
      };

    } catch (error) {
      return {
        success: false,
        error: 'Internal server error'
      };
    }
  }
}

// トークン検証ユースケース
export class VerifyTokenUseCase {
  constructor(
    private readonly authRepository: AuthRepository
  ) {}

  async execute(token: string): Promise<Result<{ user: any; farm: any }, AuthenticationError>> {
    try {
      const { verifyToken } = await import('../../../domain/functions/auth');
      const tokenResult = verifyToken(token);
      
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
          error: new AuthenticationError('User not found', 'USER_NOT_FOUND') 
        };
      }

      return { success: true, data: userWithFarmResult.data };

    } catch (error) {
      return { 
        success: false, 
        error: new AuthenticationError('Token verification failed', 'INVALID_TOKEN') 
      };
    }
  }
}
