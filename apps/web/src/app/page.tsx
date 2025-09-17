import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ギュウリスト</h1>
              <p className="text-sm text-gray-600">和牛繁殖農家向け管理システム</p>
            </div>
            <div className="flex space-x-4">
              <Link href="/login">
                <Button variant="outline">ログイン</Button>
              </Link>
              <Link href="/register">
                <Button>新規登録</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* ヒーローセクション */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            楽して楽しく利益を増やす
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            和牛繁殖農家の経営効率化と収益性向上を支援するデジタルソリューション
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/register">
              <Button size="lg" className="px-8">
                今すぐ始める
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="px-8">
                ログイン
              </Button>
            </Link>
          </div>
        </div>

        {/* 機能紹介 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle>個体管理</CardTitle>
              <CardDescription>
                母牛・子牛の登録・管理
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                個体番号、名前、生年月日、血統情報、健康状態を一元管理できます。
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>繁殖記録管理</CardTitle>
              <CardDescription>
                交配・妊娠・分娩記録
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                交配記録、妊娠確認、分娩記録をデジタル化して効率的に管理できます。
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>血統管理</CardTitle>
              <CardDescription>
                血統情報と系統管理
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                血統マスタ、系統マスタを管理し、血統係数の計算も自動化できます。
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>出荷管理</CardTitle>
              <CardDescription>
                年毎・母牛毎の出荷記録
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                出荷記録、重量、価格を記録し、年毎・母牛毎の分析が可能です。
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>せり結果管理</CardTitle>
              <CardDescription>
                せり結果と落札情報
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                せり場での落札結果を記録し、価格分析や収益性の把握ができます。
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>分析・レポート</CardTitle>
              <CardDescription>
                繁殖成績の分析とレポート
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                繁殖成績の可視化と分析により、データに基づく意思決定を支援します。
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 特徴 */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-16">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            ギュウリストの特徴
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                🚀 効率的な管理
              </h4>
              <p className="text-gray-600">
                手作業による記録管理をデジタル化し、作業効率を大幅に向上させます。
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                📊 データ分析
              </h4>
              <p className="text-gray-600">
                繁殖成績の可視化により、経営改善のポイントを明確にします。
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                🔒 セキュア
              </h4>
              <p className="text-gray-600">
                データの暗号化とアクセス制御により、重要な情報を安全に管理します。
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                📱 モバイル対応
              </h4>
              <p className="text-gray-600">
                スマートフォンやタブレットからもアクセス可能で、現場での記録も簡単です。
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-gray-900 rounded-lg p-12 text-white">
          <h3 className="text-3xl font-bold mb-4">
            今すぐ始めませんか？
          </h3>
          <p className="text-xl text-gray-300 mb-8">
            無料でアカウントを作成して、効率的な繁殖管理を体験してください。
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
              無料で始める
            </Button>
          </Link>
        </div>
      </main>

      {/* フッター */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 ギュウリスト. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}