// 子牛出荷一覧のContainer（Server Component）

import { Suspense } from "react";
import { shipmentFiltersSchema } from "../schemas/calf-shipment";
import { getCalfShipmentsAction } from "./actions";
import CalfShipmentListPresentation from "./presentational";

interface CalfShipmentListContainerProps {
  searchParams?: {
    farmId?: string;
    gender?: "MALE" | "FEMALE" | "CASTRATED";
    startDate?: string;
    endDate?: string;
    cursor?: string;
    limit?: string;
  };
}

export default async function CalfShipmentListContainer({ searchParams }: CalfShipmentListContainerProps) {
  // デフォルトの農場ID（実際の実装では認証情報から取得）
  const defaultFarmId = "550e8400-e29b-41d4-a716-446655440001";

  const filters = {
    farmId: searchParams?.farmId || defaultFarmId,
    gender: searchParams?.gender,
    startDate: searchParams?.startDate,
    endDate: searchParams?.endDate,
  };

  // バリデーション
  const validationResult = shipmentFiltersSchema.safeParse(filters);
  if (!validationResult.success) {
    return (
      <div className="p-4">
        <div className="text-red-600">パラメータが無効です: {validationResult.error.message}</div>
      </div>
    );
  }

  const validatedFilters = validationResult.data;
  const limit = searchParams?.limit ? Number.parseInt(searchParams.limit, 10) : 20;

  try {
    // 初期データを取得
    const result = await getCalfShipmentsAction({
      ...validatedFilters,
      limit: limit,
    });

    if (result.success && result.data) {
      return (
        <Suspense fallback={<CalfShipmentListSkeleton />}>
          <CalfShipmentListPresentation initialData={result.data} filters={validatedFilters} limit={limit} />
        </Suspense>
      );
    }

    return (
      <div className="p-4">
        <div className="text-red-600">子牛出荷一覧の読み込みに失敗しました: {result.error || "不明なエラー"}</div>
      </div>
    );
  } catch (error) {
    console.error("Failed to load calf shipments:", error);
    return (
      <div className="p-4">
        <div className="text-red-600">子牛出荷一覧の読み込みに失敗しました: {error instanceof Error ? error.message : "不明なエラー"}</div>
      </div>
    );
  }
}

function CalfShipmentListSkeleton() {
  return (
    <div className="p-6">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={`skeleton-${Date.now()}-${i}`} className="h-16 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
