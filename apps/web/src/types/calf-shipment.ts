// 子牛出荷管理用の型定義（フロントエンド）
// API成功時の型を直接使用して型の統一を図る

// API成功時の型を再エクスポート
import type {
  GetCalfShipmentsSuccess,
  GetCowShipmentInfoSuccess,
} from "@/services/shipmentService";

// API成功時の型から個別の型を抽出
export type CalfShipment = GetCalfShipmentsSuccess["data"]["calves"][0];
export type CowShipmentInfo = GetCowShipmentInfoSuccess["data"];

export type {
  BatchUpdateCalfShipmentsSuccess,
  CancelCalfShipmentSuccess,
  GetCalfShipmentsSuccess,
  GetCowShipmentInfoSuccess,
  UpdateCalfShipmentSuccess,
} from "@/services/shipmentService";

// リクエスト用の型定義
export interface GetCalfShipmentsParams {
  farmId: string;
  gender?: "MALE" | "FEMALE" | "CASTRATED";
  startDate?: string;
  endDate?: string;
  cursor?: string;
  limit?: number;
}

export interface UpdateCalfShipmentParams {
  id: string;
  weight?: number;
  auctionDate?: string;
  price?: number;
  buyer?: string;
  remarks?: string;
}

export interface BatchUpdateCalfShipment {
  id: string;
  weight?: number;
  auctionDate?: string;
  price?: number;
  buyer?: string;
  remarks?: string;
}

export interface BatchUpdateCalfShipmentsParams {
  updates: BatchUpdateCalfShipment[];
}

// フィルター用の型
export interface ShipmentFilters {
  farmId: string;
  gender?: "MALE" | "FEMALE" | "CASTRATED";
  startDate?: string;
  endDate?: string;
}
