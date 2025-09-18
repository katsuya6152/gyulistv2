// 母牛出荷管理詳細ページ

import CowShipmentDetailContainer from "@/features/cow-shipment/cow-shipment-detail/container";

interface CowShipmentDetailPageProps {
  params: {
    cowId: string;
  };
}

export default function CowShipmentDetailPage({ params }: CowShipmentDetailPageProps) {
  return <CowShipmentDetailContainer params={params} />;
}
