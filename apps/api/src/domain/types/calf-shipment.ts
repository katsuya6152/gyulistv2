// 子牛出荷管理用の型定義

export interface CalfShipment {
  id: string;
  individualNumber: string;
  calfName: string;
  damName: string | null;
  damId: string;
  damIndividualNumber: string | null;
  birthDate: string;
  // 血統情報
  sirePedigree: string | null;
  maternalGrandsire: string | null;
  maternalGreatGrandsire: string | null;
  maternalGreatGreatGrandsire: string | null;
  // 繁殖・出産情報
  matingDate: string | null;
  expectedBirthDate: string | null;
  auctionDate: string | null; // 出荷日
  matingInterval: number | null;
  // 個体情報
  weight: number | null;
  ageInDays: number | null;
  gender: "MALE" | "FEMALE" | "CASTRATED";
  // 取引情報
  price: number | null;
  buyer: string | null;
  remarks: string | null;
  // その他
  farmId: string;
  healthStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetCalfShipmentsParams {
  farmId: string;
  gender?: "MALE" | "FEMALE" | "CASTRATED";
  startDate?: string;
  endDate?: string;
  cursor?: string;
  limit?: number;
}

export interface GetCalfShipmentsResponse {
  calves: CalfShipment[];
  pagination: {
    hasNext: boolean;
    nextCursor?: string;
    total: number;
    loaded: number;
  };
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

export interface BatchUpdateResponse {
  updated: number;
  failed: number;
  results: Array<{
    id: string;
    success: boolean;
    error?: string;
  }>;
}

export interface CowShipmentInfo {
  cow: {
    id: string;
    individualNumber: string;
    name: string;
    birthDate: string;
    age: string;
    healthStatus: string;
    farmId: string;
  };
  calfShipments: CalfShipment[];
  statistics: {
    totalShipments: number;
    averagePrice: number;
    maxPrice: number;
    minPrice: number;
    totalRevenue: number;
  };
}
