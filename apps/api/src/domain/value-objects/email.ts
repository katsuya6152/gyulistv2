// Emailバリューオブジェクト

import { Result, AuthenticationError } from '../types/auth';

// Email型
export interface Email {
  readonly value: string;
}

// Email作成関数（純粋関数）
export const createEmail = (value: string): Result<Email, AuthenticationError> => {
  // 基本的なメールアドレス形式チェック
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!value || value.trim().length === 0) {
    return { 
      success: false, 
      error: new AuthenticationError('Email is required', 'INVALID_EMAIL_FORMAT') 
    };
  }
  
  if (!emailRegex.test(value)) {
    return { 
      success: false, 
      error: new AuthenticationError('Invalid email format', 'INVALID_EMAIL_FORMAT') 
    };
  }
  
  if (value.length > 255) {
    return { 
      success: false, 
      error: new AuthenticationError('Email is too long', 'INVALID_EMAIL_FORMAT') 
    };
  }
  
  return { 
    success: true, 
    data: { value: value.toLowerCase().trim() } 
  };
};

// Email比較関数（純粋関数）
export const equals = (a: Email, b: Email): boolean => 
  a.value === b.value;

// Email文字列変換関数（純粋関数）
export const toString = (email: Email): string => email.value;

// Email検証関数（純粋関数）
export const isValid = (email: Email): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.value);
};
