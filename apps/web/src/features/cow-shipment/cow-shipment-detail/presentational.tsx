// 母牛出荷管理詳細のPresentational

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CowShipmentInfo } from "@/types/calf-shipment";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface CowShipmentDetailPresentationProps {
  cowShipmentInfo: CowShipmentInfo;
}

export default function CowShipmentDetailPresentation({
  cowShipmentInfo,
}: CowShipmentDetailPresentationProps) {
  const { cow, calfShipments, statistics } = cowShipmentInfo;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP");
  };

  const formatPrice = (price: number) => {
    return `¥${price.toLocaleString()}`;
  };

  const getGenderLabel = (gender: string) => {
    switch (gender) {
      case "MALE":
        return "オス";
      case "FEMALE":
        return "メス";
      case "CASTRATED":
        return "去勢";
      default:
        return gender;
    }
  };

  const getStatusBadge = (auctionDate: string | null) => {
    if (auctionDate) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          出荷済み
        </Badge>
      );
    }
    return <Badge variant="secondary">未出荷</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/cow-shipment-management">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            一覧に戻る
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">母牛出荷管理 - {cow.name}</h1>
      </div>

      {/* 母牛情報 */}
      <Card>
        <CardHeader>
          <CardTitle>母牛情報</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="individual-number" className="text-sm font-medium text-gray-500">
                個体番号
              </label>
              <p id="individual-number" className="text-lg font-semibold">
                {cow.individualNumber}
              </p>
            </div>
            <div>
              <label htmlFor="cow-name" className="text-sm font-medium text-gray-500">
                名前
              </label>
              <p id="cow-name" className="text-lg font-semibold">
                {cow.name}
              </p>
            </div>
            <div>
              <label htmlFor="birth-date" className="text-sm font-medium text-gray-500">
                生年月日
              </label>
              <p id="birth-date" className="text-lg font-semibold">
                {formatDate(cow.birthDate)}
              </p>
            </div>
            <div>
              <label htmlFor="age" className="text-sm font-medium text-gray-500">
                年齢
              </label>
              <p id="age" className="text-lg font-semibold">
                {cow.age}
              </p>
            </div>
            <div>
              <label htmlFor="health-status" className="text-sm font-medium text-gray-500">
                健康状態
              </label>
              <Badge
                id="health-status"
                variant={cow.healthStatus === "HEALTHY" ? "default" : "destructive"}
              >
                {cow.healthStatus === "HEALTHY" ? "健康" : "要確認"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 出荷統計 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{statistics.totalShipments}</p>
              <p className="text-sm text-gray-500">総出荷数</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {formatPrice(statistics.averagePrice)}
              </p>
              <p className="text-sm text-gray-500">平均価格</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {formatPrice(statistics.maxPrice)}
              </p>
              <p className="text-sm text-gray-500">最高価格</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {formatPrice(statistics.totalRevenue)}
              </p>
              <p className="text-sm text-gray-500">総売上</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 子牛出荷一覧 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>子牛出荷一覧</span>
            <Badge variant="secondary">{calfShipments.length}件</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {calfShipments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">出荷された子牛はありません</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">個体番号</th>
                    <th className="text-left p-3 font-medium">子牛名</th>
                    <th className="text-left p-3 font-medium">生年月日</th>
                    <th className="text-left p-3 font-medium">性別</th>
                    <th className="text-left p-3 font-medium">体重</th>
                    <th className="text-left p-3 font-medium">日齢</th>
                    <th className="text-left p-3 font-medium">種付日</th>
                    <th className="text-left p-3 font-medium">出産予定日</th>
                    <th className="text-left p-3 font-medium">出荷日</th>
                    <th className="text-left p-3 font-medium">価格</th>
                    <th className="text-left p-3 font-medium">購買者</th>
                    <th className="text-left p-3 font-medium">父牛血統</th>
                    <th className="text-left p-3 font-medium">健康状態</th>
                    <th className="text-left p-3 font-medium">備考</th>
                    <th className="text-left p-3 font-medium">状態</th>
                  </tr>
                </thead>
                <tbody>
                  {calfShipments.map((calf) => (
                    <tr key={calf.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{calf.individualNumber}</td>
                      <td className="p-3">{calf.calfName}</td>
                      <td className="p-3">{formatDate(calf.birthDate)}</td>
                      <td className="p-3">{getGenderLabel(calf.gender)}</td>
                      <td className="p-3">{calf.weight ? `${calf.weight}kg` : "-"}</td>
                      <td className="p-3">{calf.ageInDays ? `${calf.ageInDays}日` : "-"}</td>
                      <td className="p-3">{calf.matingDate ? formatDate(calf.matingDate) : "-"}</td>
                      <td className="p-3">
                        {calf.expectedBirthDate ? formatDate(calf.expectedBirthDate) : "-"}
                      </td>
                      <td className="p-3">
                        {calf.auctionDate ? formatDate(calf.auctionDate) : "-"}
                      </td>
                      <td className="p-3">{calf.price ? formatPrice(calf.price) : "-"}</td>
                      <td className="p-3">{calf.buyer || "-"}</td>
                      <td className="p-3" title={calf.sirePedigree || ""}>
                        {calf.sirePedigree ? (
                          <span className="truncate block max-w-24">{calf.sirePedigree}</span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="p-3">
                        <Badge
                          variant={calf.healthStatus === "HEALTHY" ? "default" : "destructive"}
                        >
                          {calf.healthStatus === "HEALTHY" ? "健康" : "要確認"}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <span className="truncate block max-w-32" title={calf.remarks || ""}>
                          {calf.remarks || "-"}
                        </span>
                      </td>
                      <td className="p-3">{getStatusBadge(calf.auctionDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
