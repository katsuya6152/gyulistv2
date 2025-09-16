import { client } from "@/lib/api-client";

// 動的レンダリングを強制
export const dynamic = "force-dynamic";

async function getHealthStatus() {
  try {
    const res = await client.api.v2.health.$get();
    console.log(res);
    if (res.ok) {
      if (res.status === 200) {
        return await res.json();
      }
      return null;
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
    if (res.ok) {
      if (res.status === 200) {
        return await res.json();
      }
      return null;
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

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">Gyulist v2</h1>
        <p className="text-lg text-muted-foreground mb-8">モダンなWebアプリケーション</p>

        {/* API接続ステータス */}
        <div className="bg-card p-6 rounded-lg shadow-sm border mb-8">
          <h2 className="text-xl font-semibold mb-4">API接続ステータス</h2>
          {!healthStatus ? (
            <div className="text-destructive">
              <div className="font-medium">エラー</div>
              <div className="text-sm">APIサーバーに接続できません</div>
            </div>
          ) : (
            <div className="text-green-600">
              <div className="font-medium">✓ 接続成功</div>
              <div className="text-sm">ステータス: {healthStatus.status}</div>
              <div className="text-sm">
                時刻: {new Date(healthStatus.timestamp).toLocaleString("ja-JP")}
              </div>
              {healthStatus.database && "database" in healthStatus.database && (
                <div className="mt-4 p-4 bg-gray-50 rounded border">
                  <h3 className="font-medium text-gray-800 mb-2">データベース情報</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>ステータス: {healthStatus.database.status}</div>
                    {"database" in healthStatus.database && healthStatus.database.database && (
                      <div>データベース名: {healthStatus.database.database}</div>
                    )}
                    {"host" in healthStatus.database && healthStatus.database.host && (
                      <div>ホスト: {healthStatus.database.host}</div>
                    )}
                    {"version" in healthStatus.database && healthStatus.database.version && (
                      <div>バージョン: {healthStatus.database.version}</div>
                    )}
                    {"size" in healthStatus.database && healthStatus.database.size && (
                      <div>サイズ: {healthStatus.database.size}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* データベース接続ステータス */}
        <div className="bg-card p-6 rounded-lg shadow-sm border mb-8">
          <h2 className="text-xl font-semibold mb-4">データベース接続ステータス</h2>
          {!databaseStatus ? (
            <div className="text-destructive">
              <div className="font-medium">エラー</div>
              <div className="text-sm">データベースに接続できません</div>
            </div>
          ) : (
            <div
              className={
                databaseStatus.status === "connected" ? "text-green-600" : "text-destructive"
              }
            >
              <div className="font-medium">
                {databaseStatus.status === "connected" ? "✓ 接続成功" : "✗ 接続失敗"}
              </div>
              <div className="text-sm">ステータス: {databaseStatus.status}</div>
              {"database" in databaseStatus && databaseStatus.database && (
                <div className="text-sm">データベース: {databaseStatus.database}</div>
              )}
              {"host" in databaseStatus && databaseStatus.host && (
                <div className="text-sm">ホスト: {databaseStatus.host}</div>
              )}
              {"error" in databaseStatus && databaseStatus.error && (
                <div className="text-sm text-red-500">エラー: {databaseStatus.error}</div>
              )}
              <div className="text-sm">
                時刻: {new Date(databaseStatus.timestamp).toLocaleString("ja-JP")}
              </div>
            </div>
          )}
        </div>

        <div className="bg-card p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">技術スタック</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div>
              <h3 className="font-medium text-primary">フロントエンド</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Next.js 14 (App Router)</li>
                <li>• TypeScript</li>
                <li>• Tailwind CSS</li>
                <li>• shadcn/ui</li>
                <li>• Hono RPC (RSC)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-primary">バックエンド</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Hono</li>
                <li>• Drizzle ORM</li>
                <li>• PostgreSQL</li>
                <li>• Zod</li>
                <li>• OpenAPI</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
