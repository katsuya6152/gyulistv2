// 個体番号バリューオブジェクト

export interface IndividualNumber {
  readonly value: string;
}

// 個体番号作成関数（純粋関数）
export const createIndividualNumber = (value: string): IndividualNumber | null => {
  if (!value || value.trim().length === 0) {
    return null;
  }

  // 個体番号の形式チェック（例: 001-001, A001-001）
  const pattern = /^[A-Z]?\d{3}-\d{3}$/;
  if (!pattern.test(value.trim())) {
    return null;
  }

  return {
    value: value.trim().toUpperCase(),
  };
};

// 個体番号比較関数（純粋関数）
export const equals = (a: IndividualNumber, b: IndividualNumber): boolean => a.value === b.value;

// 個体番号文字列変換関数（純粋関数）
export const toDisplayString = (individualNumber: IndividualNumber): string =>
  individualNumber.value;
