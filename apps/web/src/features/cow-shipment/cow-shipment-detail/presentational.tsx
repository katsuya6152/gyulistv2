// 母牛出荷管理詳細のPresentational

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CowShipmentInfo } from "@/types/calf-shipment";
import { ArrowLeft, BarChart3, CircleDollarSign, DollarSign, FileText, Package, TrendingUp, User } from "lucide-react";
import Link from "next/link";

interface CowShipmentDetailPresentationProps {
  cowShipmentInfo: CowShipmentInfo;
}

export default function CowShipmentDetailPresentation({ cowShipmentInfo }: CowShipmentDetailPresentationProps) {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダーセクション */}
        <div className="mb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href="/cow-shipment-management">
                <Button variant="outline" size="sm" className="bg-white/80 backdrop-blur-sm border-gray-300 hover:bg-gray-50 shadow-sm">
                  <ArrowLeft className="h-3 w-3 mr-1" />
                  一覧に戻る
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-gray-900">{cow.name}</h2>
                <Badge variant="secondary" className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
                  {calfShipments.length}頭
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* 母牛情報カード */}
        <Card className="shadow-sm border border-gray-200 bg-white mb-4">
          <CardContent className="p-3">
            <div className="flex items-center justify-between gap-4 text-sm">
              <div className="flex items-center gap-4">
                <span className="font-medium text-gray-600">
                  個体番号: <span className="font-bold text-gray-900">{cow.individualNumber}</span>
                </span>
                <span className="font-medium text-gray-600">
                  生年月日: <span className="font-semibold text-gray-900">{formatDate(cow.birthDate)}</span>
                </span>
                <span className="font-medium text-gray-600">
                  年齢: <span className="font-bold text-gray-900">{cow.age}</span>
                </span>
              </div>
              <Badge
                variant={cow.healthStatus === "HEALTHY" ? "default" : "destructive"}
                className={`px-2 py-0.5 text-xs font-medium ${
                  cow.healthStatus === "HEALTHY" ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200"
                }`}
              >
                {cow.healthStatus === "HEALTHY" ? "健康" : "要確認"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* 出荷統計カード */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <p className="text-xs font-medium text-blue-600 mb-1">総出荷数</p>
            <p className="text-lg font-bold text-blue-900">{statistics.totalShipments}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <p className="text-xs font-medium text-green-600 mb-1">平均価格</p>
            <p className="text-sm font-bold text-green-900">{formatPrice(statistics.averagePrice)}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 text-center">
            <p className="text-xs font-medium text-purple-600 mb-1">最高価格</p>
            <p className="text-sm font-bold text-purple-900">{formatPrice(statistics.maxPrice)}</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-3 text-center">
            <p className="text-xs font-medium text-orange-600 mb-1">総売上</p>
            <p className="text-sm font-bold text-orange-900">{formatPrice(statistics.totalRevenue)}</p>
          </div>
        </div>

        {/* 子牛出荷一覧テーブル */}
        <Card className="shadow-sm border border-gray-200 bg-white">
          <CardHeader className="bg-gray-50 border-b border-gray-200 py-3">
            <CardTitle className="flex items-center justify-between text-lg font-semibold text-gray-900">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-600" />
                子牛出荷一覧
              </div>
              <Badge variant="secondary" className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
                {calfShipments.length}件
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {calfShipments.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Package className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-500">出荷された子牛はありません</p>
                <p className="text-xs text-gray-400 mt-1">この母牛から出荷された子牛の記録が表示されます</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1600px] border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left px-3 py-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">個体番号</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">子牛名</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">生年月日</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">性別</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">体重</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">日齢</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">種付日</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">出産予定日</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">出荷日</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">価格</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">購買者</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">父牛血統</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">母の父血統</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">母の祖父血統</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">母の母の祖父血統</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">健康状態</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">備考</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">状態</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calfShipments.map((calf, index) => (
                      <tr
                        key={calf.id}
                        className={`border-b border-gray-100 hover:bg-gray-50/80 transition-all duration-200 group ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                        }`}
                      >
                        <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900">{calf.individualNumber}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs font-semibold text-gray-900">{calf.calfName}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">{formatDate(calf.birthDate)}</td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <Badge
                            variant="secondary"
                            className={`text-xs font-medium px-1.5 py-0.5 ${
                              calf.gender === "FEMALE"
                                ? "bg-pink-100 text-pink-800 border-pink-200"
                                : calf.gender === "MALE"
                                  ? "bg-blue-100 text-blue-800 border-blue-200"
                                  : "bg-gray-100 text-gray-800 border-gray-200"
                            }`}
                          >
                            {getGenderLabel(calf.gender)}
                          </Badge>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">{calf.weight ? `${calf.weight}kg` : "-"}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">{calf.ageInDays ? `${calf.ageInDays}日` : "-"}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">{calf.matingDate ? formatDate(calf.matingDate) : "-"}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">
                          {calf.expectedBirthDate ? formatDate(calf.expectedBirthDate) : "-"}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">{calf.auctionDate ? formatDate(calf.auctionDate) : "-"}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs font-semibold text-gray-900">
                          {calf.price ? formatPrice(calf.price) : "-"}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">{calf.buyer || "-"}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600" title={calf.sirePedigree || ""}>
                          {calf.sirePedigree ? <span className="truncate block max-w-20">{calf.sirePedigree}</span> : "-"}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600" title={calf.maternalGrandsire || ""}>
                          {calf.maternalGrandsire ? <span className="truncate block max-w-20">{calf.maternalGrandsire}</span> : "-"}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600" title={calf.maternalGreatGrandsire || ""}>
                          {calf.maternalGreatGrandsire ? <span className="truncate block max-w-20">{calf.maternalGreatGrandsire}</span> : "-"}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600" title={calf.maternalGreatGreatGrandsire || ""}>
                          {calf.maternalGreatGreatGrandsire ? (
                            <span className="truncate block max-w-20">{calf.maternalGreatGreatGrandsire}</span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <Badge
                            variant={calf.healthStatus === "HEALTHY" ? "default" : "destructive"}
                            className={`text-xs font-medium px-1.5 py-0.5 ${
                              calf.healthStatus === "HEALTHY"
                                ? "bg-green-100 text-green-800 border-green-200"
                                : "bg-red-100 text-red-800 border-red-200"
                            }`}
                          >
                            {calf.healthStatus === "HEALTHY" ? "健康" : "要確認"}
                          </Badge>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">
                          <span className="truncate block max-w-24" title={calf.remarks || ""}>
                            {calf.remarks || "-"}
                          </span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">{getStatusBadge(calf.auctionDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
