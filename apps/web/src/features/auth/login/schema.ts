import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "メールアドレスを入力してください")
    .email("有効なメールアドレスを入力してください"),
  password: z
    .string()
    .min(1, "パスワードを入力してください")
    .min(8, "パスワードは8文字以上で入力してください"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const loginResponseSchema = z.object({
  success: z.boolean(),
  data: z
    .object({
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
    })
    .optional(),
  error: z.string().optional(),
  code: z.string().optional(),
});

export type LoginResponse = z.infer<typeof loginResponseSchema>;
