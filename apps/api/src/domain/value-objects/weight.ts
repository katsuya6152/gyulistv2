// 体重バリューオブジェクト

export interface Weight {
  readonly value: number; // kg
  readonly unit: "kg";
}

// 体重作成関数（純粋関数）
export const createWeight = (value: number): Weight | null => {
  if (value <= 0 || value > 2000) {
    // 最大2000kg
    return null;
  }

  return {
    value: Math.round(value * 10) / 10, // 小数点第1位まで
    unit: "kg" as const,
  };
};

// 体重比較関数（純粋関数）
export const equals = (a: Weight, b: Weight): boolean => a.value === b.value && a.unit === b.unit;

// 体重加算関数（純粋関数）
export const add = (a: Weight, b: Weight): Weight => ({
  value: Math.round((a.value + b.value) * 10) / 10,
  unit: "kg" as const,
});

// 体重平均計算関数（純粋関数）
export const average = (weights: Weight[]): Weight | null => {
  if (weights.length === 0) return null;

  const total = weights.reduce((sum, weight) => sum + weight.value, 0);
  return {
    value: Math.round((total / weights.length) * 10) / 10,
    unit: "kg" as const,
  };
};

// 体重文字列変換関数（純粋関数）
export const toDisplayString = (weight: Weight): string => `${weight.value}${weight.unit}`;
