// トークン生成ドメインサービス

import type { AccessToken, RefreshToken, UserId } from "../types/auth";
import type { DateTimeProvider } from "./date-time";

// トークン生成サービス（純粋関数）
export interface TokenGenerator {
  generateAccessToken(userId: UserId): AccessToken;
  generateRefreshToken(userId: UserId): RefreshToken;
  verifyToken(token: string): {
    success: boolean;
    data?: { userId: UserId; type: string };
    error?: string;
  };
}

// JWT風のトークン生成実装
export const createTokenGenerator = (dateTimeProvider: DateTimeProvider): TokenGenerator => ({
  generateAccessToken: (userId: UserId): AccessToken => {
    const payload = {
      userId,
      type: "access",
      iat: dateTimeProvider.timestamp(),
      exp: dateTimeProvider.timestamp() + 3600, // 1時間
    };

    const token = Buffer.from(JSON.stringify(payload)).toString("base64");
    return token as AccessToken;
  },

  generateRefreshToken: (userId: UserId): RefreshToken => {
    const payload = {
      userId,
      type: "refresh",
      iat: dateTimeProvider.timestamp(),
      exp: dateTimeProvider.timestamp() + 604800, // 7日
    };

    const token = Buffer.from(JSON.stringify(payload)).toString("base64");
    return token as RefreshToken;
  },

  verifyToken: (
    token: string
  ): { success: boolean; data?: { userId: UserId; type: string }; error?: string } => {
    try {
      const payload = JSON.parse(Buffer.from(token, "base64").toString());

      if (!payload.userId || !payload.type) {
        return {
          success: false,
          error: "Invalid token format",
        };
      }

      if (payload.exp && payload.exp < dateTimeProvider.timestamp()) {
        return {
          success: false,
          error: "Token expired",
        };
      }

      return {
        success: true,
        data: { userId: payload.userId, type: payload.type },
      };
    } catch {
      return {
        success: false,
        error: "Invalid token",
      };
    }
  },
});
