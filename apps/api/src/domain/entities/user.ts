// Userエンティティ

import type { DateTimeProvider } from "../services/date-time";
import type { IdGenerator } from "../services/id-generator";
import {
  AuthenticationError,
  type FarmId,
  type Result,
  type UserId,
  type UserRole,
} from "../types/auth";
import type { Email } from "../value-objects/email";
import type { Password } from "../value-objects/password";

// Userエンティティ
export interface User {
  readonly id: UserId;
  readonly email: Email;
  readonly password: Password;
  readonly role: UserRole;
  readonly farmId: FarmId;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// User作成関数（純粋関数）
export const createUser = (
  email: Email,
  password: Password,
  role: UserRole,
  farmId: FarmId,
  idGenerator: IdGenerator,
  dateTimeProvider: DateTimeProvider
): User => ({
  id: idGenerator.generateUserId(),
  email,
  password,
  role,
  farmId,
  createdAt: dateTimeProvider.now(),
  updatedAt: dateTimeProvider.now(),
});

// 既存データからUserエンティティを復元する関数
export const restoreUser = (
  id: UserId,
  email: Email,
  password: Password,
  role: UserRole,
  farmId: FarmId,
  createdAt: Date,
  updatedAt: Date
): User => ({
  id,
  email,
  password,
  role,
  farmId,
  createdAt,
  updatedAt,
});

// パスワード更新関数（純粋関数）
export const updatePassword = (
  user: User,
  newPassword: Password,
  dateTimeProvider: DateTimeProvider
): User => ({
  ...user,
  password: newPassword,
  updatedAt: dateTimeProvider.now(),
});

// ユーザー情報更新関数（純粋関数）
export const updateUser = (
  user: User,
  updates: {
    email?: Email;
    role?: UserRole;
  },
  dateTimeProvider: DateTimeProvider
): User => ({
  ...user,
  ...updates,
  updatedAt: dateTimeProvider.now(),
});

// ユーザー検証関数（純粋関数）
export const validateUser = (user: User): Result<User, AuthenticationError> => {
  if (!user.id || user.id.length === 0) {
    return {
      success: false,
      error: new AuthenticationError("User ID is required", "INVALID_CREDENTIALS"),
    };
  }

  if (!user.email || !user.email.value) {
    return {
      success: false,
      error: new AuthenticationError("Email is required", "INVALID_CREDENTIALS"),
    };
  }

  if (!user.password || !user.password.hashedValue) {
    return {
      success: false,
      error: new AuthenticationError("Password is required", "INVALID_CREDENTIALS"),
    };
  }

  if (!user.farmId || user.farmId.length === 0) {
    return {
      success: false,
      error: new AuthenticationError("Farm ID is required", "INVALID_CREDENTIALS"),
    };
  }

  return { success: true, data: user };
};

// ユーザー等価性チェック関数（純粋関数）
export const equals = (a: User, b: User): boolean => a.id === b.id;

// ユーザー文字列表現関数（純粋関数）
export const userToString = (user: User): string =>
  `User(id=${user.id}, email=${user.email.value}, role=${user.role})`;
