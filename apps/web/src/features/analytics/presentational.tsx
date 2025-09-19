// 分析・レポートページのプレゼンテーションコンポーネント

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GetAnalyticsOverviewSuccess, GetAnalyticsPedigreeSuccess, GetAnalyticsTrendsSuccess } from "@/services/analyticsService";
import type { AnalyticsFilters, GenderAnalysis, PriceDistribution } from "@/types/analytics";
import { BarChart3, Calendar, Download, FileText, Filter, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";
import GenderAnalysisChart from "./components/GenderAnalysisChart";
import PriceDistributionChart from "./components/PriceDistributionChart";
import ShipmentTrendChart from "./components/ShipmentTrendChart";

interface AnalyticsPresentationProps {
  overviewData: GetAnalyticsOverviewSuccess["data"];
  trendsData: GetAnalyticsTrendsSuccess["data"];
  pedigreeData: GetAnalyticsPedigreeSuccess["data"];
  priceDistributionData: PriceDistribution[];
  genderAnalysisData: GenderAnalysis[];
  filters: AnalyticsFilters;
}

export default function AnalyticsPresentation({
  overviewData,
  trendsData,
  pedigreeData,
  priceDistributionData,
  genderAnalysisData,
  filters,
}: AnalyticsPresentationProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<"1M" | "3M" | "6M" | "1Y">("1Y");
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: "pdf" | "excel" | "csv") => {
    setIsExporting(true);
    try {
      // エクスポート処理
      console.log(`Exporting as ${format}`);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">出荷分析ダッシュボード</h1>
              <p className="mt-1 text-sm text-gray-600">
                期間: {filters.startDate || "開始日未設定"} ～ {filters.endDate || "終了日未設定"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-600" />
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value as "1M" | "3M" | "6M" | "1Y")}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                >
                  <option value="1M">過去1ヶ月</option>
                  <option value="3M">過去3ヶ月</option>
                  <option value="6M">過去6ヶ月</option>
                  <option value="1Y">過去1年</option>
                </select>
              </div>
              <Button onClick={() => handleExport("pdf")} disabled={isExporting} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Download className="w-4 h-4 mr-2" />
                {isExporting ? "エクスポート中..." : "PDF出力"}
              </Button>
            </div>
          </div>
        </div>

        {/* KPIカード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">総出荷数</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overviewData.metrics.shippedCalves.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {getTrendIcon(overviewData.trends.shipmentTrend)}
                <span className={`ml-1 ${getTrendColor(overviewData.trends.shipmentTrend)}`}>
                  {overviewData.comparison.shipmentChange > 0 ? "+" : ""}
                  {overviewData.comparison.shipmentChange.toFixed(1)}%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">総売上</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">¥{overviewData.metrics.totalRevenue.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {getTrendIcon(overviewData.trends.revenueTrend)}
                <span className={`ml-1 ${getTrendColor(overviewData.trends.revenueTrend)}`}>
                  {overviewData.comparison.revenueChange > 0 ? "+" : ""}
                  {overviewData.comparison.revenueChange.toFixed(1)}%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">平均価格</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">¥{overviewData.metrics.averagePrice.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {getTrendIcon(overviewData.trends.priceTrend)}
                <span className={`ml-1 ${getTrendColor(overviewData.trends.priceTrend)}`}>
                  {overviewData.comparison.priceChange > 0 ? "+" : ""}
                  {overviewData.comparison.priceChange.toFixed(1)}%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">出荷率</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overviewData.metrics.shipmentRate.toFixed(1)}%</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {getTrendIcon(overviewData.trends.shipmentTrend)}
                <span className={`ml-1 ${getTrendColor(overviewData.trends.shipmentTrend)}`}>
                  {overviewData.comparison.shipmentRateChange > 0 ? "+" : ""}
                  {overviewData.comparison.shipmentRateChange.toFixed(1)}%
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* チャートセクション */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 出荷推移 */}
          <Card>
            <CardHeader>
              <CardTitle>出荷推移</CardTitle>
            </CardHeader>
            <CardContent>
              <ShipmentTrendChart data={trendsData} />
            </CardContent>
          </Card>

          {/* 価格分布 */}
          <Card>
            <CardHeader>
              <CardTitle>価格分布</CardTitle>
            </CardHeader>
            <CardContent>
              <PriceDistributionChart data={priceDistributionData} />
            </CardContent>
          </Card>
        </div>

        {/* 性別分析チャート */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>性別分析</CardTitle>
            </CardHeader>
            <CardContent>
              <GenderAnalysisChart data={genderAnalysisData} />
            </CardContent>
          </Card>

          {/* 空のカード（将来の拡張用） */}
          <Card>
            <CardHeader>
              <CardTitle>追加分析</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center text-gray-500">
                追加の分析チャート
                <br />
                実装予定
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 血統分析テーブル */}
        <Card>
          <CardHeader>
            <CardTitle>血統分析トップ10</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">父牛血統</th>
                    <th className="text-left py-2">母の父血統</th>
                    <th className="text-right py-2">出荷数</th>
                    <th className="text-right py-2">平均価格</th>
                    <th className="text-right py-2">総売上</th>
                  </tr>
                </thead>
                <tbody>
                  {pedigreeData.slice(0, 10).map((pedigree, index) => (
                    <tr key={`${pedigree.sire}-${pedigree.maternalGrandsire}-${index}`} className="border-b">
                      <td className="py-2">{pedigree.sire || "-"}</td>
                      <td className="py-2">{pedigree.maternalGrandsire || "-"}</td>
                      <td className="text-right py-2">{pedigree.performance.shipmentCount}</td>
                      <td className="text-right py-2">¥{pedigree.performance.averagePrice.toLocaleString()}</td>
                      <td className="text-right py-2">¥{pedigree.performance.totalRevenue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
