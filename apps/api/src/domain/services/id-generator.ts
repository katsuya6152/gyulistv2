// ID生成ドメインサービス

import { v4 as uuidv4 } from "uuid";
import type { FarmId, UserId } from "../types/auth";

// ID生成サービス（純粋関数）
export interface IdGenerator {
  generateUserId(): UserId;
  generateFarmId(): FarmId;
}

// UUID v4を使用したID生成実装
export const createIdGenerator = (): IdGenerator => ({
  generateUserId: (): UserId => uuidv4() as UserId,
  generateFarmId: (): FarmId => uuidv4() as FarmId,
});

// テスト用のID生成実装
export const createTestIdGenerator = (): IdGenerator => ({
  generateUserId: (): UserId => "test-user-id" as UserId,
  generateFarmId: (): FarmId => "test-farm-id" as FarmId,
});
