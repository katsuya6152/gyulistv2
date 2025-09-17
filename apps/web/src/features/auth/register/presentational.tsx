"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { type RegisterFormData, registerSchema } from "./schema";

interface RegisterPresentationProps {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export default function RegisterPresentation({ error, fieldErrors }: RegisterPresentationProps) {
  const [formData, setFormData] = useState<RegisterFormData>({
    email: "",
    password: "",
    confirmPassword: "",
    farmName: "",
    role: "farmer",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // クライアントサイドバリデーション
    const fieldValidation = registerSchema.safeParse({
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
    const validation = registerSchema.safeParse(formData);
    if (!validation.success) {
      setValidationErrors(validation.error.flatten().fieldErrors);
      setIsLoading(false);
      return;
    }

    try {
      // Server Actionを呼び出し
      const form = e.currentTarget as HTMLFormElement;
      const formDataObj = new FormData(form);

      const { registerAction } = await import("./actions");
      const result = await registerAction(formDataObj);

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
      console.error("Registration error:", error);
      setValidationErrors({ general: ["登録に失敗しました"] });
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
            <CardTitle>新規登録</CardTitle>
            <CardDescription>アカウント情報を入力してください</CardDescription>
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
                  placeholder="8文字以上で入力"
                  required
                  disabled={isLoading}
                  aria-describedby={displayErrors.password ? "password-error" : undefined}
                  autoComplete="new-password"
                />
                {displayErrors.password && (
                  <p id="password-error" className="text-sm text-red-600">
                    {displayErrors.password[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">パスワード確認</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="パスワードを再入力"
                  required
                  disabled={isLoading}
                  aria-describedby={
                    displayErrors.confirmPassword ? "confirmPassword-error" : undefined
                  }
                  autoComplete="new-password"
                />
                {displayErrors.confirmPassword && (
                  <p id="confirmPassword-error" className="text-sm text-red-600">
                    {displayErrors.confirmPassword[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="farmName">農場名</Label>
                <Input
                  id="farmName"
                  name="farmName"
                  type="text"
                  value={formData.farmName}
                  onChange={handleInputChange}
                  placeholder="農場名を入力"
                  required
                  disabled={isLoading}
                  aria-describedby={displayErrors.farmName ? "farmName-error" : undefined}
                  autoComplete="organization"
                />
                {displayErrors.farmName && (
                  <p id="farmName-error" className="text-sm text-red-600">
                    {displayErrors.farmName[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">権限</Label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                >
                  <option value="farmer">農家</option>
                  <option value="admin">管理者</option>
                  <option value="viewer">閲覧者</option>
                </select>
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
                    登録中...
                  </div>
                ) : (
                  "新規登録"
                )}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                既にアカウントをお持ちの方は{" "}
                <a href="/login" className="text-blue-600 hover:text-blue-500">
                  ログイン
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
