// 価格バリューオブジェクト

export interface Price {
  readonly value: number;
  readonly currency: "JPY";
}

// 価格作成関数（純粋関数）
export const createPrice = (value: number): Price | null => {
  if (value <= 0 || value > 10000000) {
    // 最大1000万円
    return null;
  }

  return {
    value: Math.round(value), // 整数に丸める
    currency: "JPY" as const,
  };
};

// 価格比較関数（純粋関数）
export const equals = (a: Price, b: Price): boolean =>
  a.value === b.value && a.currency === b.currency;

// 価格加算関数（純粋関数）
export const add = (a: Price, b: Price): Price => ({
  value: a.value + b.value,
  currency: "JPY" as const,
});

// 価格平均計算関数（純粋関数）
export const average = (prices: Price[]): Price | null => {
  if (prices.length === 0) return null;

  const total = prices.reduce((sum, price) => sum + price.value, 0);
  return {
    value: Math.round(total / prices.length),
    currency: "JPY" as const,
  };
};

// 価格文字列変換関数（純粋関数）
export const toDisplayString = (price: Price): string => `¥${price.value.toLocaleString()}`;
