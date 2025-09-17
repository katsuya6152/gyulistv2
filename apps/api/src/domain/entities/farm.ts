// Farmエンティティ

import type { DateTimeProvider } from "../services/date-time";
import type { IdGenerator } from "../services/id-generator";
import { AuthenticationError, type FarmId, type Result } from "../types/auth";

// Farmエンティティ
export interface Farm {
  readonly id: FarmId;
  readonly farmName: string;
  readonly address?: string;
  readonly phoneNumber?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// Farm作成関数（純粋関数）
export const createFarm = (
  farmName: string,
  idGenerator: IdGenerator,
  dateTimeProvider: DateTimeProvider,
  address?: string,
  phoneNumber?: string
): Result<Farm, AuthenticationError> => {
  if (!farmName || farmName.trim().length === 0) {
    return {
      success: false,
      error: new AuthenticationError("Farm name is required", "INVALID_CREDENTIALS"),
    };
  }

  if (farmName.length > 200) {
    return {
      success: false,
      error: new AuthenticationError("Farm name is too long", "INVALID_CREDENTIALS"),
    };
  }

  return {
    success: true,
    data: {
      id: idGenerator.generateFarmId(),
      farmName: farmName.trim(),
      address: address?.trim(),
      phoneNumber: phoneNumber?.trim(),
      createdAt: dateTimeProvider.now(),
      updatedAt: dateTimeProvider.now(),
    },
  };
};

// 既存データからFarmエンティティを復元する関数
export const restoreFarm = (
  id: FarmId,
  farmName: string,
  address: string | undefined,
  phoneNumber: string | undefined,
  createdAt: Date,
  updatedAt: Date
): Farm => ({
  id,
  farmName,
  address,
  phoneNumber,
  createdAt,
  updatedAt,
});

// 農場情報更新関数（純粋関数）
export const updateFarm = (
  farm: Farm,
  updates: {
    farmName?: string;
    address?: string;
    phoneNumber?: string;
  },
  dateTimeProvider: DateTimeProvider
): Result<Farm, AuthenticationError> => {
  if (updates.farmName !== undefined) {
    if (!updates.farmName || updates.farmName.trim().length === 0) {
      return {
        success: false,
        error: new AuthenticationError("Farm name is required", "INVALID_CREDENTIALS"),
      };
    }

    if (updates.farmName.length > 200) {
      return {
        success: false,
        error: new AuthenticationError("Farm name is too long", "INVALID_CREDENTIALS"),
      };
    }
  }

  return {
    success: true,
    data: {
      ...farm,
      ...updates,
      farmName: updates.farmName?.trim() ?? farm.farmName,
      address: updates.address?.trim() ?? farm.address,
      phoneNumber: updates.phoneNumber?.trim() ?? farm.phoneNumber,
      updatedAt: dateTimeProvider.now(),
    },
  };
};

// 農場検証関数（純粋関数）
export const validateFarm = (farm: Farm): Result<Farm, AuthenticationError> => {
  if (!farm.id || farm.id.length === 0) {
    return {
      success: false,
      error: new AuthenticationError("Farm ID is required", "INVALID_CREDENTIALS"),
    };
  }

  if (!farm.farmName || farm.farmName.trim().length === 0) {
    return {
      success: false,
      error: new AuthenticationError("Farm name is required", "INVALID_CREDENTIALS"),
    };
  }

  return { success: true, data: farm };
};

// 農場等価性チェック関数（純粋関数）
export const equals = (a: Farm, b: Farm): boolean => a.id === b.id;

// 農場文字列表現関数（純粋関数）
export const farmToString = (farm: Farm): string => `Farm(id=${farm.id}, name=${farm.farmName})`;
