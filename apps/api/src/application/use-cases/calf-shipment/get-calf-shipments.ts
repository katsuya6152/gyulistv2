import type { CalfRepository } from "../../../domain/contracts/calf-repository";
import type {
  GetCalfShipmentsParams,
  GetCalfShipmentsResponse,
} from "../../../domain/types/calf-shipment";

// ユースケースエラー型
export interface UseCaseError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Result型
export type Result<T, E = UseCaseError> = { success: true; data: T } | { success: false; error: E };

export class GetCalfShipmentsUseCase {
  constructor(private calfRepository: CalfRepository) {}

  async execute(
    params: GetCalfShipmentsParams
  ): Promise<Result<GetCalfShipmentsResponse, UseCaseError>> {
    try {
      // バリデーション
      if (!params.farmId) {
        return {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Farm ID is required",
          },
        };
      }

      if (params.limit && (params.limit < 1 || params.limit > 100)) {
        return {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Limit must be between 1 and 100",
          },
        };
      }

      if (params.startDate && params.endDate && params.startDate > params.endDate) {
        return {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Start date must be before end date",
          },
        };
      }

      // リポジトリからデータを取得
      const result = await this.calfRepository.findShipments(params);

      if (!result.success) {
        return {
          success: false,
          error: {
            code: "REPOSITORY_ERROR",
            message: "Failed to fetch calf shipments",
            details: { repositoryError: result.error },
          },
        };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "UNKNOWN_ERROR",
          message: "An unexpected error occurred",
          details: { error: error instanceof Error ? error.message : "Unknown error" },
        },
      };
    }
  }
}
