import { client } from "@/lib/api-client";
import { StatusCard } from "@/components/status-card";
import { TechStack } from "@/components/tech-stack";
import { HotReloadDemo } from "@/components/hot-reload-demo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Zap, Heart, Code } from "lucide-react";

// 動的レンダリングを強制
export const dynamic = "force-dynamic";

async function getHealthStatus() {
  try {
    const res = await client.api.v2.health.$get();
    if (res.ok && res.status === 200) {
      return await res.json();
    }
    return null;
  } catch (error) {
    console.error("Health check failed:", error);
    return null;
  }
}

async function getDatabaseStatus() {
  try {
    const res = await client.api.v2.health.db.$get();
    if (res.ok && res.status === 200) {
      return await res.json();
    }
    return null;
  } catch (error) {
    console.error("Database check failed:", error);
    return null;
  }
}

export default async function Home() {
  const healthStatus = await getHealthStatus();
  const databaseStatus = await getDatabaseStatus();

  const getHealthStatusType = () => {
    if (!healthStatus) return "error";
    return "success";
  };

  const getDatabaseStatusType = () => {
    if (!databaseStatus) return "error";
    return databaseStatus.status === "connected" ? "success" : "error";
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* ヘッダーセクション */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Gyulist v2
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            モダンな技術スタックで構築された、高速で美しいWebアプリケーション
          </p>
          <div className="flex justify-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              ホットリロード対応
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              開発者体験重視
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Code className="h-3 w-3" />
              TypeScript
            </Badge>
          </div>
        </div>

        {/* ステータスカード */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StatusCard
            title="API接続ステータス"
            description="バックエンドAPIサーバーとの接続状態"
            status={getHealthStatusType()}
            data={healthStatus ? {
              status: healthStatus.status,
              timestamp: new Date(healthStatus.timestamp).toLocaleString("ja-JP"),
              ...(healthStatus.database && "database" in healthStatus.database ? {
                database: healthStatus.database.database,
                host: healthStatus.database.host,
                version: healthStatus.database.version,
                size: healthStatus.database.size
              } : {})
            } : null}
            lastUpdated={healthStatus ? new Date(healthStatus.timestamp) : undefined}
          />
          
          <StatusCard
            title="データベース接続ステータス"
            description="PostgreSQLデータベースとの接続状態"
            status={getDatabaseStatusType()}
            data={databaseStatus ? {
              status: databaseStatus.status,
              database: "database" in databaseStatus ? databaseStatus.database : undefined,
              host: "host" in databaseStatus ? databaseStatus.host : undefined,
              error: "error" in databaseStatus ? databaseStatus.error : undefined,
              timestamp: new Date(databaseStatus.timestamp).toLocaleString("ja-JP")
            } : null}
            lastUpdated={databaseStatus ? new Date(databaseStatus.timestamp) : undefined}
          />
        </div>

        {/* ホットリロードデモ */}
        <HotReloadDemo />

        {/* 技術スタック */}
        <TechStack />

        {/* 開発者向け情報 */}
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              開発者向け情報
            </CardTitle>
            <CardDescription>
              このアプリケーションの開発環境とコマンド
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">利用可能なコマンド</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                    <code>pnpm dev:full</code>
                    <Badge variant="outline">開発サーバー起動</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                    <code>pnpm dev:api</code>
                    <Badge variant="outline">APIサーバーのみ</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                    <code>pnpm dev:web</code>
                    <Badge variant="outline">Webアプリのみ</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                    <code>pnpm db:studio</code>
                    <Badge variant="outline">Prisma Studio</Badge>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-3">開発環境</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>• ホットリロード: 有効</div>
                  <div>• TypeScript: 厳密モード</div>
                  <div>• ESLint: 有効</div>
                  <div>• Prettier: 有効</div>
                  <div>• 自動フォーマット: 保存時</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
