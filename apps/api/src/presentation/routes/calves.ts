import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { BatchUpdateCalfShipmentsUseCase } from "../../application/use-cases/calf-shipment/batch-update-calf-shipments";
import { CancelCalfShipmentUseCase } from "../../application/use-cases/calf-shipment/cancel-calf-shipment";
import { GetCalfShipmentsUseCase } from "../../application/use-cases/calf-shipment/get-calf-shipments";
import { UpdateCalfShipmentUseCase } from "../../application/use-cases/calf-shipment/update-calf-shipment";
import { createCalf } from "../../domain/entities/calf";
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

  const createCalfSchema = z.object({
    individualNumber: z.string().min(1),
    calfName: z.string().min(1),
    damName: z.string().optional(),
    damId: z.string().uuid().optional(),
    birthDate: z.string().date(),
    gender: z.enum(["MALE", "FEMALE", "CASTRATED"]),
    // 血統情報
    sirePedigree: z.string().optional(),
    maternalGrandsire: z.string().optional(),
    maternalGreatGrandsire: z.string().optional(),
    maternalGreatGreatGrandsire: z.string().optional(),
    // 繁殖・出産情報
    matingDate: z.string().date().optional(),
    expectedBirthDate: z.string().date().optional(),
    matingInterval: z.number().positive().optional(),
    // 個体情報
    weight: z.number().positive().optional(),
    ageInDays: z.number().int().positive().optional(),
    // 取引情報
    auctionDate: z.string().date().optional(),
    price: z.number().nonnegative().optional(),
    buyer: z.string().optional(),
    remarks: z.string().optional(),
    farmId: z.string().uuid(),
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
          const batchUpdateCalfShipmentsUseCase = new BatchUpdateCalfShipmentsUseCase(calfRepository);
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
      // 新規子牛作成
      .post("/", zValidator("json", createCalfSchema), async (c) => {
        try {
          const data = c.req.valid("json");

          // 子牛エンティティを作成
          const calf = createCalf({
            individualNumber: data.individualNumber,
            calfName: data.calfName,
            damName: data.damName || null,
            damId: data.damId || null, // 母牛ID（nullable）
            birthDate: data.birthDate,
            gender: data.gender,
            // 血統情報
            sirePedigree: data.sirePedigree || null,
            maternalGrandsire: data.maternalGrandsire || null,
            maternalGreatGrandsire: data.maternalGreatGrandsire || null,
            maternalGreatGreatGrandsire: data.maternalGreatGreatGrandsire || null,
            // 繁殖・出産情報
            matingDate: data.matingDate || null,
            expectedBirthDate: data.expectedBirthDate || null,
            matingInterval: data.matingInterval || null,
            // 個体情報
            weight: data.weight || null,
            ageInDays: data.ageInDays || null,
            // 取引情報
            auctionDate: data.auctionDate || null,
            price: data.price || null,
            buyer: data.buyer || null,
            remarks: data.remarks || null,
            farmId: data.farmId,
          });

          // データベースに保存
          const result = await calfRepository.save(calf);

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
