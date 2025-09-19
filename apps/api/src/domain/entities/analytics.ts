// 分析関連のエンティティ

import type {
  Comparison,
  GenderAnalysis,
  Metrics,
  PedigreeAnalysis,
  Period,
  PriceDistribution,
  TimeSeriesData,
  Trends,
} from "../value-objects/analytics";

// 型の再エクスポート
export type {
  PriceDistribution,
  GenderAnalysis,
  TimeSeriesData,
  PedigreeAnalysis,
} from "../value-objects/analytics";

// 分析統計エンティティ
export interface AnalyticsStats {
  readonly period: Period;
  readonly metrics: Metrics;
  readonly comparison: Comparison;
  readonly trends: Trends;
}

export const createAnalyticsStats = (period: Period, metrics: Metrics, comparison: Comparison, trends: Trends): AnalyticsStats => ({
  period,
  metrics,
  comparison,
  trends,
});

// 分析レポートエンティティ
export interface AnalyticsReport {
  readonly id: string;
  readonly farmId: string;
  readonly period: Period;
  readonly stats: AnalyticsStats;
  readonly priceDistribution: PriceDistribution[];
  readonly genderAnalysis: GenderAnalysis[];
  readonly timeSeriesData: TimeSeriesData[];
  readonly pedigreeAnalysis: PedigreeAnalysis[];
  readonly createdAt: string;
}

export const createAnalyticsReport = (
  farmId: string,
  period: Period,
  stats: AnalyticsStats,
  priceDistribution: PriceDistribution[],
  genderAnalysis: GenderAnalysis[],
  timeSeriesData: TimeSeriesData[],
  pedigreeAnalysis: PedigreeAnalysis[]
): AnalyticsReport => ({
  id: crypto.randomUUID(),
  farmId,
  period,
  stats,
  priceDistribution,
  genderAnalysis,
  timeSeriesData,
  pedigreeAnalysis,
  createdAt: new Date().toISOString(),
});

// 分析フィルターエンティティ
export interface AnalyticsFilter {
  readonly farmId: string;
  readonly startDate?: string;
  readonly endDate?: string;
  readonly gender?: "MALE" | "FEMALE" | "CASTRATED";
  readonly pedigree?: string;
  readonly priceRange?: {
    readonly min: number;
    readonly max: number;
  };
  readonly ageRange?: {
    readonly min: number;
    readonly max: number;
  };
}

export const createAnalyticsFilter = (input: {
  farmId: string;
  startDate?: string;
  endDate?: string;
  gender?: "MALE" | "FEMALE" | "CASTRATED";
  pedigree?: string;
  priceRange?: { min: number; max: number };
  ageRange?: { min: number; max: number };
}): AnalyticsFilter => ({
  farmId: input.farmId,
  startDate: input.startDate,
  endDate: input.endDate,
  gender: input.gender,
  pedigree: input.pedigree,
  priceRange: input.priceRange,
  ageRange: input.ageRange,
});
