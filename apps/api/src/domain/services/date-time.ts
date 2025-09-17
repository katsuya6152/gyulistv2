// 日時生成ドメインサービス

// 日時生成サービス（純粋関数）
export interface DateTimeProvider {
  now(): Date;
  timestamp(): number;
}

// 現在の日時を提供する実装
export const createDateTimeProvider = (): DateTimeProvider => ({
  now: (): Date => new Date(),
  timestamp: (): number => Math.floor(Date.now() / 1000),
});

// テスト用の固定日時提供実装
export const createTestDateTimeProvider = (
  fixedDate: Date = new Date("2024-01-01T00:00:00Z")
): DateTimeProvider => ({
  now: (): Date => fixedDate,
  timestamp: (): number => Math.floor(fixedDate.getTime() / 1000),
});
