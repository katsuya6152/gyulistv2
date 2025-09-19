// 分析・レポートページのContainer（Server Component）

import { analyticsService } from "@/services/analyticsService";
import { Suspense } from "react";
import AnalyticsPresentation from "./presentational";

interface AnalyticsContainerProps {
  searchParams?: {
    farmId?: string;
    startDate?: string;
    endDate?: string;
    gender?: "MALE" | "FEMALE" | "CASTRATED";
  };
}

export default async function AnalyticsContainer({ searchParams }: AnalyticsContainerProps) {
  // デフォルトの農場ID（実際の実装では認証情報から取得）
  const defaultFarmId = "550e8400-e29b-41d4-a716-446655440001";

  const filters = {
    farmId: searchParams?.farmId || defaultFarmId,
    startDate: searchParams?.startDate,
    endDate: searchParams?.endDate,
    gender: searchParams?.gender,
  };

  try {
    // 分析データを取得
    const [overviewResult, trendsResult, pedigreeResult, priceDistributionResult, genderAnalysisResult] = await Promise.all([
      analyticsService.getOverview({
        farmId: filters.farmId,
        startDate: filters.startDate,
        endDate: filters.endDate,
      }),
      analyticsService.getTrends({
        farmId: filters.farmId,
        startDate: filters.startDate,
        endDate: filters.endDate,
        groupBy: "month",
      }),
      analyticsService.getPedigreeAnalysis({
        farmId: filters.farmId,
        startDate: filters.startDate,
        endDate: filters.endDate,
        analysisType: "sire",
        limit: "20",
      }),
      analyticsService.getPriceDistribution({
        farmId: filters.farmId,
        startDate: filters.startDate,
        endDate: filters.endDate,
      }),
      analyticsService.getGenderAnalysis({
        farmId: filters.farmId,
        startDate: filters.startDate,
        endDate: filters.endDate,
      }),
    ]);

    return (
      <Suspense fallback={<AnalyticsSkeleton />}>
        <AnalyticsPresentation
          overviewData={overviewResult}
          trendsData={trendsResult}
          pedigreeData={pedigreeResult}
          priceDistributionData={priceDistributionResult}
          genderAnalysisData={genderAnalysisResult}
          filters={filters}
        />
      </Suspense>
    );
  } catch (error) {
    console.error("Failed to load analytics data:", error);
    return (
      <div className="p-4">
        <div className="text-red-600">分析データの読み込みに失敗しました: {error instanceof Error ? error.message : "不明なエラー"}</div>
      </div>
    );
  }
}

function AnalyticsSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          {/* ヘッダー */}
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>

          {/* KPIカード */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={`skeleton-${Date.now()}-${i}`} className="h-32 bg-gray-200 rounded-lg" />
            ))}
          </div>

          {/* チャート */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="h-80 bg-gray-200 rounded-lg" />
            <div className="h-80 bg-gray-200 rounded-lg" />
          </div>

          {/* テーブル */}
          <div className="h-96 bg-gray-200 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
