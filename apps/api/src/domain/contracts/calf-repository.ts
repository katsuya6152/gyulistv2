import type { Calf } from "../entities/calf";
import type { GetCalfShipmentsParams, GetCalfShipmentsResponse } from "../types/calf-shipment";

// リポジトリエラー型
export interface RepositoryError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Result型
export type Result<T, E = RepositoryError> =
  | { success: true; data: T }
  | { success: false; error: E };

// 子牛リポジトリ契約
export interface CalfRepository {
  // 出荷一覧取得（無限スクロール対応）
  findShipments(
    params: GetCalfShipmentsParams
  ): Promise<Result<GetCalfShipmentsResponse, RepositoryError>>;

  // 子牛IDで取得
  findById(id: string): Promise<Result<Calf | null, RepositoryError>>;

  // 農場IDで取得
  findByFarmId(farmId: string): Promise<Result<Calf[], RepositoryError>>;

  // 母牛IDで子牛一覧取得
  findByCowId(cowId: string): Promise<Result<Calf[], RepositoryError>>;

  // 子牛保存
  save(calf: Calf): Promise<Result<Calf, RepositoryError>>;

  // 子牛更新
  update(calf: Calf): Promise<Result<Calf, RepositoryError>>;

  // 子牛削除
  delete(id: string): Promise<Result<void, RepositoryError>>;

  // 一括更新
  batchUpdate(
    updates: Array<{ id: string; calf: Partial<Calf> }>
  ): Promise<Result<Array<{ id: string; success: boolean; error?: string }>, RepositoryError>>;
}
