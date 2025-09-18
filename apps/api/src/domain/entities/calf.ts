// 子牛エンティティ（出荷管理用）

export interface Calf {
  readonly id: string;
  readonly individualNumber: string;
  readonly calfName: string;
  readonly damName: string | null;
  readonly damId: string;
  readonly damIndividualNumber: string | null;
  readonly birthDate: string;
  // 血統情報
  readonly sirePedigree: string | null;
  readonly maternalGrandsire: string | null;
  readonly maternalGreatGrandsire: string | null;
  readonly maternalGreatGreatGrandsire: string | null;
  // 繁殖・出産情報
  readonly matingDate: string | null;
  readonly expectedBirthDate: string | null;
  readonly auctionDate: string | null;
  readonly matingInterval: number | null;
  // 個体情報
  readonly weight: number | null;
  readonly ageInDays: number | null;
  readonly gender: "MALE" | "FEMALE" | "CASTRATED";
  // 取引情報（出荷管理で使用）
  readonly price: number | null;
  readonly buyer: string | null;
  readonly remarks: string | null;
  readonly farmId: string;
  readonly healthStatus: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

// 子牛作成関数（純粋関数）
export const createCalf = (input: {
  individualNumber: string;
  calfName: string;
  damName: string | null;
  damId: string;
  damIndividualNumber?: string | null;
  birthDate: string;
  gender: "MALE" | "FEMALE" | "CASTRATED";
  // 血統情報
  sirePedigree?: string | null;
  maternalGrandsire?: string | null;
  maternalGreatGrandsire?: string | null;
  maternalGreatGreatGrandsire?: string | null;
  // 繁殖・出産情報
  matingDate?: string | null;
  expectedBirthDate?: string | null;
  auctionDate?: string | null;
  matingInterval?: number | null;
  // 個体情報
  weight?: number | null;
  ageInDays?: number | null;
  // 取引情報
  price?: number | null;
  buyer?: string | null;
  remarks?: string | null;
  farmId: string;
}): Calf => ({
  id: crypto.randomUUID(),
  individualNumber: input.individualNumber,
  calfName: input.calfName,
  damName: input.damName,
  damId: input.damId,
  damIndividualNumber: input.damIndividualNumber ?? null,
  birthDate: input.birthDate,
  // 血統情報
  sirePedigree: input.sirePedigree ?? null,
  maternalGrandsire: input.maternalGrandsire ?? null,
  maternalGreatGrandsire: input.maternalGreatGrandsire ?? null,
  maternalGreatGreatGrandsire: input.maternalGreatGreatGrandsire ?? null,
  // 繁殖・出産情報
  matingDate: input.matingDate ?? null,
  expectedBirthDate: input.expectedBirthDate ?? null,
  auctionDate: input.auctionDate ?? null,
  matingInterval: input.matingInterval ?? null,
  // 個体情報
  weight: input.weight ?? null,
  ageInDays: input.ageInDays ?? null,
  gender: input.gender,
  // 取引情報
  price: input.price ?? null,
  buyer: input.buyer ?? null,
  remarks: input.remarks ?? null,
  farmId: input.farmId,
  healthStatus: "HEALTHY",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

// 子牛更新関数（純粋関数）
export const updateCalfShipment = (
  calf: Calf,
  updates: {
    weight?: number;
    auctionDate?: string;
    price?: number;
    buyer?: string;
    remarks?: string;
  }
): Calf => ({
  ...calf,
  weight: updates.weight !== undefined ? updates.weight : calf.weight,
  auctionDate: updates.auctionDate !== undefined ? updates.auctionDate : calf.auctionDate,
  price: updates.price !== undefined ? updates.price : calf.price,
  buyer: updates.buyer !== undefined ? updates.buyer : calf.buyer,
  remarks: updates.remarks !== undefined ? updates.remarks : calf.remarks,
  updatedAt: new Date().toISOString(),
});

// 出荷取り消し関数（純粋関数）
export const cancelCalfShipment = (calf: Calf): Calf => ({
  ...calf,
  auctionDate: null,
  price: null,
  buyer: null,
  remarks: null,
  updatedAt: new Date().toISOString(),
});
