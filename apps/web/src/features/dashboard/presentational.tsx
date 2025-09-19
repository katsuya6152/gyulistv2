"use client";

import LogoutButton from "@/components/logout-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import type { User } from "./schema";

interface DashboardPresentationProps {
  user: User;
}

export default function DashboardPresentation({ user }: DashboardPresentationProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">ギュウリスト</h1>
              <p className="text-sm text-gray-600">和牛繁殖農家向け管理システム</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">ようこそ、{user.email}さん</span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 繁殖記録管理 */}
            <Card>
              <CardHeader>
                <CardTitle>繁殖記録管理</CardTitle>
                <CardDescription>母牛・子牛の繁殖記録を管理</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">交配記録、妊娠確認、分娩記録などを管理できます。</p>
                <Button className="w-full" disabled>
                  近日公開
                </Button>
              </CardContent>
            </Card>

            {/* 出荷管理 */}
            <Card>
              <CardHeader>
                <CardTitle>出荷管理</CardTitle>
                <CardDescription>年毎・母牛毎の出荷記録を管理</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">出荷記録、重量、価格などを管理できます。</p>
                <Button className="w-full" asChild>
                  <Link href="/cow-shipment-management">出荷管理を開く</Link>
                </Button>
              </CardContent>
            </Card>

            {/* せり結果管理 */}
            <Card>
              <CardHeader>
                <CardTitle>せり結果管理</CardTitle>
                <CardDescription>せり結果と落札情報を管理</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">せり場での落札結果を記録・管理できます。</p>
                <Button className="w-full" disabled>
                  近日公開
                </Button>
              </CardContent>
            </Card>

            {/* 血統管理 */}
            <Card>
              <CardHeader>
                <CardTitle>血統管理</CardTitle>
                <CardDescription>血統情報と系統管理</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">血統マスタ、系統マスタを管理できます。</p>
                <Button className="w-full" disabled>
                  近日公開
                </Button>
              </CardContent>
            </Card>

            {/* 分析・レポート */}
            <Card>
              <CardHeader>
                <CardTitle>分析・レポート</CardTitle>
                <CardDescription>出荷データの分析とレポート生成</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">出荷データの分析とレポートを生成できます。</p>
                <Button className="w-full" asChild>
                  <Link href="/analytics">分析・レポートを開く</Link>
                </Button>
              </CardContent>
            </Card>

            {/* 設定 */}
            <Card>
              <CardHeader>
                <CardTitle>設定</CardTitle>
                <CardDescription>アカウントと農場情報の管理</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">アカウント情報や農場情報を管理できます。</p>
                <Button className="w-full" disabled>
                  近日公開
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
