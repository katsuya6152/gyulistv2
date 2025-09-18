// 母牛エンティティ

export interface Cow {
  readonly id: string;
  readonly individualNumber: string;
  readonly name: string;
  readonly birthDate: string;
  // 血統情報
  readonly sirePedigree: string | null;
  readonly maternalGrandsire: string | null;
  readonly maternalGreatGrandsire: string | null;
  readonly maternalGreatGreatGrandsire: string | null;
  // 母牛情報
  readonly damName: string | null;
  readonly damRegistrationNumber: string | null;
  readonly maternalScore: number | null;
  // 登録・識別情報
  readonly registrationSymbolNumber: string | null;
  readonly producerName: string | null;
  readonly individualIdentificationNumber: string | null;
  // 日付情報
  readonly auctionDate: string | null;
  readonly healthStatus: string;
  readonly farmId: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// 母牛作成関数（純粋関数）
export const createCow = (input: {
  individualNumber: string;
  name: string;
  birthDate: string;
  farmId: string;
  // 血統情報
  sirePedigree?: string | null;
  maternalGrandsire?: string | null;
  maternalGreatGrandsire?: string | null;
  maternalGreatGreatGrandsire?: string | null;
  // 母牛情報
  damName?: string | null;
  damRegistrationNumber?: string | null;
  maternalScore?: number | null;
  // 登録・識別情報
  registrationSymbolNumber?: string | null;
  producerName?: string | null;
  individualIdentificationNumber?: string | null;
  // 日付情報
  auctionDate?: string | null;
}): Cow => ({
  id: crypto.randomUUID(),
  individualNumber: input.individualNumber,
  name: input.name,
  birthDate: input.birthDate,
  // 血統情報
  sirePedigree: input.sirePedigree ?? null,
  maternalGrandsire: input.maternalGrandsire ?? null,
  maternalGreatGrandsire: input.maternalGreatGrandsire ?? null,
  maternalGreatGreatGrandsire: input.maternalGreatGreatGrandsire ?? null,
  // 母牛情報
  damName: input.damName ?? null,
  damRegistrationNumber: input.damRegistrationNumber ?? null,
  maternalScore: input.maternalScore ?? null,
  // 登録・識別情報
  registrationSymbolNumber: input.registrationSymbolNumber ?? null,
  producerName: input.producerName ?? null,
  individualIdentificationNumber: input.individualIdentificationNumber ?? null,
  // 日付情報
  auctionDate: input.auctionDate ?? null,
  healthStatus: "HEALTHY",
  farmId: input.farmId,
  createdAt: new Date(),
  updatedAt: new Date(),
});

// 母牛更新関数（純粋関数）
export const updateCow = (
  cow: Cow,
  updates: {
    name?: string;
    healthStatus?: string;
    // 血統情報
    sirePedigree?: string | null;
    maternalGrandsire?: string | null;
    maternalGreatGrandsire?: string | null;
    maternalGreatGreatGrandsire?: string | null;
    // 母牛情報
    damName?: string | null;
    damRegistrationNumber?: string | null;
    maternalScore?: number | null;
    // 登録・識別情報
    registrationSymbolNumber?: string | null;
    producerName?: string | null;
    individualIdentificationNumber?: string | null;
    // 日付情報
    auctionDate?: string | null;
  }
): Cow => ({
  ...cow,
  name: updates.name !== undefined ? updates.name : cow.name,
  healthStatus: updates.healthStatus !== undefined ? updates.healthStatus : cow.healthStatus,
  // 血統情報
  sirePedigree: updates.sirePedigree !== undefined ? updates.sirePedigree : cow.sirePedigree,
  maternalGrandsire:
    updates.maternalGrandsire !== undefined ? updates.maternalGrandsire : cow.maternalGrandsire,
  maternalGreatGrandsire:
    updates.maternalGreatGrandsire !== undefined
      ? updates.maternalGreatGrandsire
      : cow.maternalGreatGrandsire,
  maternalGreatGreatGrandsire:
    updates.maternalGreatGreatGrandsire !== undefined
      ? updates.maternalGreatGreatGrandsire
      : cow.maternalGreatGreatGrandsire,
  // 母牛情報
  damName: updates.damName !== undefined ? updates.damName : cow.damName,
  damRegistrationNumber:
    updates.damRegistrationNumber !== undefined
      ? updates.damRegistrationNumber
      : cow.damRegistrationNumber,
  maternalScore: updates.maternalScore !== undefined ? updates.maternalScore : cow.maternalScore,
  // 登録・識別情報
  registrationSymbolNumber:
    updates.registrationSymbolNumber !== undefined
      ? updates.registrationSymbolNumber
      : cow.registrationSymbolNumber,
  producerName: updates.producerName !== undefined ? updates.producerName : cow.producerName,
  individualIdentificationNumber:
    updates.individualIdentificationNumber !== undefined
      ? updates.individualIdentificationNumber
      : cow.individualIdentificationNumber,
  // 日付情報
  auctionDate: updates.auctionDate !== undefined ? updates.auctionDate : cow.auctionDate,
  updatedAt: new Date(),
});
