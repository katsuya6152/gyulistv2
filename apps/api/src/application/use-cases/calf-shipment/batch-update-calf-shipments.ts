import type { CalfRepository } from "../../../domain/contracts/calf-repository";
import type {
  BatchUpdateCalfShipmentsParams,
  BatchUpdateResponse,
} from "../../../domain/types/calf-shipment";

// ユースケースエラー型
export interface UseCaseError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Result型
export type Result<T, E = UseCaseError> = { success: true; data: T } | { success: false; error: E };

export class BatchUpdateCalfShipmentsUseCase {
  constructor(private calfRepository: CalfRepository) {}

  async execute(
    params: BatchUpdateCalfShipmentsParams
  ): Promise<Result<BatchUpdateResponse, UseCaseError>> {
    try {
      // バリデーション
      if (!params.updates || params.updates.length === 0) {
        return {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Updates array is required and cannot be empty",
          },
        };
      }

      if (params.updates.length > 50) {
        return {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Cannot update more than 50 calves at once",
          },
        };
      }

      // 各更新項目をバリデーション
      for (const update of params.updates) {
        if (!update.id) {
          return {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Calf ID is required for all updates",
            },
          };
        }

        if (update.weight !== undefined && update.weight <= 0) {
          return {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Weight must be positive",
            },
          };
        }

        if (update.price !== undefined && update.price < 0) {
          return {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Price must be non-negative",
            },
          };
        }
      }

      // 一括更新を実行
      const result = await this.calfRepository.batchUpdate(
        params.updates.map((update) => ({
          id: update.id,
          calf: {
            weight: update.weight,
            auctionDate: update.auctionDate,
            price: update.price,
            buyer: update.buyer,
            remarks: update.remarks,
          },
        }))
      );

      if (!result.success) {
        return {
          success: false,
          error: {
            code: "REPOSITORY_ERROR",
            message: "Failed to batch update calves",
            details: { repositoryError: result.error },
          },
        };
      }

      const response: BatchUpdateResponse = {
        updated: result.data.filter((r) => r.success).length,
        failed: result.data.filter((r) => !r.success).length,
        results: result.data,
      };

      return { success: true, data: response };
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
