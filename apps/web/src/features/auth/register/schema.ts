import { z } from 'zod';

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'メールアドレスを入力してください')
    .email('有効なメールアドレスを入力してください'),
  password: z
    .string()
    .min(1, 'パスワードを入力してください')
    .min(8, 'パスワードは8文字以上で入力してください'),
  confirmPassword: z
    .string()
    .min(1, 'パスワード確認を入力してください'),
  farmName: z
    .string()
    .min(1, '農場名を入力してください')
    .min(2, '農場名は2文字以上で入力してください'),
  role: z.enum(['farmer', 'admin', 'viewer']).default('farmer'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'パスワードが一致しません',
  path: ['confirmPassword'],
});

export type RegisterFormData = z.infer<typeof registerSchema>;

export const registerResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    user: z.object({
      id: z.string(),
      email: z.string(),
      role: z.string(),
      farmId: z.string(),
      createdAt: z.string(),
      updatedAt: z.string(),
    }),
    accessToken: z.string(),
    refreshToken: z.string(),
    expiresIn: z.number(),
  }).optional(),
  error: z.string().optional(),
  code: z.string().optional(),
});

export type RegisterResponse = z.infer<typeof registerResponseSchema>;
