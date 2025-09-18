"use server";

import { shipmentService } from "@/services/shipmentService";

/**
 * 母牛の出荷管理情報を取得
 */
export async function getCowShipmentInfoAction(cowId: string) {
  try {
    // API呼び出し
    const response = await shipmentService.getCowShipmentInfo(cowId);

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Get cow shipment info error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "母牛情報の取得に失敗しました",
    };
  }
}
