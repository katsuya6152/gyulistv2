import type { CalfRepository } from "../../../domain/contracts/calf-repository";
import { type Calf, updateCalfShipment } from "../../../domain/entities/calf";
import type { UpdateCalfShipmentParams } from "../../../domain/types/calf-shipment";

// ユースケースエラー型
export interface UseCaseError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Result型
export type Result<T, E = UseCaseError> = { success: true; data: T } | { success: false; error: E };

export class UpdateCalfShipmentUseCase {
  constructor(private calfRepository: CalfRepository) {}

  async execute(params: UpdateCalfShipmentParams): Promise<Result<Calf, UseCaseError>> {
    try {
      // バリデーション
      if (!params.id) {
        return {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Calf ID is required",
          },
        };
      }

      if (params.weight !== undefined && params.weight <= 0) {
        return {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Weight must be positive",
          },
        };
      }

      if (params.price !== undefined && params.price < 0) {
        return {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Price must be non-negative",
          },
        };
      }

      // 既存の子牛を取得
      const existingCalfResult = await this.calfRepository.findById(params.id);
      if (!existingCalfResult.success) {
        return {
          success: false,
          error: {
            code: "REPOSITORY_ERROR",
            message: "Failed to find calf",
            details: { repositoryError: existingCalfResult.error },
          },
        };
      }

      if (!existingCalfResult.data) {
        return {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Calf not found",
          },
        };
      }

      // 子牛情報を更新
      const updatedCalf = updateCalfShipment(existingCalfResult.data, {
        weight: params.weight,
        auctionDate: params.auctionDate,
        price: params.price,
        buyer: params.buyer,
        remarks: params.remarks,
      });

      // データベースに保存
      const saveResult = await this.calfRepository.update(updatedCalf);
      if (!saveResult.success) {
        return {
          success: false,
          error: {
            code: "REPOSITORY_ERROR",
            message: "Failed to update calf",
            details: { repositoryError: saveResult.error },
          },
        };
      }

      return { success: true, data: saveResult.data };
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
