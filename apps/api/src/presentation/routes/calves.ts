import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { BatchUpdateCalfShipmentsUseCase } from "../../application/use-cases/calf-shipment/batch-update-calf-shipments";
import { CancelCalfShipmentUseCase } from "../../application/use-cases/calf-shipment/cancel-calf-shipment";
import { GetCalfShipmentsUseCase } from "../../application/use-cases/calf-shipment/get-calf-shipments";
import { UpdateCalfShipmentUseCase } from "../../application/use-cases/calf-shipment/update-calf-shipment";
import { DrizzleCalfRepository } from "../../infrastructure/repositories/drizzle-calf-repository";

// リポジトリのインスタンス化
const calfRepository = new DrizzleCalfRepository();

export function createCalvesRoutes() {
  const calvesRouter = new Hono();

  // バリデーションスキーマ
  const getCalfShipmentsSchema = z.object({
    farmId: z.string().uuid(),
    gender: z.enum(["MALE", "FEMALE", "CASTRATED"]).optional(),
    startDate: z.string().date().optional(),
    endDate: z.string().date().optional(),
    cursor: z.string().optional(),
    limit: z
      .string()
      .transform((val) => Number.parseInt(val, 10))
      .pipe(z.number().int().positive().max(100))
      .optional(),
  });

  const updateCalfShipmentSchema = z.object({
    weight: z.number().positive().optional(),
    auctionDate: z.string().date().optional(),
    price: z.number().nonnegative().optional(),
    buyer: z.string().min(1).optional(),
    remarks: z.string().optional(),
  });

  const batchUpdateCalfShipmentsSchema = z.object({
    updates: z
      .array(
        z.object({
          id: z.string().uuid(),
          weight: z.number().positive().optional(),
          auctionDate: z.string().date().optional(),
          price: z.number().nonnegative().optional(),
          buyer: z.string().min(1).optional(),
          remarks: z.string().optional(),
        })
      )
      .min(1)
      .max(50),
  });

  // 子牛出荷一覧取得（無限スクロール対応）
  return (
    calvesRouter
      .get("/shipments", zValidator("query", getCalfShipmentsSchema), async (c) => {
        try {
          const query = c.req.valid("query");
          const getCalfShipmentsUseCase = new GetCalfShipmentsUseCase(calfRepository);
          const result = await getCalfShipmentsUseCase.execute(query);

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
      })

      // 子牛出荷情報更新（インライン編集対応）
      .put("/:id/shipment", zValidator("json", updateCalfShipmentSchema), async (c) => {
        try {
          const id = c.req.param("id");
          const body = c.req.valid("json");
          const updateCalfShipmentUseCase = new UpdateCalfShipmentUseCase(calfRepository);
          const result = await updateCalfShipmentUseCase.execute({ id, ...body });

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
      })

      // 子牛出荷情報一括更新
      .put("/shipments/batch", zValidator("json", batchUpdateCalfShipmentsSchema), async (c) => {
        try {
          const body = c.req.valid("json");
          const batchUpdateCalfShipmentsUseCase = new BatchUpdateCalfShipmentsUseCase(
            calfRepository
          );
          const result = await batchUpdateCalfShipmentsUseCase.execute(body);

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
      })

      // 子牛出荷情報削除（出荷取り消し）
      .put("/:id/shipment/cancel", async (c) => {
        try {
          const id = c.req.param("id");
          const cancelCalfShipmentUseCase = new CancelCalfShipmentUseCase(calfRepository);
          const result = await cancelCalfShipmentUseCase.execute(id);

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
      })
  );
}
