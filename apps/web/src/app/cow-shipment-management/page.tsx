// 子牛出荷管理メインページ

import CalfShipmentListContainer from "@/features/cow-shipment/calf-shipment-list/container";

interface CalfShipmentManagementPageProps {
  searchParams?: {
    farmId?: string;
    gender?: "MALE" | "FEMALE" | "CASTRATED";
    startDate?: string;
    endDate?: string;
    cursor?: string;
    limit?: string;
  };
}

export default function CalfShipmentManagementPage({ searchParams }: CalfShipmentManagementPageProps) {
  return <CalfShipmentListContainer searchParams={searchParams} />;
}
