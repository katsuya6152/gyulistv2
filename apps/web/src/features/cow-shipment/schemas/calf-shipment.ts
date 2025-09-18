import { z } from "zod";

// 子牛出荷情報のバリデーションスキーマ
export const calfShipmentSchema = z.object({
  id: z.string().uuid(),
  individualNumber: z.string().min(3),
  calfName: z.string().min(1),
  damName: z.string().min(1),
  damId: z.string().uuid(),
  birthDate: z.string().date(),
  gender: z.enum(["MALE", "FEMALE", "CASTRATED"]),
  weight: z.number().positive().nullable(),
  auctionDate: z.string().date().nullable(),
  price: z.number().nonnegative().nullable(),
  buyer: z.string().min(1).nullable(),
  remarks: z.string().nullable(),
  farmId: z.string().uuid(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const updateCalfShipmentSchema = z.object({
  weight: z.number().positive().optional(),
  auctionDate: z.string().date().optional(),
  price: z.number().nonnegative().optional(),
  buyer: z.string().min(1).optional(),
  remarks: z.string().optional(),
});

export const getCalfShipmentsParamsSchema = z.object({
  farmId: z.string().uuid(),
  gender: z.enum(["MALE", "FEMALE", "CASTRATED"]).optional(),
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
  cursor: z.string().optional(),
  limit: z.number().int().positive().max(100).optional(),
});

export const batchUpdateCalfShipmentSchema = z.object({
  id: z.string().uuid(),
  weight: z.number().positive().optional(),
  auctionDate: z.string().date().optional(),
  price: z.number().nonnegative().optional(),
  buyer: z.string().min(1).optional(),
  remarks: z.string().optional(),
});

export const batchUpdateCalfShipmentsParamsSchema = z.object({
  updates: z.array(batchUpdateCalfShipmentSchema).min(1).max(50),
});

export const shipmentFiltersSchema = z.object({
  farmId: z.string().uuid(),
  gender: z.enum(["MALE", "FEMALE", "CASTRATED"]).optional(),
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
});

export type CalfShipment = z.infer<typeof calfShipmentSchema>;
export type UpdateCalfShipment = z.infer<typeof updateCalfShipmentSchema>;
export type GetCalfShipmentsParams = z.infer<typeof getCalfShipmentsParamsSchema>;
export type BatchUpdateCalfShipment = z.infer<typeof batchUpdateCalfShipmentSchema>;
export type BatchUpdateCalfShipmentsParams = z.infer<typeof batchUpdateCalfShipmentsParamsSchema>;
export type ShipmentFilters = z.infer<typeof shipmentFiltersSchema>;
