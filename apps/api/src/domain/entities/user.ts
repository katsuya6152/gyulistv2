// Userエンティティ

import { UserId, FarmId, UserRole, Result, AuthenticationError } from '../types/auth';
import { Email } from '../value-objects/email';
import { Password } from '../value-objects/password';

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
  farmId: FarmId
): User => ({
  id: generateUserId(),
  email,
  password,
  role,
  farmId,
  createdAt: new Date(),
  updatedAt: new Date()
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
  updatedAt
});

// パスワード更新関数（純粋関数）
export const updatePassword = (user: User, newPassword: Password): User => ({
  ...user,
  password: newPassword,
  updatedAt: new Date()
});

// ユーザー情報更新関数（純粋関数）
export const updateUser = (
  user: User,
  updates: {
    email?: Email;
    role?: UserRole;
  }
): User => ({
  ...user,
  ...updates,
  updatedAt: new Date()
});

// ユーザー検証関数（純粋関数）
export const validateUser = (user: User): Result<User, AuthenticationError> => {
  if (!user.id || user.id.length === 0) {
    return { 
      success: false, 
      error: new AuthenticationError('User ID is required', 'INVALID_CREDENTIALS') 
    };
  }
  
  if (!user.email || !user.email.value) {
    return { 
      success: false, 
      error: new AuthenticationError('Email is required', 'INVALID_CREDENTIALS') 
    };
  }
  
  if (!user.password || !user.password.hashedValue) {
    return { 
      success: false, 
      error: new AuthenticationError('Password is required', 'INVALID_CREDENTIALS') 
    };
  }
  
  if (!user.farmId || user.farmId.length === 0) {
    return { 
      success: false, 
      error: new AuthenticationError('Farm ID is required', 'INVALID_CREDENTIALS') 
    };
  }
  
  return { success: true, data: user };
};

// ユーザーID生成関数（純粋関数）
const generateUserId = (): UserId => {
  // 有効なUUID v4を生成
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
  return uuid as UserId;
};

// ユーザー等価性チェック関数（純粋関数）
export const equals = (a: User, b: User): boolean => 
  a.id === b.id;

// ユーザー文字列表現関数（純粋関数）
export const toString = (user: User): string => 
  `User(id=${user.id}, email=${user.email.value}, role=${user.role})`;
