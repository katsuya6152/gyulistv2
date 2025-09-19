// 分析トレンドデータ取得ユースケース（DDD+関数型+オニオンアーキテクチャ）

import type { CalfRepository } from "../../../domain/contracts/calf-repository";
import type { AnalyticsFilter, TimeSeriesData } from "../../../domain/entities/analytics";
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
export interface GetAnalyticsTrendsInput {
  readonly farmId: string;
  readonly startDate?: string;
  readonly endDate?: string;
  readonly groupBy?: "day" | "week" | "month";
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

export class GetAnalyticsTrendsUseCase {
  constructor(
    private readonly calfRepository: CalfRepository,
    private readonly analyticsService: AnalyticsService
  ) {}

  async execute(input: GetAnalyticsTrendsInput): Promise<Result<TimeSeriesData[], UseCaseError>> {
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

      // 時系列データを計算
      const trends = this.analyticsService.calculateTimeSeriesData(filteredCalves, input.groupBy || "month");

      return {
        success: true,
        data: trends,
      };
    } catch (error) {
      console.error("GetAnalyticsTrendsUseCase error:", error);
      return {
        success: false,
        error: {
          code: "UNKNOWN_ERROR",
          message: "トレンドデータの取得に失敗しました",
          details: { error: error instanceof Error ? error.message : "Unknown error" },
        },
      };
    }
  }

  private validateInput(input: GetAnalyticsTrendsInput): Result<true, UseCaseError> {
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
