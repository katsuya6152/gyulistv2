"use server";

import { shipmentService } from "@/services/shipmentService";
import { batchUpdateCalfShipmentsParamsSchema, updateCalfShipmentSchema } from "../schemas/calf-shipment";
import type { BatchUpdateCalfShipmentsParams, UpdateCalfShipment } from "../schemas/calf-shipment";

/**
 * 子牛出荷情報を更新
 */
export async function updateCalfShipmentAction(id: string, updates: UpdateCalfShipment) {
  // バリデーション
  const validationResult = updateCalfShipmentSchema.safeParse(updates);

  if (!validationResult.success) {
    return {
      success: false,
      errors: validationResult.error.flatten().fieldErrors,
    };
  }

  try {
    // API呼び出し
    const response = await shipmentService.updateCalfShipment(id, validationResult.data);

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Update calf shipment error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "更新に失敗しました",
    };
  }
}

/**
 * 子牛出荷情報を一括更新
 */
export async function batchUpdateCalfShipmentsAction(params: BatchUpdateCalfShipmentsParams) {
  // バリデーション
  const validationResult = batchUpdateCalfShipmentsParamsSchema.safeParse(params);

  if (!validationResult.success) {
    return {
      success: false,
      errors: validationResult.error.flatten().fieldErrors,
    };
  }

  try {
    // API呼び出し
    const response = await shipmentService.batchUpdateCalfShipments(validationResult.data);

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Batch update calf shipments error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "一括更新に失敗しました",
    };
  }
}

/**
 * 子牛出荷をキャンセル
 */
export async function cancelCalfShipmentAction(id: string) {
  try {
    // API呼び出し
    const response = await shipmentService.cancelCalfShipment(id);

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Cancel calf shipment error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "キャンセルに失敗しました",
    };
  }
}
