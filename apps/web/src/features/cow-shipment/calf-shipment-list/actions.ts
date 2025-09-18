"use server";

import { type CreateCalfSuccess, shipmentService } from "@/services/shipmentService";
import { batchUpdateCalfShipmentsParamsSchema, getCalfShipmentsParamsSchema, updateCalfShipmentSchema } from "../schemas/calf-shipment";
import type { BatchUpdateCalfShipmentsParams, GetCalfShipmentsParams, UpdateCalfShipment } from "../schemas/calf-shipment";

/**
 * 子牛出荷一覧を取得
 */
export async function getCalfShipmentsAction(params: GetCalfShipmentsParams) {
  // バリデーション
  const validationResult = getCalfShipmentsParamsSchema.safeParse(params);

  if (!validationResult.success) {
    return {
      success: false,
      errors: validationResult.error.flatten().fieldErrors,
    };
  }

  try {
    // API呼び出し
    const response = await shipmentService.getCalfShipments({
      ...validationResult.data,
      limit: validationResult.data.limit?.toString(),
    });

    return {
      success: true,
      data: response,
    };
  } catch (error) {
    console.error("Get calf shipments error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "子牛出荷一覧の取得に失敗しました",
    };
  }
}

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

/**
 * 新規子牛出荷を作成
 */
export async function createCalfShipmentAction(data: Parameters<typeof shipmentService.createCalf>[0]) {
  try {
    // shipmentServiceを使用してAPI呼び出し
    const result = await shipmentService.createCalf(data);

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    console.error("Create calf shipment error:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      error: error,
    });

    // エラーメッセージを適切に処理
    let errorMessage = "子牛出荷の作成に失敗しました";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    } else if (error && typeof error === "object") {
      errorMessage = JSON.stringify(error);
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}
