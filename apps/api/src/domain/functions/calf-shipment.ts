// 子牛出荷ドメイン関数（純粋関数）

import type { Calf } from "../entities/calf";

// 出荷可能かチェック（純粋関数）
export const canShipCalf = (calf: Calf): boolean => {
  // ビジネスルール: 健康な子牛のみ出荷可能
  if (calf.healthStatus !== "HEALTHY") {
    return false;
  }

  // ビジネスルール: 生後30日以上でないと出荷不可
  const birthDate = new Date(calf.birthDate);
  const now = new Date();
  const ageInDays = Math.floor((now.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));

  return ageInDays >= 30;
};

// 出荷価格の妥当性チェック（純粋関数）
export const isValidPrice = (price: number): boolean => {
  return price > 0 && price <= 10000000; // 最大1000万円
};

// 出荷日の妥当性チェック（純粋関数）
export const isValidShipmentDate = (auctionDate: string, birthDate: string): boolean => {
  const auction = new Date(auctionDate);
  const birth = new Date(birthDate);
  const now = new Date();

  // 出荷日は生年月日より後で、現在日時より前でなければならない
  return auction >= birth && auction <= now;
};

// 子牛の年齢計算（純粋関数）
export const calculateAge = (
  birthDate: string
): { years: number; months: number; days: number } => {
  const birth = new Date(birthDate);
  const now = new Date();

  const ageInDays = Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
  const years = Math.floor(ageInDays / 365);
  const months = Math.floor((ageInDays % 365) / 30);
  const days = ageInDays % 30;

  return { years, months, days };
};

// 出荷統計の計算（純粋関数）
export const calculateShipmentStatistics = (calves: Calf[]) => {
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
};
