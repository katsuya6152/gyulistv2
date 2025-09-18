import type { CalfRepository } from "../../../domain/contracts/calf-repository";
import { type Calf, cancelCalfShipment } from "../../../domain/entities/calf";

// ユースケースエラー型
export interface UseCaseError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Result型
export type Result<T, E = UseCaseError> = { success: true; data: T } | { success: false; error: E };

export class CancelCalfShipmentUseCase {
  constructor(private calfRepository: CalfRepository) {}

  async execute(calfId: string): Promise<Result<Calf, UseCaseError>> {
    try {
      // バリデーション
      if (!calfId) {
        return {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Calf ID is required",
          },
        };
      }

      // 既存の子牛を取得
      const existingCalfResult = await this.calfRepository.findById(calfId);
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

      // 出荷情報をキャンセル（NULLに設定）
      const cancelledCalf = cancelCalfShipment(existingCalfResult.data);

      // データベースに保存
      const saveResult = await this.calfRepository.update(cancelledCalf);
      if (!saveResult.success) {
        return {
          success: false,
          error: {
            code: "REPOSITORY_ERROR",
            message: "Failed to cancel calf shipment",
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
