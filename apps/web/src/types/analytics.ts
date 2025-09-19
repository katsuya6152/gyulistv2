// 分析・レポート関連の型定義

// 基本統計データ（バックエンドの型と同期）
export interface AnalyticsStats {
  period: {
    start: string;
    end: string;
    days: number;
  };
  metrics: {
    totalCalves: number;
    shippedCalves: number;
    totalRevenue: number;
    averagePrice: number;
    maxPrice: number;
    minPrice: number;
    shipmentRate: number;
  };
  comparison: {
    shipmentChange: number;
    revenueChange: number;
    priceChange: number;
    shipmentRateChange: number;
  };
  trends: {
    shipmentTrend: "up" | "down" | "stable";
    revenueTrend: "up" | "down" | "stable";
    priceTrend: "up" | "down" | "stable";
  };
}

// 時系列データ
export interface TimeSeriesData {
  date: string;
  shipments: number;
  revenue: number;
  averagePrice: number;
  maxPrice: number;
  minPrice: number;
  previousYear?: {
    shipments: number;
    revenue: number;
    averagePrice: number;
  };
}

// 血統分析データ
export interface PedigreeAnalysis {
  sire: string;
  maternalGrandsire: string;
  maternalGreatGrandsire: string;
  maternalGreatGreatGrandsire: string;
  performance: {
    shipmentCount: number;
    totalRevenue: number;
    averagePrice: number;
    maxPrice: number;
    minPrice: number;
    priceVariance: number;
  };
  statistics: {
    averageAge: number;
    averageWeight: number;
    healthRate: number;
  };
  trend: {
    priceTrend: "up" | "down" | "stable";
    demandTrend: "up" | "down" | "stable";
  };
}

// 価格分布データ
export interface PriceDistribution {
  priceRange: string;
  count: number;
  percentage: number;
}

// 年齢分析データ
export interface AgeAnalysis {
  ageGroup: string;
  averagePrice: number;
  count: number;
  totalRevenue: number;
}

// 性別分析データ
export interface GenderAnalysis {
  gender: "MALE" | "FEMALE" | "CASTRATED";
  averagePrice: number;
  count: number;
  totalRevenue: number;
  percentage: number;
}

// フィルター
export interface AnalyticsFilters {
  farmId: string;
  startDate?: string;
  endDate?: string;
  gender?: "MALE" | "FEMALE" | "CASTRATED";
  pedigree?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  ageRange?: {
    min: number;
    max: number;
  };
}

// レポート設定
export interface ReportConfig {
  title: string;
  dateRange: {
    start: string;
    end: string;
  };
  filters: AnalyticsFilters;
  charts: ChartConfig[];
  tables: TableConfig[];
}

// チャート設定
export interface ChartConfig {
  id: string;
  type: "line" | "bar" | "pie" | "scatter" | "area";
  title: string;
  data: any[];
  options?: any;
}

// テーブル設定
export interface TableConfig {
  id: string;
  title: string;
  columns: string[];
  data: any[];
  options?: any;
}
