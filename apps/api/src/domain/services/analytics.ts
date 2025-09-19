// 分析ドメインサービス（純粋関数ベース）

import type { AnalyticsFilter, AnalyticsStats, GenderAnalysis, PedigreeAnalysis, PriceDistribution, TimeSeriesData } from "../entities/analytics";
import type { Calf } from "../entities/calf";
import {
  type Trend,
  createComparison,
  createGenderAnalysis,
  createMetrics,
  createPedigreeAnalysis,
  createPeriod,
  createPriceDistribution,
  createTimeSeriesData,
  createTrends,
} from "../value-objects/analytics";

// 分析ドメインサービス（純粋関数の集合）
export interface AnalyticsService {
  // 基本統計を計算
  calculateBasicStats(calves: Calf[], previousPeriodCalves?: Calf[]): AnalyticsStats;

  // 時系列データを計算
  calculateTimeSeriesData(calves: Calf[], groupBy: "day" | "week" | "month"): TimeSeriesData[];

  // 血統分析を計算
  calculatePedigreeAnalysis(calves: Calf[]): PedigreeAnalysis[];

  // 価格分布を計算
  calculatePriceDistribution(calves: Calf[], bins?: number): PriceDistribution[];

  // 性別分析を計算
  calculateGenderAnalysis(calves: Calf[]): GenderAnalysis[];

  // フィルタリング
  filterCalves(calves: Calf[], filter: AnalyticsFilter): Calf[];
}

// 純粋関数ベースの分析サービス実装
export const createAnalyticsService = (): AnalyticsService => ({
  calculateBasicStats: (calves: Calf[], previousPeriodCalves?: Calf[]): AnalyticsStats => {
    const shippedCalves = calves.filter((c) => c.auctionDate);
    const totalRevenue = shippedCalves.reduce((sum, c) => sum + (c.price || 0), 0);
    const averagePrice = shippedCalves.length > 0 ? totalRevenue / shippedCalves.length : 0;
    const maxPrice = Math.max(...shippedCalves.map((c) => c.price || 0), 0);
    const minPrice = Math.min(...shippedCalves.map((c) => c.price || 0), 0);

    // 現在期間のメトリクス
    const currentMetrics = createMetrics({
      total: calves.length,
      shipped: shippedCalves.length,
      totalRevenue,
      averagePrice,
      maxPrice,
      minPrice,
    });

    // 前期間のメトリクス（比較用）
    const previousMetrics = previousPeriodCalves
      ? (() => {
          const prevShipped = previousPeriodCalves.filter((c) => c.auctionDate);
          const prevRevenue = prevShipped.reduce((sum, c) => sum + (c.price || 0), 0);
          const prevAveragePrice = prevShipped.length > 0 ? prevRevenue / prevShipped.length : 0;
          const prevMaxPrice = Math.max(...prevShipped.map((c) => c.price || 0), 0);
          const prevMinPrice = Math.min(...prevShipped.map((c) => c.price || 0), 0);

          return createMetrics({
            total: previousPeriodCalves.length,
            shipped: prevShipped.length,
            totalRevenue: prevRevenue,
            averagePrice: prevAveragePrice,
            maxPrice: prevMaxPrice,
            minPrice: prevMinPrice,
          });
        })()
      : createMetrics({
          total: 0,
          shipped: 0,
          totalRevenue: 0,
          averagePrice: 0,
          maxPrice: 0,
          minPrice: 0,
        });

    // 比較データとトレンド
    const comparison = createComparison(currentMetrics, previousMetrics);
    const trends = createTrends(comparison);

    // 期間計算
    const dates = calves.map((c) => new Date(c.birthDate)).sort();
    const startDate = dates[0]?.toISOString().split("T")[0] || "";
    const endDate = dates[dates.length - 1]?.toISOString().split("T")[0] || "";
    const period = createPeriod(startDate, endDate);

    return {
      period,
      metrics: currentMetrics,
      comparison,
      trends,
    };
  },

  calculateTimeSeriesData: (calves: Calf[], groupBy: "day" | "week" | "month" = "month"): TimeSeriesData[] => {
    const shippedCalves = calves.filter((c) => c.auctionDate);

    // 日付でグループ化
    const grouped = shippedCalves.reduce(
      (acc, calf) => {
        const date = new Date(calf.auctionDate as string);
        let key: string;

        switch (groupBy) {
          case "day":
            key = date.toISOString().split("T")[0];
            break;
          case "week": {
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            key = weekStart.toISOString().split("T")[0];
            break;
          }
          case "month":
            key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
            break;
          default:
            key = date.toISOString().split("T")[0];
        }

        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(calf);
        return acc;
      },
      {} as Record<string, Calf[]>
    );

    return Object.entries(grouped)
      .map(([date, groupCalves]) => {
        const revenue = groupCalves.reduce((sum, c) => sum + (c.price || 0), 0);
        const prices = groupCalves.map((c) => c.price || 0).filter((p) => p > 0);

        return createTimeSeriesData(
          date,
          groupCalves.length,
          revenue,
          prices.length > 0 ? revenue / prices.length : 0,
          Math.max(...prices, 0),
          Math.min(...prices, 0)
        );
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  },

  calculatePedigreeAnalysis: (calves: Calf[]): PedigreeAnalysis[] => {
    const shippedCalves = calves.filter((c) => c.auctionDate);

    // 血統でグループ化
    const grouped = shippedCalves.reduce(
      (acc, calf) => {
        const key = `${calf.sirePedigree || ""}-${calf.maternalGrandsire || ""}-${calf.maternalGreatGrandsire || ""}-${calf.maternalGreatGreatGrandsire || ""}`;

        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(calf);
        return acc;
      },
      {} as Record<string, Calf[]>
    );

    return Object.entries(grouped)
      .map(([key, groupCalves]) => {
        const [sire, maternalGrandsire, maternalGreatGrandsire, maternalGreatGreatGrandsire] = key.split("-");
        const revenue = groupCalves.reduce((sum, c) => sum + (c.price || 0), 0);
        const prices = groupCalves.map((c) => c.price || 0).filter((p) => p > 0);
        const averagePrice = prices.length > 0 ? revenue / prices.length : 0;
        const priceVariance = prices.length > 0 ? prices.reduce((sum, price) => sum + (price - averagePrice) ** 2, 0) / prices.length : 0;

        const averageAge = groupCalves.reduce((sum, c) => sum + (c.ageInDays || 0), 0) / groupCalves.length;
        const averageWeight = groupCalves.reduce((sum, c) => sum + (c.weight || 0), 0) / groupCalves.length;
        const healthRate = (groupCalves.filter((c) => c.healthStatus === "HEALTHY").length / groupCalves.length) * 100;

        return createPedigreeAnalysis(
          sire || "",
          maternalGrandsire || "",
          maternalGreatGrandsire || "",
          maternalGreatGreatGrandsire || "",
          {
            shipmentCount: groupCalves.length,
            totalRevenue: revenue,
            averagePrice,
            maxPrice: Math.max(...prices, 0),
            minPrice: Math.min(...prices, 0),
            priceVariance,
          },
          {
            averageAge,
            averageWeight,
            healthRate,
          },
          {
            priceTrend: "stable" as Trend, // 実際の計算が必要
            demandTrend: "stable" as Trend, // 実際の計算が必要
          }
        );
      })
      .sort((a, b) => b.performance.averagePrice - a.performance.averagePrice);
  },

  calculatePriceDistribution: (calves: Calf[], bins = 10): PriceDistribution[] => {
    const shippedCalves = calves.filter((c) => c.auctionDate && c.price);
    const prices = shippedCalves.map((c) => c.price || 0).filter((p) => p > 0);

    if (prices.length === 0) return [];

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    // より読みやすい価格範囲を生成するための関数
    const roundToNiceNumber = (num: number, roundUp = false): number => {
      const magnitude = 10 ** Math.floor(Math.log10(num));
      const normalized = num / magnitude;

      let rounded: number;
      if (roundUp) {
        if (normalized <= 1) rounded = 1;
        else if (normalized <= 2) rounded = 2;
        else if (normalized <= 5) rounded = 5;
        else rounded = 10;
      } else {
        if (normalized >= 10) rounded = 10;
        else if (normalized >= 5) rounded = 5;
        else if (normalized >= 2) rounded = 2;
        else rounded = 1;
      }

      return rounded * magnitude;
    };

    // 最小値を切り下げ、最大値を切り上げて読みやすい範囲を作成
    const niceMinPrice = roundToNiceNumber(minPrice, false);
    const niceMaxPrice = roundToNiceNumber(maxPrice, true);
    const binSize = (niceMaxPrice - niceMinPrice) / bins;

    const distribution: PriceDistribution[] = [];

    for (let i = 0; i < bins; i++) {
      const start = niceMinPrice + i * binSize;
      const end = niceMinPrice + (i + 1) * binSize;
      const count = prices.filter((p) => p >= start && p < end).length;

      // 価格範囲を読みやすくフォーマット（万円単位で表示）
      const formatPrice = (price: number): string => {
        if (price >= 10000) {
          return `${Math.round(price / 10000)}万円`;
        }
        if (price >= 1000) {
          return `${Math.round(price / 1000)}千円`;
        }
        return `${Math.round(price)}円`;
      };

      distribution.push(createPriceDistribution(`${formatPrice(start)}-${formatPrice(end)}`, count, prices.length));
    }

    return distribution;
  },

  calculateGenderAnalysis: (calves: Calf[]): GenderAnalysis[] => {
    const shippedCalves = calves.filter((c) => c.auctionDate);
    const totalCount = shippedCalves.length;

    const genders: ("MALE" | "FEMALE" | "CASTRATED")[] = ["MALE", "FEMALE", "CASTRATED"];

    return genders
      .map((gender) => {
        const genderCalves = shippedCalves.filter((c) => c.gender === gender);
        const revenue = genderCalves.reduce((sum, c) => sum + (c.price || 0), 0);
        const averagePrice = genderCalves.length > 0 ? revenue / genderCalves.length : 0;

        return createGenderAnalysis(gender, averagePrice, genderCalves.length, revenue, totalCount);
      })
      .filter((gender) => gender.count > 0);
  },

  filterCalves: (calves: Calf[], filter: AnalyticsFilter): Calf[] => {
    return calves.filter((calf) => {
      // 農場IDフィルター
      if (calf.farmId !== filter.farmId) return false;

      // 日付フィルター
      if (filter.startDate && calf.birthDate < filter.startDate) return false;
      if (filter.endDate && calf.birthDate > filter.endDate) return false;

      // 性別フィルター
      if (filter.gender && calf.gender !== filter.gender) return false;

      // 血統フィルター
      if (filter.pedigree) {
        const pedigreeMatch =
          calf.sirePedigree?.includes(filter.pedigree) ||
          calf.maternalGrandsire?.includes(filter.pedigree) ||
          calf.maternalGreatGrandsire?.includes(filter.pedigree) ||
          calf.maternalGreatGreatGrandsire?.includes(filter.pedigree);
        if (!pedigreeMatch) return false;
      }

      // 価格範囲フィルター
      if (filter.priceRange && calf.price) {
        if (calf.price < filter.priceRange.min || calf.price > filter.priceRange.max) return false;
      }

      // 年齢範囲フィルター
      if (filter.ageRange && calf.ageInDays) {
        if (calf.ageInDays < filter.ageRange.min || calf.ageInDays > filter.ageRange.max) return false;
      }

      return true;
    });
  },
});
