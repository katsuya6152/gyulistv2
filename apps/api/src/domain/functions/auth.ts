// 認証関連のドメイン関数

import type { Farm } from "../entities/farm";
import type { User } from "../entities/user";
import type { TokenGenerator } from "../services/token-generator";
import type { UserRegistrationService } from "../services/user-registration";
import type { AuthResult, LoginRequest, Result, UserId, UserRole } from "../types/auth";
import { AuthenticationError } from "../types/auth";
import { createEmail } from "../value-objects/email";
import type { Email } from "../value-objects/email";
import { verifyPassword } from "../value-objects/password";
import type { Password } from "../value-objects/password";

// ログイン処理関数（純粋関数）
export const authenticateUser = (
  _email: Email,
  password: Password,
  user: User,
  tokenGenerator: TokenGenerator
): Result<AuthResult, AuthenticationError> => {
  // パスワード検証（平文パスワードを検証）
  if (!verifyPassword(password.hashedValue, user.password)) {
    return {
      success: false,
      error: new AuthenticationError("Invalid credentials", "INVALID_CREDENTIALS"),
    };
  }

  // アクセストークン生成
  const accessToken = tokenGenerator.generateAccessToken(user.id);
  const refreshToken = tokenGenerator.generateRefreshToken(user.id);

  return {
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email.value,
        role: user.role,
        farmId: user.farmId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      accessToken,
      refreshToken,
      expiresIn: 3600, // 1時間
    },
  };
};

// トークン検証関数（純粋関数）
export const verifyToken = (
  token: string,
  tokenGenerator: TokenGenerator
): Result<{ userId: UserId; type: string }, AuthenticationError> => {
  const result = tokenGenerator.verifyToken(token);

  if (!result.success) {
    return {
      success: false,
      error: new AuthenticationError(result.error || "Invalid token", "INVALID_TOKEN"),
    };
  }

  if (!result.data) {
    return {
      success: false,
      error: new AuthenticationError("Invalid token data", "INVALID_TOKEN"),
    };
  }

  return {
    success: true,
    data: { userId: result.data.userId, type: result.data.type },
  };
};

// ログインリクエスト検証関数（純粋関数）
export const validateLoginRequest = (
  request: LoginRequest
): Result<{ email: Email; password: Password }, AuthenticationError> => {
  // メールアドレス検証
  const emailResult = createEmail(request.email);
  if (!emailResult.success) {
    return { success: false, error: emailResult.error };
  }

  // パスワード検証（ログイン時は平文パスワードを受け取る）
  if (!request.password || request.password.length === 0) {
    return {
      success: false,
      error: new AuthenticationError("Password is required", "INVALID_CREDENTIALS"),
    };
  }

  // ログイン時は平文パスワードをそのまま使用（ハッシュ化はしない）
  const password: Password = { hashedValue: request.password };

  return {
    success: true,
    data: { email: emailResult.data, password },
  };
};

// ユーザー登録関数（純粋関数）
export const registerUser = (
  email: string,
  password: string,
  farmName: string,
  userRegistrationService: UserRegistrationService,
  role: UserRole = "farmer"
): Result<{ user: User; farm: Farm }, AuthenticationError> => {
  return userRegistrationService.registerUser(email, password, farmName, role);
};

// パスワードリセットトークン生成関数（純粋関数）
export const generatePasswordResetToken = (
  userId: UserId,
  _tokenGenerator: TokenGenerator
): string => {
  const payload = {
    userId,
    type: "password_reset",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 1800, // 30分
  };

  return Buffer.from(JSON.stringify(payload)).toString("base64");
};

// パスワードリセットトークン検証関数（純粋関数）
export const verifyPasswordResetToken = (
  token: string,
  tokenGenerator: TokenGenerator
): Result<UserId, AuthenticationError> => {
  const result = verifyToken(token, tokenGenerator);
  if (!result.success) {
    return { success: false, error: result.error };
  }

  if (result.data.type !== "password_reset") {
    return {
      success: false,
      error: new AuthenticationError("Invalid token type", "INVALID_TOKEN"),
    };
  }

  return { success: true, data: result.data.userId };
};
