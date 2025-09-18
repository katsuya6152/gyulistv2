import { eq } from "drizzle-orm";
import { db } from "../../db/connection";
import { cows } from "../../db/schema";
import type { CowRepository } from "../../domain/contracts/repositories";
import type { Cow } from "../../domain/entities/cow";
import type { AuthError, Result } from "../../domain/types/auth";

export class DrizzleCowRepository implements CowRepository {
  async findById(id: string): Promise<Result<Cow | null, AuthError>> {
    try {
      const result = await db.select().from(cows).where(eq(cows.id, id)).limit(1);

      if (result.length === 0) {
        return { success: true, data: null };
      }

      return { success: true, data: this.mapToCow(result[0]) };
    } catch {
      return {
        success: false,
        error: "USER_NOT_FOUND" as AuthError,
      };
    }
  }

  async findByFarmId(farmId: string): Promise<Result<Cow[], AuthError>> {
    try {
      const results = await db.select().from(cows).where(eq(cows.farmId, farmId));

      return { success: true, data: results.map(this.mapToCow) };
    } catch {
      return {
        success: false,
        error: "USER_NOT_FOUND" as AuthError,
      };
    }
  }

  async save(cow: Cow): Promise<Result<Cow, AuthError>> {
    try {
      const result = await db
        .insert(cows)
        .values({
          individualNumber: cow.individualNumber,
          name: cow.name,
          birthDate: cow.birthDate,
          healthStatus: cow.healthStatus,
          farmId: cow.farmId,
        })
        .returning();

      return { success: true, data: this.mapToCow(result[0]) };
    } catch {
      return {
        success: false,
        error: "USER_NOT_FOUND" as AuthError,
      };
    }
  }

  async update(cow: Cow): Promise<Result<Cow, AuthError>> {
    try {
      const result = await db
        .update(cows)
        .set({
          individualNumber: cow.individualNumber,
          name: cow.name,
          birthDate: cow.birthDate,
          healthStatus: cow.healthStatus,
          farmId: cow.farmId,
          updatedAt: cow.updatedAt,
        })
        .where(eq(cows.id, cow.id))
        .returning();

      if (result.length === 0) {
        return {
          success: false,
          error: "USER_NOT_FOUND" as AuthError,
        };
      }

      return { success: true, data: this.mapToCow(result[0]) };
    } catch {
      return {
        success: false,
        error: "USER_NOT_FOUND" as AuthError,
      };
    }
  }

  async delete(id: string): Promise<Result<void, AuthError>> {
    try {
      const result = await db.delete(cows).where(eq(cows.id, id)).returning();

      if (result.length === 0) {
        return {
          success: false,
          error: "USER_NOT_FOUND" as AuthError,
        };
      }

      return { success: true, data: undefined };
    } catch {
      return {
        success: false,
        error: "USER_NOT_FOUND" as AuthError,
      };
    }
  }

  private mapToCow(row: Record<string, unknown>): Cow {
    return {
      id: row.id as string,
      individualNumber: row.individualNumber as string,
      name: row.name as string,
      birthDate: row.birthDate as string,
      // 血統情報
      sirePedigree: row.sirePedigree as string | null,
      maternalGrandsire: row.maternalGrandsire as string | null,
      maternalGreatGrandsire: row.maternalGreatGrandsire as string | null,
      maternalGreatGreatGrandsire: row.maternalGreatGreatGrandsire as string | null,
      // 母牛情報
      damName: row.damName as string | null,
      damRegistrationNumber: row.damRegistrationNumber as string | null,
      maternalScore: row.maternalScore ? Number.parseFloat(row.maternalScore as string) : null,
      // 登録・識別情報
      registrationSymbolNumber: row.registrationSymbolNumber as string | null,
      producerName: row.producerName as string | null,
      individualIdentificationNumber: row.individualIdentificationNumber as string | null,
      // 日付情報
      auctionDate: row.auctionDate as string | null,
      healthStatus: row.healthStatus as string,
      farmId: row.farmId as string,
      createdAt: row.createdAt as Date,
      updatedAt: row.updatedAt as Date,
    };
  }
}
