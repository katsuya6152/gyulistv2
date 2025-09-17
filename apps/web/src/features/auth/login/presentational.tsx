"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { type LoginFormData, loginSchema } from "./schema";

interface LoginPresentationProps {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export default function LoginPresentation({ error, fieldErrors }: LoginPresentationProps) {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // クライアントサイドバリデーション
    const fieldValidation = loginSchema.safeParse({
      ...formData,
      [name]: value,
    });

    if (!fieldValidation.success) {
      const fieldError = fieldValidation.error.flatten().fieldErrors;
      setValidationErrors((prev) => ({
        ...prev,
        [name]: fieldError[name as keyof typeof fieldError] || [],
      }));
    } else {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof typeof newErrors];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // クライアントサイドバリデーション
    const validation = loginSchema.safeParse(formData);
    if (!validation.success) {
      setValidationErrors(validation.error.flatten().fieldErrors);
      setIsLoading(false);
      return;
    }

    try {
      // Server Actionを呼び出し
      const form = e.currentTarget as HTMLFormElement;
      const formDataObj = new FormData(form);

      const { loginAction } = await import("./actions");
      const result = await loginAction(formDataObj);

      if (result?.success) {
        // 成功時はリダイレクト
        if (result.redirectTo) {
          window.location.href = result.redirectTo;
        }
      } else if (result && !result.success) {
        if (result.errors) {
          setValidationErrors(result.errors);
        } else if (result.error) {
          setValidationErrors({ general: [result.error] });
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      setValidationErrors({ general: ["ログインに失敗しました"] });
    } finally {
      setIsLoading(false);
    }
  };

  const displayErrors = fieldErrors || validationErrors;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">ギュウリスト</h1>
          <p className="mt-2 text-sm text-gray-600">和牛繁殖農家向け管理システム</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>ログイン</CardTitle>
            <CardDescription>メールアドレスとパスワードを入力してください</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {(error || displayErrors.general?.length) && (
                <Alert variant="destructive" role="alert" id="error-message">
                  <AlertDescription>{error || displayErrors.general?.[0]}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="example@example.com"
                  required
                  disabled={isLoading}
                  aria-describedby={displayErrors.email ? "email-error" : undefined}
                  autoComplete="email"
                />
                {displayErrors.email && (
                  <p id="email-error" className="text-sm text-red-600">
                    {displayErrors.email[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">パスワード</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="パスワードを入力"
                  required
                  disabled={isLoading}
                  aria-describedby={displayErrors.password ? "password-error" : undefined}
                  autoComplete="current-password"
                />
                {displayErrors.password && (
                  <p id="password-error" className="text-sm text-red-600">
                    {displayErrors.password[0]}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                aria-disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    ログイン中...
                  </div>
                ) : (
                  "ログイン"
                )}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                アカウントをお持ちでない方は{" "}
                <a href="/register" className="text-blue-600 hover:text-blue-500">
                  新規登録
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
