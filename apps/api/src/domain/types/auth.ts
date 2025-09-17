// 認証ドメインの型定義

// ID型（ブランド型）
export type UserId = string & { readonly __brand: 'UserId' };
export type FarmId = string & { readonly __brand: 'FarmId' };

// 認証関連の状態型
export type UserRole = 'farmer' | 'admin' | 'viewer';
export type AuthStatus = 'authenticated' | 'unauthenticated' | 'expired';

// 認証トークン型
export type AccessToken = string & { readonly __brand: 'AccessToken' };
export type RefreshToken = string & { readonly __brand: 'RefreshToken' };

// 認証結果型
export interface AuthResult {
  readonly user: User;
  readonly accessToken: AccessToken;
  readonly refreshToken: RefreshToken;
  readonly expiresIn: number;
}

// ログインリクエスト型
export interface LoginRequest {
  readonly email: string;
  readonly password: string;
}

// ログインレスポンス型
export interface LoginResponse {
  readonly success: boolean;
  readonly data?: AuthResult;
  readonly error?: string;
}

// ユーザー型
export interface User {
  readonly id: UserId;
  readonly email: string;
  readonly role: UserRole;
  readonly farmId: FarmId;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// 農場型
export interface Farm {
  readonly id: FarmId;
  readonly farmName: string;
  readonly address?: string;
  readonly phoneNumber?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// 結果型（Either型）
export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

// 認証エラー型
export type AuthError = 
  | 'INVALID_CREDENTIALS'
  | 'USER_NOT_FOUND'
  | 'INVALID_EMAIL_FORMAT'
  | 'PASSWORD_TOO_SHORT'
  | 'ACCOUNT_LOCKED'
  | 'TOKEN_EXPIRED'
  | 'INVALID_TOKEN';

// 認証エラークラス
export class AuthenticationError extends Error {
  constructor(
    message: string,
    public readonly code: AuthError,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AuthenticationError';
  }
}
