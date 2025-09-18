// 性別バリューオブジェクト

export type GenderType = "MALE" | "FEMALE" | "CASTRATED";

export interface Gender {
  readonly value: GenderType;
}

// 性別作成関数（純粋関数）
export const createGender = (value: string): Gender | null => {
  const normalizedValue = value.toUpperCase().trim();

  if (normalizedValue === "MALE" || normalizedValue === "オス") {
    return { value: "MALE" };
  }

  if (normalizedValue === "FEMALE" || normalizedValue === "メス") {
    return { value: "FEMALE" };
  }

  if (normalizedValue === "CASTRATED" || normalizedValue === "去勢") {
    return { value: "CASTRATED" };
  }

  return null;
};

// 性別比較関数（純粋関数）
export const equals = (a: Gender, b: Gender): boolean => a.value === b.value;

// 性別表示名取得関数（純粋関数）
export const getDisplayName = (gender: Gender): string => {
  switch (gender.value) {
    case "MALE":
      return "オス";
    case "FEMALE":
      return "メス";
    case "CASTRATED":
      return "去勢";
    default:
      return "不明";
  }
};

// 性別文字列変換関数（純粋関数）
export const toDisplayString = (gender: Gender): string => gender.value;
