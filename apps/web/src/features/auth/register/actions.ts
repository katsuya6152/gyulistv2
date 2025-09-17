"use server";

import { authService } from "@/services/authService";
import { cookies } from "next/headers";
import { registerSchema } from "./schema";

export async function registerAction(formData: FormData) {
  // 1. フォームデータを解析
  const rawData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
    farmName: formData.get("farmName") as string,
    role: (formData.get("role") as string) || "farmer",
  };

  // 2. バリデーション
  const validationResult = registerSchema.safeParse(rawData);

  if (!validationResult.success) {
    return {
      success: false,
      errors: validationResult.error.flatten().fieldErrors,
    };
  }

  try {
    // 3. API呼び出し
    const response = await authService.register(validationResult.data);

    if (
      response.success &&
      response.data &&
      response.data.accessToken &&
      response.data.refreshToken &&
      response.data.user
    ) {
      // 4. トークンをCookieに保存（セキュア）
      const cookieStore = cookies();
      cookieStore.set("accessToken", response.data.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: response.data.expiresIn,
      });
      cookieStore.set("refreshToken", response.data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7日
      });
      cookieStore.set("user", JSON.stringify(response.data.user), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: response.data.expiresIn,
      });

      // 5. 成功時は成功フラグを返す（クライアントサイドでリダイレクト）
      return {
        success: true,
        redirectTo: "/dashboard",
      };
    }

    return {
      success: false,
      error: "登録に失敗しました",
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "登録に失敗しました",
    };
  }
}
