// 認証ドメインサービス

import type { User } from "../entities/user";
import type { Result, UserRole } from "../types/auth";
import { AuthenticationError } from "../types/auth";
import type { Email } from "../value-objects/email";
import type { Password } from "../value-objects/password";
import { verifyPassword } from "../value-objects/password";
import type { TokenGenerator } from "./token-generator";

// 認証サービス（純粋関数）
export interface AuthenticationService {
  // ビジネスルール: ログイン認証
  authenticateUser(
    email: Email,
    password: Password,
    user: User
  ): Result<{ isValid: boolean; error?: AuthenticationError }, AuthenticationError>;

  // ビジネスルール: ユーザー権限チェック
  validateUserRole(user: User, requiredRole: UserRole): Result<true, AuthenticationError>;

  // ビジネスルール: アカウント状態チェック
  validateAccountStatus(user: User): Result<true, AuthenticationError>;
}

// 認証実装
export const createAuthenticationService = (
  _tokenGenerator: TokenGenerator
): AuthenticationService => ({
  authenticateUser: (
    _email: Email,
    password: Password,
    user: User
  ): Result<{ isValid: boolean; error?: AuthenticationError }, AuthenticationError> => {
    // 1. メールアドレス一致チェック
    if (_email.value !== user.email.value) {
      return {
        success: true,
        data: {
          isValid: false,
          error: new AuthenticationError("Invalid email or password", "INVALID_CREDENTIALS"),
        },
      };
    }

    // 2. パスワード検証
    if (!verifyPassword(password.hashedValue, user.password)) {
      return {
        success: true,
        data: {
          isValid: false,
          error: new AuthenticationError("Invalid email or password", "INVALID_CREDENTIALS"),
        },
      };
    }

    // 3. アカウント状態チェック
    const accountStatusResult = validateAccountStatus(user);
    if (!accountStatusResult.success) {
      return {
        success: true,
        data: {
          isValid: false,
          error: accountStatusResult.error,
        },
      };
    }

    return {
      success: true,
      data: { isValid: true },
    };
  },

  validateUserRole: (user: User, _requiredRole: UserRole): Result<true, AuthenticationError> => {
    // 管理者は全ての権限を持つ
    if (user.role === "admin") {
      return { success: true, data: true };
    }

    // 同じロールの場合のみ許可
    if (user.role === _requiredRole) {
      return { success: true, data: true };
    }

    return {
      success: false,
      error: new AuthenticationError("Insufficient permissions", "INVALID_CREDENTIALS"),
    };
  },

  validateAccountStatus: (_user: User): Result<true, AuthenticationError> => {
    // アカウントが有効かチェック（将来的にアカウント無効化機能を追加する場合）
    // 現在は全てのアカウントが有効とみなす
    return { success: true, data: true };
  },
});

// ヘルパー関数
const validateAccountStatus = (_user: User): Result<true, AuthenticationError> => {
  // アカウントが有効かチェック（将来的にアカウント無効化機能を追加する場合）
  // 現在は全てのアカウントが有効とみなす
  return { success: true, data: true };
};
