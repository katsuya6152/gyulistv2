// 分析・レポートAPI（DDD+関数型+オニオンアーキテクチャ）

import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { GetAnalyticsOverviewUseCase } from "../../application/use-cases/analytics/get-analytics-overview";
import { GetAnalyticsPedigreeUseCase } from "../../application/use-cases/analytics/get-analytics-pedigree";
import { GetAnalyticsTrendsUseCase } from "../../application/use-cases/analytics/get-analytics-trends";
import { createAnalyticsService } from "../../domain/services/analytics";
import { TOKENS, container } from "../../infrastructure/container";
import { DrizzleCalfRepository } from "../../infrastructure/repositories/drizzle-calf-repository";

// 依存性注入の設定
const calfRepository = new DrizzleCalfRepository();
const analyticsService = createAnalyticsService();

// コンテナにサービスを登録
container.register(TOKENS.CalfRepository, () => calfRepository);
container.register(TOKENS.AnalyticsService, () => analyticsService);
container.register(
  TOKENS.GetAnalyticsOverviewUseCase,
  () => new GetAnalyticsOverviewUseCase(container.resolve(TOKENS.CalfRepository), container.resolve(TOKENS.AnalyticsService))
);
container.register(
  TOKENS.GetAnalyticsTrendsUseCase,
  () => new GetAnalyticsTrendsUseCase(container.resolve(TOKENS.CalfRepository), container.resolve(TOKENS.AnalyticsService))
);
container.register(
  TOKENS.GetAnalyticsPedigreeUseCase,
  () => new GetAnalyticsPedigreeUseCase(container.resolve(TOKENS.CalfRepository), container.resolve(TOKENS.AnalyticsService))
);

export function createAnalyticsRoutes() {
  const analyticsRouter = new Hono();

  // バリデーションスキーマ
  const overviewQuerySchema = z.object({
    farmId: z.string().uuid(),
    startDate: z.string().date().optional(),
    endDate: z.string().date().optional(),
  });

  const trendsQuerySchema = z.object({
    farmId: z.string().uuid(),
    startDate: z.string().date().optional(),
    endDate: z.string().date().optional(),
    metrics: z.array(z.enum(["shipments", "revenue", "price"])).optional(),
    groupBy: z.enum(["day", "week", "month"]).optional(),
  });

  const pedigreeQuerySchema = z.object({
    farmId: z.string().uuid(),
    startDate: z.string().date().optional(),
    endDate: z.string().date().optional(),
    analysisType: z.enum(["sire", "maternal", "full"]).optional(),
    limit: z
      .string()
      .transform((val) => Number.parseInt(val, 10))
      .pipe(z.number().int().positive().max(100))
      .optional(),
  });

  const generateReportSchema = z.object({
    reportType: z.enum(["overview", "trends", "pedigree", "custom"]),
    format: z.enum(["pdf", "excel", "csv"]),
    filters: z.object({
      farmId: z.string().uuid(),
      startDate: z.string().date().optional(),
      endDate: z.string().date().optional(),
      gender: z.enum(["MALE", "FEMALE", "CASTRATED"]).optional(),
      pedigree: z.string().optional(),
      priceRange: z
        .object({
          min: z.number().nonnegative(),
          max: z.number().nonnegative(),
        })
        .optional(),
      ageRange: z
        .object({
          min: z.number().nonnegative(),
          max: z.number().nonnegative(),
        })
        .optional(),
    }),
    charts: z.array(
      z.object({
        id: z.string(),
        type: z.enum(["line", "bar", "pie", "scatter", "area"]),
        title: z.string(),
        data: z.array(z.any()),
        options: z.any().optional(),
      })
    ),
    tables: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        columns: z.array(z.string()),
        data: z.array(z.any()),
        options: z.any().optional(),
      })
    ),
  });

  return (
    analyticsRouter
      // 分析概要データを取得
      .get("/overview", zValidator("query", overviewQuerySchema), async (c) => {
        const { farmId, startDate, endDate } = c.req.valid("query");

        const useCase = container.resolve<GetAnalyticsOverviewUseCase>(TOKENS.GetAnalyticsOverviewUseCase);
        const result = await useCase.execute({
          farmId,
          startDate,
          endDate,
        });

        if (result.success) {
          return c.json(result);
        }
        return c.json(result, 500);
      })
      // トレンドデータを取得
      .get("/trends", zValidator("query", trendsQuerySchema), async (c) => {
        const { farmId, startDate, endDate, groupBy = "month" } = c.req.valid("query");

        const useCase = container.resolve<GetAnalyticsTrendsUseCase>(TOKENS.GetAnalyticsTrendsUseCase);
        const result = await useCase.execute({
          farmId,
          startDate,
          endDate,
          groupBy,
        });

        if (result.success) {
          return c.json(result);
        }
        return c.json(result, 500);
      })
      // 血統分析データを取得
      .get("/pedigree", zValidator("query", pedigreeQuerySchema), async (c) => {
        const { farmId, startDate, endDate, analysisType = "sire", limit = 20 } = c.req.valid("query");

        const useCase = container.resolve<GetAnalyticsPedigreeUseCase>(TOKENS.GetAnalyticsPedigreeUseCase);
        const result = await useCase.execute({
          farmId,
          startDate,
          endDate,
          analysisType,
          limit,
        });

        if (result.success) {
          return c.json(result);
        }
        return c.json(result, 500);
      })
      // 価格分布データを取得
      .get("/price-distribution", zValidator("query", overviewQuerySchema), async (c) => {
        const { farmId, startDate, endDate } = c.req.valid("query");

        try {
          // 子牛データを取得
          const calvesResult = await calfRepository.findByFarmId(farmId);
          if (!calvesResult.success) {
            return c.json({ success: false, error: calvesResult.error.message }, 500);
          }

          // フィルタリング
          let filteredCalves = calvesResult.data;
          if (startDate) {
            filteredCalves = filteredCalves.filter((calf) => calf.birthDate >= startDate);
          }
          if (endDate) {
            filteredCalves = filteredCalves.filter((calf) => calf.birthDate <= endDate);
          }

          // 価格分布データを計算
          const analyticsService = container.resolve(TOKENS.AnalyticsService) as ReturnType<typeof createAnalyticsService>;
          const priceDistribution = analyticsService.calculatePriceDistribution(filteredCalves);

          return c.json({
            success: true,
            data: priceDistribution,
          });
        } catch (error) {
          console.error("Price distribution error:", error);
          return c.json(
            {
              success: false,
              error: error instanceof Error ? error.message : "価格分布データの取得に失敗しました",
            },
            500
          );
        }
      })
      // 性別分析データを取得
      .get("/gender-analysis", zValidator("query", overviewQuerySchema), async (c) => {
        const { farmId, startDate, endDate } = c.req.valid("query");

        try {
          // 子牛データを取得
          const calvesResult = await calfRepository.findByFarmId(farmId);
          if (!calvesResult.success) {
            return c.json({ success: false, error: calvesResult.error.message }, 500);
          }

          // フィルタリング
          let filteredCalves = calvesResult.data;
          if (startDate) {
            filteredCalves = filteredCalves.filter((calf) => calf.birthDate >= startDate);
          }
          if (endDate) {
            filteredCalves = filteredCalves.filter((calf) => calf.birthDate <= endDate);
          }

          // 性別分析データを計算
          const analyticsService = container.resolve(TOKENS.AnalyticsService) as ReturnType<typeof createAnalyticsService>;
          const genderAnalysis = analyticsService.calculateGenderAnalysis(filteredCalves);

          return c.json({
            success: true,
            data: genderAnalysis,
          });
        } catch (error) {
          console.error("Gender analysis error:", error);
          return c.json(
            {
              success: false,
              error: error instanceof Error ? error.message : "性別分析データの取得に失敗しました",
            },
            500
          );
        }
      })
      // レポート生成
      .post("/reports", zValidator("json", generateReportSchema), async (c) => {
        try {
          const data = c.req.valid("json");

          // レポート生成のロジック（実装予定）
          const reportId = `report_${Date.now()}`;
          const downloadUrl = `/api/v2/analytics/reports/${reportId}/download`;
          const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24時間後

          // ログ出力（デバッグ用）
          console.log("Report generation request:", {
            reportType: data.reportType,
            format: data.format,
            filters: data.filters,
            chartsCount: data.charts.length,
            tablesCount: data.tables.length,
          });

          return c.json({
            success: true,
            data: {
              reportId,
              downloadUrl,
              expiresAt,
            },
          });
        } catch (error) {
          console.error("Report generation error:", error);
          return c.json(
            {
              success: false,
              error: error instanceof Error ? error.message : "レポート生成に失敗しました",
            },
            500
          );
        }
      })
  );
}
