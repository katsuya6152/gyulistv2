// 認証関連のドメイン関数

import { User, createUser } from '../entities/user';
import { Farm, createFarm } from '../entities/farm';
import { Email, createEmail } from '../value-objects/email';
import { Password, createPassword, verifyPassword } from '../value-objects/password';
import { 
  UserId, 
  FarmId, 
  UserRole, 
  AccessToken, 
  RefreshToken, 
  AuthResult, 
  LoginRequest, 
  Result, 
  AuthenticationError 
} from '../types/auth';
import * as crypto from 'crypto';

// ログイン処理関数（純粋関数）
export const authenticateUser = (
  email: Email,
  password: Password,
  user: User
): Result<AuthResult, AuthenticationError> => {
  // パスワード検証（平文パスワードを検証）
  if (!verifyPassword(password.hashedValue, user.password)) {
    return { 
      success: false, 
      error: new AuthenticationError('Invalid credentials', 'INVALID_CREDENTIALS') 
    };
  }
  
  // アクセストークン生成
  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);
  
  return {
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email.value,
        role: user.role,
        farmId: user.farmId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      accessToken,
      refreshToken,
      expiresIn: 3600 // 1時間
    }
  };
};

// アクセストークン生成関数（純粋関数）
export const generateAccessToken = (userId: UserId): AccessToken => {
  const payload = {
    userId,
    type: 'access',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600 // 1時間
  };
  
  const token = Buffer.from(JSON.stringify(payload)).toString('base64');
  return token as AccessToken;
};

// リフレッシュトークン生成関数（純粋関数）
export const generateRefreshToken = (userId: UserId): RefreshToken => {
  const payload = {
    userId,
    type: 'refresh',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 604800 // 7日
  };
  
  const token = Buffer.from(JSON.stringify(payload)).toString('base64');
  return token as RefreshToken;
};

// トークン検証関数（純粋関数）
export const verifyToken = (token: string): Result<{ userId: UserId; type: string }, AuthenticationError> => {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());
    
    if (!payload.userId || !payload.type) {
      return { 
        success: false, 
        error: new AuthenticationError('Invalid token format', 'INVALID_TOKEN') 
      };
    }
    
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return { 
        success: false, 
        error: new AuthenticationError('Token expired', 'TOKEN_EXPIRED') 
      };
    }
    
    return { 
      success: true, 
      data: { userId: payload.userId, type: payload.type } 
    };
  } catch (error) {
    return { 
      success: false, 
      error: new AuthenticationError('Invalid token', 'INVALID_TOKEN') 
    };
  }
};

// ログインリクエスト検証関数（純粋関数）
export const validateLoginRequest = (request: LoginRequest): Result<{ email: Email; password: Password }, AuthenticationError> => {
  // メールアドレス検証
  const emailResult = createEmail(request.email);
  if (!emailResult.success) {
    return { success: false, error: emailResult.error };
  }
  
  // パスワード検証（ログイン時は平文パスワードを受け取る）
  if (!request.password || request.password.length === 0) {
    return { 
      success: false, 
      error: new AuthenticationError('Password is required', 'INVALID_CREDENTIALS') 
    };
  }
  
  // ログイン時は平文パスワードをそのまま使用（ハッシュ化はしない）
  const password: Password = { hashedValue: request.password };
  
  return { 
    success: true, 
    data: { email: emailResult.data, password } 
  };
};

// ユーザー登録関数（純粋関数）
export const registerUser = (
  email: string,
  password: string,
  farmName: string,
  role: UserRole = 'farmer'
): Result<{ user: User; farm: Farm }, AuthenticationError> => {
  // メールアドレス検証
  const emailResult = createEmail(email);
  if (!emailResult.success) {
    return { success: false, error: emailResult.error };
  }
  
  // パスワード検証・ハッシュ化
  const passwordResult = createPassword(password);
  if (!passwordResult.success) {
    return { success: false, error: passwordResult.error };
  }
  
  // 農場作成
  const farmResult = createFarm(farmName);
  if (!farmResult.success) {
    return { success: false, error: farmResult.error };
  }
  
  // ユーザー作成
  const user = createUser(
    emailResult.data,
    passwordResult.data,
    role,
    farmResult.data.id
  );
  
  return { 
    success: true, 
    data: { user, farm: farmResult.data } 
  };
};

// パスワードリセットトークン生成関数（純粋関数）
export const generatePasswordResetToken = (userId: UserId): string => {
  const payload = {
    userId,
    type: 'password_reset',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 1800 // 30分
  };
  
  return Buffer.from(JSON.stringify(payload)).toString('base64');
};

// パスワードリセットトークン検証関数（純粋関数）
export const verifyPasswordResetToken = (token: string): Result<UserId, AuthenticationError> => {
  const result = verifyToken(token);
  if (!result.success) {
    return { success: false, error: result.error };
  }
  
  if (result.data.type !== 'password_reset') {
    return { 
      success: false, 
      error: new AuthenticationError('Invalid token type', 'INVALID_TOKEN') 
    };
  }
  
  return { success: true, data: result.data.userId };
};
