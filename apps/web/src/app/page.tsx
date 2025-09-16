import { client } from "@/lib/api-client";

async function getHealthStatus() {
  try {
    const res = await client.api.v2.health.$get();
    console.log(res);
    if (res.ok) {
      return await res.json();
    }
    return null;
  } catch (error) {
    console.error("Health check failed:", error);
    return null;
  }
}

export default async function Home() {
  const healthStatus = await getHealthStatus();

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
