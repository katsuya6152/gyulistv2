// 出荷管理APIサービス

import { client } from "@/lib/api-client";
import type { InferRequestType, InferResponseType } from "hono/client";

// 型推論を使用してリクエスト型を取得
type GetCalfShipmentsRequest = InferRequestType<typeof client.api.v2.calves.shipments.$get>["query"];
type UpdateCalfShipmentRequest = InferRequestType<(typeof client.api.v2.calves)[":id"]["shipment"]["$put"]>["json"];
type BatchUpdateCalfShipmentsRequest = InferRequestType<typeof client.api.v2.calves.shipments.batch.$put>["json"];
type CreateCalfRequest = InferRequestType<typeof client.api.v2.calves.$post>["json"];

// HTTPステータス200の時の型を直接取得
export type GetCalfShipmentsSuccess = InferResponseType<typeof client.api.v2.calves.shipments.$get, 200>;
export type UpdateCalfShipmentSuccess = InferResponseType<(typeof client.api.v2.calves)[":id"]["shipment"]["$put"], 200>;
export type CancelCalfShipmentSuccess = InferResponseType<(typeof client.api.v2.calves)[":id"]["shipment"]["cancel"]["$put"], 200>;
export type BatchUpdateCalfShipmentsSuccess = InferResponseType<typeof client.api.v2.calves.shipments.batch.$put, 200>;
export type GetCowShipmentInfoSuccess = InferResponseType<(typeof client.api.v2.cows)[":cowId"]["calves"]["shipments"]["$get"], 200>;
export type CreateCalfSuccess = InferResponseType<typeof client.api.v2.calves.$post, 200>;

class ShipmentService {
  /**
   * 子牛出荷一覧を取得
   */
  async getCalfShipments(params: GetCalfShipmentsRequest): Promise<GetCalfShipmentsSuccess> {
    const response = await client.api.v2.calves.shipments.$get({
      query: params,
    });

    if (response.status !== 200) {
      const errorData = await response.json();
      throw new Error("error" in errorData ? errorData.error : "子牛出荷一覧の取得に失敗しました");
    }

    return response.json();
  }

  /**
   * 子牛出荷情報を更新
   */
  async updateCalfShipment(id: string, params: UpdateCalfShipmentRequest): Promise<UpdateCalfShipmentSuccess> {
    const response = await client.api.v2.calves[":id"].shipment.$put({
      param: { id },
      json: params,
    });

    if (response.status !== 200) {
      const errorData = await response.json();
      throw new Error("error" in errorData ? errorData.error : "更新に失敗しました");
    }

    return response.json();
  }

  /**
   * 子牛出荷をキャンセル
   */
  async cancelCalfShipment(id: string): Promise<CancelCalfShipmentSuccess> {
    const response = await client.api.v2.calves[":id"].shipment.cancel.$put({
      param: { id },
    });

    if (response.status !== 200) {
      const errorData = await response.json();
      throw new Error("error" in errorData ? errorData.error : "キャンセルに失敗しました");
    }

    return response.json();
  }

  /**
   * 子牛出荷情報を一括更新
   */
  async batchUpdateCalfShipments(params: BatchUpdateCalfShipmentsRequest): Promise<BatchUpdateCalfShipmentsSuccess> {
    const response = await client.api.v2.calves.shipments.batch.$put({
      json: params,
    });

    if (response.status !== 200) {
      const errorData = await response.json();
      throw new Error("error" in errorData ? errorData.error : "一括更新に失敗しました");
    }

    return response.json();
  }

  /**
   * 母牛の出荷管理情報を取得
   */
  async getCowShipmentInfo(cowId: string): Promise<GetCowShipmentInfoSuccess> {
    const response = await client.api.v2.cows[":cowId"].calves.shipments.$get({
      param: { cowId },
    });

    if (response.status !== 200) {
      const errorData = await response.json();
      throw new Error("error" in errorData ? errorData.error : "母牛情報の取得に失敗しました");
    }

    return response.json();
  }

  /**
   * 新規子牛を作成
   */
  async createCalf(data: CreateCalfRequest): Promise<CreateCalfSuccess> {
    const response = await client.api.v2.calves.$post({
      json: data,
    });

    if (response.status !== 200) {
      const errorData = await response.json();
      console.error("API error response:", {
        status: response.status,
        errorData: errorData,
      });

      // エラーメッセージを適切に文字列化
      let errorMessage = "子牛の作成に失敗しました";
      if ("error" in errorData) {
        if (typeof errorData.error === "string") {
          errorMessage = errorData.error;
        } else if (typeof errorData.error === "object" && errorData.error !== null) {
          errorMessage = JSON.stringify(errorData.error);
        }
      }

      throw new Error(errorMessage);
    }

    return response.json();
  }
}

export const shipmentService = new ShipmentService();
