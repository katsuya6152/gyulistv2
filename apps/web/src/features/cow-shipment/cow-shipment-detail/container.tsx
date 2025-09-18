// 母牛出荷管理詳細のContainer（Server Component）

import { Suspense } from "react";
import { getCowShipmentInfoAction } from "./actions";
import CowShipmentDetailPresentation from "./presentational";

interface CowShipmentDetailContainerProps {
  params: {
    cowId: string;
  };
}

export default async function CowShipmentDetailContainer({ params }: CowShipmentDetailContainerProps) {
  const { cowId } = params;

  try {
    // 母牛の出荷管理情報を取得
    const result = await getCowShipmentInfoAction(cowId);

    if (result.success && result.data) {
      return (
        <Suspense fallback={<CowShipmentDetailSkeleton />}>
          <CowShipmentDetailPresentation cowShipmentInfo={result.data} />
        </Suspense>
      );
    }

    return (
      <div className="p-4">
        <div className="text-red-600">母牛情報の読み込みに失敗しました: {result.error || "不明なエラー"}</div>
      </div>
    );
  } catch (error) {
    console.error("Failed to load cow shipment info:", error);
    return (
      <div className="p-4">
        <div className="text-red-600">母牛情報の読み込みに失敗しました: {error instanceof Error ? error.message : "不明なエラー"}</div>
      </div>
    );
  }
}

function CowShipmentDetailSkeleton() {
  return (
    <div className="p-6">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={`skeleton-card-${Date.now()}-${i}`} className="h-24 bg-gray-200 rounded" />
          ))}
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={`skeleton-row-${Date.now()}-${i}`} className="h-16 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
