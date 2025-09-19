// 分析・レポートAPIサービス

import { client } from "@/lib/api-client";
import type { GenderAnalysis, PriceDistribution } from "@/types/analytics";
import type { InferRequestType, InferResponseType } from "hono/client";

// 型推論を使用してリクエスト型を取得
type GetAnalyticsOverviewRequest = InferRequestType<typeof client.api.v2.analytics.overview.$get>["query"];
type GetAnalyticsTrendsRequest = InferRequestType<typeof client.api.v2.analytics.trends.$get>["query"];
type GetAnalyticsPedigreeRequest = InferRequestType<typeof client.api.v2.analytics.pedigree.$get>["query"];
type GenerateReportRequest = InferRequestType<typeof client.api.v2.analytics.reports.$post>["json"];

// HTTPステータス200の時の型を直接取得
export type GetAnalyticsOverviewSuccess = InferResponseType<typeof client.api.v2.analytics.overview.$get, 200>;
export type GetAnalyticsTrendsSuccess = InferResponseType<typeof client.api.v2.analytics.trends.$get, 200>;
export type GetAnalyticsPedigreeSuccess = InferResponseType<typeof client.api.v2.analytics.pedigree.$get, 200>;
export type GenerateReportSuccess = InferResponseType<typeof client.api.v2.analytics.reports.$post, 200>;

class AnalyticsService {
  /**
   * 分析概要データを取得
   */
  async getOverview(params: GetAnalyticsOverviewRequest): Promise<GetAnalyticsOverviewSuccess["data"]> {
    const response = await client.api.v2.analytics.overview.$get({
      query: params,
    });

    if (response.status !== 200) {
      const errorData = await response.json();
      throw new Error("error" in errorData ? errorData.error : "分析概要データの取得に失敗しました");
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * トレンドデータを取得
   */
  async getTrends(params: GetAnalyticsTrendsRequest): Promise<GetAnalyticsTrendsSuccess["data"]> {
    const response = await client.api.v2.analytics.trends.$get({
      query: params,
    });

    if (response.status !== 200) {
      const errorData = await response.json();
      throw new Error("error" in errorData ? errorData.error : "トレンドデータの取得に失敗しました");
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * 血統分析データを取得
   */
  async getPedigreeAnalysis(params: GetAnalyticsPedigreeRequest): Promise<GetAnalyticsPedigreeSuccess["data"]> {
    const response = await client.api.v2.analytics.pedigree.$get({
      query: params,
    });

    if (response.status !== 200) {
      const errorData = await response.json();
      throw new Error("error" in errorData ? errorData.error : "血統分析データの取得に失敗しました");
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * 価格分布データを取得
   */
  async getPriceDistribution(params: GetAnalyticsOverviewRequest): Promise<PriceDistribution[]> {
    const response = await client.api.v2.analytics["price-distribution"].$get({
      query: params,
    });

    if (response.status !== 200) {
      const errorData = await response.json();
      throw new Error("error" in errorData ? errorData.error : "価格分布データの取得に失敗しました");
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * 性別分析データを取得
   */
  async getGenderAnalysis(params: GetAnalyticsOverviewRequest): Promise<GenderAnalysis[]> {
    const response = await client.api.v2.analytics["gender-analysis"].$get({
      query: params,
    });

    if (response.status !== 200) {
      const errorData = await response.json();
      throw new Error("error" in errorData ? errorData.error : "性別分析データの取得に失敗しました");
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * レポートを生成
   */
  async generateReport(config: GenerateReportRequest): Promise<GenerateReportSuccess> {
    const response = await client.api.v2.analytics.reports.$post({
      json: config,
    });

    if (response.status !== 200) {
      const errorData = await response.json();
      throw new Error("error" in errorData ? errorData.error : "レポート生成に失敗しました");
    }

    return response.json();
  }
}

export const analyticsService = new AnalyticsService();
