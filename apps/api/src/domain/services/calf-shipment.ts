// 子牛出荷ドメインサービス

import type { Calf } from "../entities/calf";

// 出荷ドメインサービス（純粋関数）
export interface CalfShipmentService {
  // ビジネスルール: 出荷可能かチェック
  canShip(calf: Calf): boolean;

  // ビジネスルール: 出荷価格の妥当性チェック
  validatePrice(price: number): boolean;

  // ビジネスルール: 出荷日の妥当性チェック
  validateShipmentDate(auctionDate: string, birthDate: string): boolean;

  // ビジネスルール: 出荷統計の計算
  calculateStatistics(calves: Calf[]): {
    totalShipments: number;
    averagePrice: number;
    maxPrice: number;
    minPrice: number;
    totalRevenue: number;
  };
}

// 出荷サービス実装
export const createCalfShipmentService = (): CalfShipmentService => ({
  canShip: (calf: Calf): boolean => {
    // ビジネスルール: 健康な子牛のみ出荷可能
    if (calf.healthStatus !== "HEALTHY") {
      return false;
    }

    // ビジネスルール: 生後30日以上でないと出荷不可
    const birthDate = new Date(calf.birthDate);
    const now = new Date();
    const ageInDays = Math.floor((now.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));

    return ageInDays >= 30;
  },

  validatePrice: (price: number): boolean => {
    // ビジネスルール: 価格は正の値でなければならない
    return price > 0;
  },

  validateShipmentDate: (auctionDate: string, birthDate: string): boolean => {
    // ビジネスルール: 出荷日は生年月日より後でなければならない
    const auction = new Date(auctionDate);
    const birth = new Date(birthDate);

    return auction >= birth;
  },

  calculateStatistics: (calves: Calf[]) => {
    const shippedCalves = calves.filter((calf) => calf.auctionDate !== null);
    const prices = shippedCalves
      .map((calf) => calf.price)
      .filter((price): price is number => price !== null);

    return {
      totalShipments: shippedCalves.length,
      averagePrice:
        prices.length > 0 ? prices.reduce((sum, price) => sum + price, 0) / prices.length : 0,
      maxPrice: prices.length > 0 ? Math.max(...prices) : 0,
      minPrice: prices.length > 0 ? Math.min(...prices) : 0,
      totalRevenue: prices.reduce((sum, price) => sum + price, 0),
    };
  },
});
