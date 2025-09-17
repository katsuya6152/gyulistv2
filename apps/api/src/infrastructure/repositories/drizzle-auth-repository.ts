// Drizzleを使用した認証リポジトリ実装

import { eq } from "drizzle-orm";
import { farms, users } from "../../db/schema";
import type { AuthRepository } from "../../domain/contracts/repositories";
import type { Farm } from "../../domain/entities/farm";
import type { User } from "../../domain/entities/user";
import type { UserId } from "../../domain/types/auth";
import type { FarmId } from "../../domain/types/auth";
import { AuthenticationError, type Result } from "../../domain/types/auth";
import type { Email } from "../../domain/value-objects/email";
import { createPasswordFromHash } from "../../domain/value-objects/password";
import { db } from "../database/connection";

export class DrizzleAuthRepository implements AuthRepository {
  async findUserByEmail(email: Email): Promise<Result<User | null, AuthenticationError>> {
    try {
      const result = await db.select().from(users).where(eq(users.email, email.value)).limit(1);

      if (result.length === 0) {
        return { success: true, data: null };
      }

      const userData = result[0];
      const user = this.mapToUser(userData);

      return { success: true, data: user };
    } catch {
      return {
        success: false,
        error: new AuthenticationError("Database error", "INVALID_CREDENTIALS"),
      };
    }
  }

  async findUserWithFarm(
    userId: UserId
  ): Promise<Result<{ user: User; farm: Farm } | null, AuthenticationError>> {
    try {
      const result = await db
        .select({
          user: users,
          farm: farms,
        })
        .from(users)
        .innerJoin(farms, eq(users.farmId, farms.id))
        .where(eq(users.id, userId))
        .limit(1);

      if (result.length === 0) {
        return { success: true, data: null };
      }

      const { user: userData, farm: farmData } = result[0];
      const user = this.mapToUser(userData);
      const farm = this.mapToFarm(farmData);

      return { success: true, data: { user, farm } };
    } catch {
      return {
        success: false,
        error: new AuthenticationError("Database error", "INVALID_CREDENTIALS"),
      };
    }
  }

  async saveUserWithFarm(
    user: User,
    farm: Farm
  ): Promise<Result<{ user: User; farm: Farm }, AuthenticationError>> {
    try {
      // トランザクションでユーザーと農場を保存
      await db.transaction(async (tx) => {
        // 農場を先に保存
        await tx.insert(farms).values({
          id: farm.id,
          farmName: farm.farmName,
          address: farm.address || null,
          phoneNumber: farm.phoneNumber || null,
          createdAt: farm.createdAt,
          updatedAt: farm.updatedAt,
        });

        // ユーザーを保存
        await tx.insert(users).values({
          id: user.id,
          email: user.email.value,
          passwordHash: user.password.hashedValue,
          role: user.role,
          farmId: user.farmId,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        });
      });

      return { success: true, data: { user, farm } };
    } catch {
      return {
        success: false,
        error: new AuthenticationError("Failed to save user data", "INVALID_CREDENTIALS"),
      };
    }
  }

  private mapToUser(data: any): User {
    return {
      id: data.id as UserId,
      email: { value: data.email } as Email,
      password: createPasswordFromHash(data.passwordHash),
      role: data.role,
      farmId: data.farmId as FarmId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  private mapToFarm(data: any): Farm {
    return {
      id: data.id as FarmId,
      farmName: data.farmName,
      address: data.address || undefined,
      phoneNumber: data.phoneNumber || undefined,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }
}
