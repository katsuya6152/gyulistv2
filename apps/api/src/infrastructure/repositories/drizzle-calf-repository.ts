import { and, asc, desc, eq, gte, isNotNull, lte } from "drizzle-orm";
import { db } from "../../db/connection";
import { calves, cows } from "../../db/schema";
import type { CalfRepository, RepositoryError, Result } from "../../domain/contracts/calf-repository";
import type { Calf } from "../../domain/entities/calf";
import type { GetCalfShipmentsParams, GetCalfShipmentsResponse } from "../../domain/types/calf-shipment";

export class DrizzleCalfRepository implements CalfRepository {
  async findShipments(params: GetCalfShipmentsParams): Promise<Result<GetCalfShipmentsResponse, RepositoryError>> {
    try {
      const limit = params.limit || 20;
      const offset = params.cursor ? Number.parseInt(Buffer.from(params.cursor, "base64").toString()) : 0;

      // 出荷済みの子牛のみを取得（auctionDate IS NOT NULL）
      const whereConditions = [eq(calves.farmId, params.farmId), isNotNull(calves.auctionDate)];

      if (params.gender) {
        whereConditions.push(eq(calves.gender, params.gender));
      }

      if (params.startDate) {
        whereConditions.push(gte(calves.auctionDate, params.startDate));
      }

      if (params.endDate) {
        whereConditions.push(lte(calves.auctionDate, params.endDate));
      }

      // 子牛と母牛をJOINして取得
      const results = await db
        .select({
          id: calves.id,
          individualNumber: calves.individualNumber,
          calfName: calves.calfName,
          damName: cows.name,
          damId: calves.cowId,
          damIndividualNumber: cows.individualNumber,
          birthDate: calves.birthDate,
          gender: calves.gender,
          weight: calves.weight,
          auctionDate: calves.auctionDate,
          price: calves.price,
          buyer: calves.buyer,
          remarks: calves.remarks,
          farmId: calves.farmId,
          healthStatus: calves.healthStatus,
          createdAt: calves.createdAt,
          updatedAt: calves.updatedAt,
        })
        .from(calves)
        .leftJoin(cows, eq(calves.cowId, cows.id))
        .where(and(...whereConditions))
        .orderBy(desc(calves.auctionDate))
        .limit(limit + 1)
        .offset(offset);

      const hasNext = results.length > limit;
      const calvesData = hasNext ? results.slice(0, limit) : results;

      // 総件数を取得
      const totalCount = await db
        .select({ count: calves.id })
        .from(calves)
        .where(and(...whereConditions));

      const response: GetCalfShipmentsResponse = {
        calves: calvesData.map(this.mapToCalf),
        pagination: {
          hasNext,
          nextCursor: hasNext ? Buffer.from((offset + limit).toString()).toString("base64") : undefined,
          total: totalCount.length,
          loaded: offset + calvesData.length,
        },
      };

      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Failed to fetch calf shipments",
          details: { error: error instanceof Error ? error.message : "Unknown error" },
        },
      };
    }
  }

  async findById(id: string): Promise<Result<Calf | null, RepositoryError>> {
    try {
      const result = await db.select().from(calves).where(eq(calves.id, id)).limit(1);

      if (result.length === 0) {
        return { success: true, data: null };
      }

      return { success: true, data: this.mapToCalf(result[0]) };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Failed to find calf by ID",
          details: { error: error instanceof Error ? error.message : "Unknown error" },
        },
      };
    }
  }

  async findByFarmId(farmId: string): Promise<Result<Calf[], RepositoryError>> {
    try {
      const results = await db.select().from(calves).where(eq(calves.farmId, farmId)).orderBy(desc(calves.createdAt));

      return { success: true, data: results.map(this.mapToCalf) };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Failed to find calves by farm ID",
          details: { error: error instanceof Error ? error.message : "Unknown error" },
        },
      };
    }
  }

  async findByCowId(cowId: string): Promise<Result<Calf[], RepositoryError>> {
    try {
      const results = await db.select().from(calves).where(eq(calves.cowId, cowId)).orderBy(desc(calves.birthDate));

      return { success: true, data: results.map(this.mapToCalf) };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Failed to find calves by cow ID",
          details: { error: error instanceof Error ? error.message : "Unknown error" },
        },
      };
    }
  }

  async save(calf: Calf): Promise<Result<Calf, RepositoryError>> {
    try {
      const result = await db
        .insert(calves)
        .values({
          individualNumber: calf.individualNumber,
          calfName: calf.calfName,
          damName: calf.damName,
          cowId: calf.damId,
          birthDate: calf.birthDate,
          gender: calf.gender,
          weight: calf.weight?.toString(),
          auctionDate: calf.auctionDate,
          price: calf.price?.toString(),
          buyer: calf.buyer,
          remarks: calf.remarks,
          farmId: calf.farmId,
          healthStatus: calf.healthStatus,
        })
        .returning();

      return { success: true, data: this.mapToCalf(result[0]) };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Failed to save calf",
          details: { error: error instanceof Error ? error.message : "Unknown error" },
        },
      };
    }
  }

  async update(calf: Calf): Promise<Result<Calf, RepositoryError>> {
    try {
      const result = await db
        .update(calves)
        .set({
          individualNumber: calf.individualNumber,
          calfName: calf.calfName,
          damName: calf.damName,
          cowId: calf.damId,
          birthDate: calf.birthDate,
          gender: calf.gender,
          weight: calf.weight?.toString(),
          auctionDate: calf.auctionDate,
          price: calf.price?.toString(),
          buyer: calf.buyer,
          remarks: calf.remarks,
          farmId: calf.farmId,
          healthStatus: calf.healthStatus,
          updatedAt: new Date(calf.updatedAt),
        })
        .where(eq(calves.id, calf.id))
        .returning();

      if (result.length === 0) {
        return {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Calf not found",
          },
        };
      }

      return { success: true, data: this.mapToCalf(result[0]) };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Failed to update calf",
          details: { error: error instanceof Error ? error.message : "Unknown error" },
        },
      };
    }
  }

  async delete(id: string): Promise<Result<void, RepositoryError>> {
    try {
      const result = await db.delete(calves).where(eq(calves.id, id)).returning();

      if (result.length === 0) {
        return {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Calf not found",
          },
        };
      }

      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Failed to delete calf",
          details: { error: error instanceof Error ? error.message : "Unknown error" },
        },
      };
    }
  }

  async batchUpdate(
    updates: Array<{ id: string; calf: Partial<Calf> }>
  ): Promise<Result<Array<{ id: string; success: boolean; error?: string }>, RepositoryError>> {
    try {
      const results = [];

      for (const update of updates) {
        try {
          const updateData: Record<string, unknown> = {};
          if (update.calf.weight !== undefined) updateData.weight = update.calf.weight?.toString() || null;
          if (update.calf.auctionDate !== undefined) updateData.auctionDate = update.calf.auctionDate;
          if (update.calf.price !== undefined) updateData.price = update.calf.price?.toString() || null;
          if (update.calf.buyer !== undefined) updateData.buyer = update.calf.buyer;
          if (update.calf.remarks !== undefined) updateData.remarks = update.calf.remarks;
          updateData.updatedAt = new Date();

          const result = await db.update(calves).set(updateData).where(eq(calves.id, update.id)).returning();

          results.push({
            id: update.id,
            success: result.length > 0,
          });
        } catch (error) {
          results.push({
            id: update.id,
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      return { success: true, data: results };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Failed to batch update calves",
          details: { error: error instanceof Error ? error.message : "Unknown error" },
        },
      };
    }
  }

  private mapToCalf(row: Record<string, unknown>): Calf {
    // 日齢計算関数
    const calculateAgeInDays = (birthDate: string): number => {
      const birth = new Date(birthDate);
      const now = new Date();
      const diffTime = now.getTime() - birth.getTime();
      return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    };

    return {
      id: row.id as string,
      individualNumber: row.individualNumber as string,
      calfName: row.calfName as string,
      damName: row.damName as string | null,
      damId: row.damId as string,
      damIndividualNumber: row.damIndividualNumber as string | null,
      birthDate: row.birthDate as string,
      // 血統情報
      sirePedigree: row.sirePedigree as string | null,
      maternalGrandsire: row.maternalGrandsire as string | null,
      maternalGreatGrandsire: row.maternalGreatGrandsire as string | null,
      maternalGreatGreatGrandsire: row.maternalGreatGreatGrandsire as string | null,
      // 繁殖・出産情報
      matingDate: row.matingDate as string | null,
      expectedBirthDate: row.expectedBirthDate as string | null,
      auctionDate: row.auctionDate as string | null,
      matingInterval: row.matingInterval ? Number.parseFloat(row.matingInterval as string) : null,
      // 個体情報
      weight: row.weight ? Number.parseFloat(row.weight as string) : null,
      ageInDays: calculateAgeInDays(row.birthDate as string),
      gender: row.gender as "MALE" | "FEMALE" | "CASTRATED",
      // 取引情報
      price: row.price ? Number.parseFloat(row.price as string) : null,
      buyer: row.buyer as string | null,
      remarks: row.remarks as string | null,
      farmId: row.farmId as string,
      healthStatus: row.healthStatus as string,
      createdAt: (row.createdAt as Date).toISOString(),
      updatedAt: (row.updatedAt as Date).toISOString(),
    };
  }
}
