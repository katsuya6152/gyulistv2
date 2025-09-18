import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { GetCowShipmentInfoUseCase } from "../../application/use-cases/cow-shipment/get-cow-shipment-info";
import { DrizzleCalfRepository } from "../../infrastructure/repositories/drizzle-calf-repository";
import { DrizzleCowRepository } from "../../infrastructure/repositories/drizzle-cow-repository";

// リポジトリのインスタンス化
const cowRepository = new DrizzleCowRepository();
const calfRepository = new DrizzleCalfRepository();

export function createCowsRoutes() {
  const cowsRouter = new Hono();

  // 母牛詳細と子牛出荷一覧取得
  return cowsRouter.get("/:cowId/calves/shipments", async (c) => {
    try {
      const cowId = c.req.param("cowId");
      const getCowShipmentInfoUseCase = new GetCowShipmentInfoUseCase(
        cowRepository,
        calfRepository
      );
      const result = await getCowShipmentInfoUseCase.execute(cowId);

      if (!result.success) {
        return c.json(
          {
            success: false,
            error: result.error.message,
          },
          400
        );
      }

      return c.json({
        success: true,
        data: result.data,
      });
    } catch {
      return c.json(
        {
          success: false,
          error: "Internal server error",
        },
        500
      );
    }
  });
}
