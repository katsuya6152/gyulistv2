// Passwordバリューオブジェクト

import { Result, AuthenticationError } from '../types/auth';
import * as crypto from 'crypto';

// Password型
export interface Password {
  readonly hashedValue: string;
}

// パスワード作成関数（純粋関数）
export const createPassword = (plainPassword: string): Result<Password, AuthenticationError> => {
  if (!plainPassword || plainPassword.length === 0) {
    return { 
      success: false, 
      error: new AuthenticationError('Password is required', 'PASSWORD_TOO_SHORT') 
    };
  }
  
  if (plainPassword.length < 8) {
    return { 
      success: false, 
      error: new AuthenticationError('Password must be at least 8 characters', 'PASSWORD_TOO_SHORT') 
    };
  }
  
  if (plainPassword.length > 128) {
    return { 
      success: false, 
      error: new AuthenticationError('Password is too long', 'PASSWORD_TOO_SHORT') 
    };
  }
  
  // パスワードのハッシュ化
  const hashedValue = hashPassword(plainPassword);
  
  return { 
    success: true, 
    data: { hashedValue } 
  };
};

// 既存のハッシュ化されたパスワードからPasswordオブジェクトを作成
export const createPasswordFromHash = (hashedValue: string): Password => ({
  hashedValue
});

// パスワードハッシュ化関数（純粋関数）
export const hashPassword = (plainPassword: string): string => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(plainPassword, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
};

// パスワード検証関数（純粋関数）
export const verifyPassword = (plainPassword: string, password: Password): boolean => {
  const [salt, hash] = password.hashedValue.split(':');
  const hashToVerify = crypto.pbkdf2Sync(plainPassword, salt, 10000, 64, 'sha512').toString('hex');
  return hash === hashToVerify;
};

// パスワード比較関数（純粋関数）
export const equals = (a: Password, b: Password): boolean => 
  a.hashedValue === b.hashedValue;

// パスワード強度チェック関数（純粋関数）
export const checkPasswordStrength = (plainPassword: string): {
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;
  
  if (plainPassword.length >= 8) score += 1;
  else feedback.push('Use at least 8 characters');
  
  if (plainPassword.length >= 12) score += 1;
  
  if (/[a-z]/.test(plainPassword)) score += 1;
  else feedback.push('Use lowercase letters');
  
  if (/[A-Z]/.test(plainPassword)) score += 1;
  else feedback.push('Use uppercase letters');
  
  if (/[0-9]/.test(plainPassword)) score += 1;
  else feedback.push('Use numbers');
  
  if (/[^A-Za-z0-9]/.test(plainPassword)) score += 1;
  else feedback.push('Use special characters');
  
  return { score, feedback };
};
