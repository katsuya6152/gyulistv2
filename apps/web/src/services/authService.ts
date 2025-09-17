import { client } from "@/lib/api-client";
import type { InferRequestType, InferResponseType } from "hono/client";

// 型推論を使用してリクエスト・レスポンス型を取得
type LoginRequest = InferRequestType<typeof client.api.v2.auth.login.$post>["json"];
type LoginResponse = InferResponseType<typeof client.api.v2.auth.login.$post>;

type RegisterRequest = InferRequestType<typeof client.api.v2.auth.register.$post>["json"];
type RegisterResponse = InferResponseType<typeof client.api.v2.auth.register.$post>;

type VerifyResponse = InferResponseType<typeof client.api.v2.auth.verify.$get>;

class AuthService {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await client.api.v2.auth.login.$post({
      json: data,
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Login failed");
    }

    return result;
  }

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await client.api.v2.auth.register.$post({
      json: data,
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Registration failed");
    }

    return result;
  }

  async verifyToken(token: string): Promise<VerifyResponse> {
    const response = await client.api.v2.auth.verify.$get({
      header: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Token verification failed");
    }

    return result;
  }
}

export const authService = new AuthService();
