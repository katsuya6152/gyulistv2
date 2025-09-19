// 分析関連のバリューオブジェクト

// 期間バリューオブジェクト
export interface Period {
  readonly start: string;
  readonly end: string;
  readonly days: number;
}

export const createPeriod = (start: string, end: string): Period => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  return {
    start,
    end,
    days: Math.max(0, days),
  };
};

// メトリクスバリューオブジェクト
export interface Metrics {
  readonly totalCalves: number;
  readonly shippedCalves: number;
  readonly totalRevenue: number;
  readonly averagePrice: number;
  readonly maxPrice: number;
  readonly minPrice: number;
  readonly shipmentRate: number;
}

export const createMetrics = (calves: {
  total: number;
  shipped: number;
  totalRevenue: number;
  averagePrice: number;
  maxPrice: number;
  minPrice: number;
}): Metrics => ({
  totalCalves: calves.total,
  shippedCalves: calves.shipped,
  totalRevenue: calves.totalRevenue,
  averagePrice: calves.averagePrice,
  maxPrice: calves.maxPrice,
  minPrice: calves.minPrice,
  shipmentRate: calves.total > 0 ? (calves.shipped / calves.total) * 100 : 0,
});

// 比較データバリューオブジェクト
export interface Comparison {
  readonly shipmentChange: number;
  readonly revenueChange: number;
  readonly priceChange: number;
  readonly shipmentRateChange: number;
}

export const createComparison = (current: Metrics, previous: Metrics): Comparison => ({
  shipmentChange: previous.shippedCalves > 0 ? ((current.shippedCalves - previous.shippedCalves) / previous.shippedCalves) * 100 : 0,
  revenueChange: previous.totalRevenue > 0 ? ((current.totalRevenue - previous.totalRevenue) / previous.totalRevenue) * 100 : 0,
  priceChange: previous.averagePrice > 0 ? ((current.averagePrice - previous.averagePrice) / previous.averagePrice) * 100 : 0,
  shipmentRateChange: previous.shipmentRate > 0 ? ((current.shipmentRate - previous.shipmentRate) / previous.shipmentRate) * 100 : 0,
});

// トレンドバリューオブジェクト
export type Trend = "up" | "down" | "stable";

export interface Trends {
  readonly shipmentTrend: Trend;
  readonly revenueTrend: Trend;
  readonly priceTrend: Trend;
}

export const createTrends = (comparison: Comparison): Trends => ({
  shipmentTrend: comparison.shipmentChange > 5 ? "up" : comparison.shipmentChange < -5 ? "down" : "stable",
  revenueTrend: comparison.revenueChange > 5 ? "up" : comparison.revenueChange < -5 ? "down" : "stable",
  priceTrend: comparison.priceChange > 5 ? "up" : comparison.priceChange < -5 ? "down" : "stable",
});

// 価格分布バリューオブジェクト
export interface PriceDistribution {
  readonly priceRange: string;
  readonly count: number;
  readonly percentage: number;
}

export const createPriceDistribution = (priceRange: string, count: number, totalCount: number): PriceDistribution => ({
  priceRange,
  count,
  percentage: totalCount > 0 ? (count / totalCount) * 100 : 0,
});

// 性別分析バリューオブジェクト
export type Gender = "MALE" | "FEMALE" | "CASTRATED";

export interface GenderAnalysis {
  readonly gender: Gender;
  readonly averagePrice: number;
  readonly count: number;
  readonly totalRevenue: number;
  readonly percentage: number;
}

export const createGenderAnalysis = (
  gender: Gender,
  averagePrice: number,
  count: number,
  totalRevenue: number,
  totalCount: number
): GenderAnalysis => ({
  gender,
  averagePrice,
  count,
  totalRevenue,
  percentage: totalCount > 0 ? (count / totalCount) * 100 : 0,
});

// 時系列データバリューオブジェクト
export interface TimeSeriesData {
  readonly date: string;
  readonly shipments: number;
  readonly revenue: number;
  readonly averagePrice: number;
  readonly maxPrice: number;
  readonly minPrice: number;
}

export const createTimeSeriesData = (
  date: string,
  shipments: number,
  revenue: number,
  averagePrice: number,
  maxPrice: number,
  minPrice: number
): TimeSeriesData => ({
  date,
  shipments,
  revenue,
  averagePrice,
  maxPrice,
  minPrice,
});

// 血統分析バリューオブジェクト
export interface PedigreeAnalysis {
  readonly sire: string;
  readonly maternalGrandsire: string;
  readonly maternalGreatGrandsire: string;
  readonly maternalGreatGreatGrandsire: string;
  readonly performance: {
    readonly shipmentCount: number;
    readonly totalRevenue: number;
    readonly averagePrice: number;
    readonly maxPrice: number;
    readonly minPrice: number;
    readonly priceVariance: number;
  };
  readonly statistics: {
    readonly averageAge: number;
    readonly averageWeight: number;
    readonly healthRate: number;
  };
  readonly trend: {
    readonly priceTrend: Trend;
    readonly demandTrend: Trend;
  };
}

export const createPedigreeAnalysis = (
  sire: string,
  maternalGrandsire: string,
  maternalGreatGrandsire: string,
  maternalGreatGreatGrandsire: string,
  performance: {
    shipmentCount: number;
    totalRevenue: number;
    averagePrice: number;
    maxPrice: number;
    minPrice: number;
    priceVariance: number;
  },
  statistics: {
    averageAge: number;
    averageWeight: number;
    healthRate: number;
  },
  trend: {
    priceTrend: Trend;
    demandTrend: Trend;
  }
): PedigreeAnalysis => ({
  sire,
  maternalGrandsire,
  maternalGreatGrandsire,
  maternalGreatGreatGrandsire,
  performance,
  statistics,
  trend,
});
