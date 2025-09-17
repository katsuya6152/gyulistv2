// 認証APIルート

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { LoginUseCase, RegisterUseCase, VerifyTokenUseCase } from '../../application/use-cases/auth/login';
import { DrizzleAuthRepository } from '../../infrastructure/repositories/drizzle-auth-repository';

const auth = new Hono();

// リポジトリのインスタンス化
const authRepository = new DrizzleAuthRepository();

// ログインリクエストのスキーマ
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

// ユーザー登録リクエストのスキーマ
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  farmName: z.string().min(1, 'Farm name is required'),
  role: z.enum(['farmer', 'admin', 'viewer']).optional().default('farmer')
});

// ログインエンドポイント
auth.post(
  '/login',
  zValidator('json', loginSchema),
  async (c) => {
    try {
      const body = c.req.valid('json');
      
      const loginUseCase = new LoginUseCase(authRepository);
      const result = await loginUseCase.execute(body);
      
      if (!result.success) {
        return c.json(
          { 
            success: false, 
            error: result.error 
          }, 
          401
        );
      }
      
      return c.json({
        success: true,
        data: {
          user: result.data?.user,
          accessToken: result.data?.accessToken,
          refreshToken: result.data?.refreshToken,
          expiresIn: result.data?.expiresIn
        }
      });
    } catch (error) {
      return c.json(
        { 
          success: false, 
          error: 'Internal server error' 
        }, 
        500
      );
    }
  }
);

// ユーザー登録エンドポイント
auth.post(
  '/register',
  zValidator('json', registerSchema),
  async (c) => {
    try {
      const body = c.req.valid('json');
      
      const registerUseCase = new RegisterUseCase(authRepository);
      const result = await registerUseCase.execute(body);
      
      if (!result.success) {
        return c.json(
          { 
            success: false, 
            error: result.error 
          }, 
          400
        );
      }
      
      return c.json({
        success: true,
        data: {
          user: result.data?.user,
          accessToken: result.data?.accessToken,
          refreshToken: result.data?.refreshToken,
          expiresIn: result.data?.expiresIn
        }
      });
    } catch (error) {
      return c.json(
        { 
          success: false, 
          error: 'Internal server error' 
        }, 
        500
      );
    }
  }
);

// トークン検証エンドポイント
auth.get(
  '/verify',
  async (c) => {
    try {
      const authHeader = c.req.header('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json(
          { 
            success: false, 
            error: 'Authorization header required' 
          }, 
          401
        );
      }
      
      const token = authHeader.substring(7);
      const verifyUseCase = new VerifyTokenUseCase(authRepository);
      const result = await verifyUseCase.execute(token);
      
      if (!result.success) {
        return c.json(
          { 
            success: false, 
            error: result.error.message 
          }, 
          401
        );
      }
      
      return c.json({
        success: true,
        data: {
          user: result.data.user,
          farm: result.data.farm
        }
      });
    } catch (error) {
      return c.json(
        { 
          success: false, 
          error: 'Internal server error' 
        }, 
        500
      );
    }
  }
);

// ログアウトエンドポイント
auth.post(
  '/logout',
  async (c) => {
    // クライアント側でトークンを削除するため、サーバー側では特別な処理は不要
    return c.json({
      success: true,
      message: 'Logged out successfully'
    });
  }
);

export default auth;
