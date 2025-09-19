// 分析概要データ取得ユースケース（DDD+関数型+オニオンアーキテクチャ）

import type { CalfRepository } from "../../../domain/contracts/calf-repository";
import type { AnalyticsFilter, AnalyticsStats } from "../../../domain/entities/analytics";
import { createAnalyticsFilter } from "../../../domain/entities/analytics";
import type { AnalyticsService } from "../../../domain/services/analytics";

// ユースケースエラー型
export interface UseCaseError {
  readonly code: string;
  readonly message: string;
  readonly details?: Record<string, unknown>;
}

// Result型
export type Result<T, E = UseCaseError> = { success: true; data: T } | { success: false; error: E };

// 入力パラメータ
export interface GetAnalyticsOverviewInput {
  readonly farmId: string;
  readonly startDate?: string;
  readonly endDate?: string;
  readonly gender?: "MALE" | "FEMALE" | "CASTRATED";
  readonly pedigree?: string;
  readonly priceRange?: {
    readonly min: number;
    readonly max: number;
  };
  readonly ageRange?: {
    readonly min: number;
    readonly max: number;
  };
}

export class GetAnalyticsOverviewUseCase {
  constructor(
    private readonly calfRepository: CalfRepository,
    private readonly analyticsService: AnalyticsService
  ) {}

  async execute(input: GetAnalyticsOverviewInput): Promise<Result<AnalyticsStats, UseCaseError>> {
    try {
      // バリデーション
      const validationResult = this.validateInput(input);
      if (!validationResult.success) {
        return validationResult;
      }

      // 子牛データを取得
      const calvesResult = await this.calfRepository.findByFarmId(input.farmId);
      if (!calvesResult.success) {
        return {
          success: false,
          error: {
            code: "REPOSITORY_ERROR",
            message: "子牛データの取得に失敗しました",
            details: { repositoryError: calvesResult.error },
          },
        };
      }

      // フィルタリング
      const filter = createAnalyticsFilter({
        farmId: input.farmId,
        startDate: input.startDate,
        endDate: input.endDate,
        gender: input.gender,
        pedigree: input.pedigree,
        priceRange: input.priceRange,
        ageRange: input.ageRange,
      });

      const filteredCalves = this.analyticsService.filterCalves(calvesResult.data, filter);

      // 基本統計を計算
      const stats = this.analyticsService.calculateBasicStats(filteredCalves);

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      console.error("GetAnalyticsOverviewUseCase error:", error);
      return {
        success: false,
        error: {
          code: "UNKNOWN_ERROR",
          message: "分析データの取得に失敗しました",
          details: { error: error instanceof Error ? error.message : "Unknown error" },
        },
      };
    }
  }

  private validateInput(input: GetAnalyticsOverviewInput): Result<true, UseCaseError> {
    if (!input.farmId) {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "農場IDは必須です",
        },
      };
    }

    if (input.startDate && input.endDate && input.startDate > input.endDate) {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "開始日は終了日より前である必要があります",
        },
      };
    }

    if (input.priceRange && input.priceRange.min > input.priceRange.max) {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "価格の最小値は最大値より小さい必要があります",
        },
      };
    }

    if (input.ageRange && input.ageRange.min > input.ageRange.max) {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "年齢の最小値は最大値より小さい必要があります",
        },
      };
    }

    return { success: true, data: true };
  }
}
