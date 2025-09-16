# Gyulist v2

モダンなWebアプリケーションのモノレポ構成プロジェクトです。

## 技術スタック

### フロントエンド (apps/web)
- **フレームワーク**: Next.js 14
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **UIコンポーネント**: shadcn/ui
- **バリデーション**: Zod
- **フォーム管理**: Conform

### バックエンド (apps/api)
- **フレームワーク**: Hono
- **言語**: TypeScript
- **ORM**: Drizzle ORM
- **マイグレーション**: drizzle-kit
- **バリデーション**: Zod
- **API仕様**: OpenAPI

### データベース
- **RDBMS**: PostgreSQL

### 開発ツール
- **パッケージマネージャー**: pnpm
- **リンター**: Biome
- **モノレポ管理**: pnpm workspace

## 前提条件

- Node.js 18+
- pnpm 8+
- PostgreSQL

## セットアップ手順

### 1. リポジトリのクローン
```bash
git clone <repository-url>
cd gyulistv2
```

### 2. 依存関係のインストール
```bash
pnpm install
```

### 3. 環境変数の設定

#### API (apps/api)
```bash
cd apps/api
cp env.example .env
# .envファイルを編集してデータベース接続情報を設定
```

#### Web (apps/web)
```bash
cd apps/web
cp env.example .env.local
# .env.localファイルを編集してAPI URLを設定
```

### 4. データベースのセットアップ
```bash
# PostgreSQLでデータベースを作成
createdb gyulistv2

# マイグレーションの実行
cd apps/api
pnpm db:generate
pnpm db:migrate
```

### 5. 開発サーバーの起動
```bash
# ルートディレクトリから
pnpm dev

# または個別に起動
pnpm --filter @gyulistv2/api dev
pnpm --filter @gyulistv2/web dev
```

## 利用可能なスクリプト

### ルートレベル
- `pnpm dev` - 全アプリケーションの開発サーバーを並行起動
- `pnpm build` - 全アプリケーションのビルド
- `pnpm lint` - Biomeによるリンター実行
- `pnpm lint:fix` - Biomeによるリンター修正
- `pnpm format` - Biomeによるフォーマット
- `pnpm type-check` - TypeScript型チェック
- `pnpm clean` - ビルド成果物の削除

### API (apps/api)
- `pnpm dev` - 開発サーバー起動 (http://localhost:3001)
- `pnpm build` - ビルド
- `pnpm start` - 本番サーバー起動
- `pnpm db:generate` - Drizzleマイグレーション生成
- `pnpm db:migrate` - マイグレーション実行
- `pnpm db:studio` - Drizzle Studio起動

### Web (apps/web)
- `pnpm dev` - 開発サーバー起動 (http://localhost:3000)
- `pnpm build` - ビルド
- `pnpm start` - 本番サーバー起動
- `pnpm lint` - ESLint実行

## プロジェクト構造

```
gyulistv2/
├── apps/
│   ├── api/                 # Hono API サーバー
│   │   ├── src/
│   │   │   ├── db/         # データベース関連
│   │   │   ├── routes/     # API ルート
│   │   │   ├── middleware/ # ミドルウェア
│   │   │   ├── types/      # 型定義
│   │   │   └── utils/      # ユーティリティ
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── drizzle.config.ts
│   └── web/                 # Next.js フロントエンド
│       ├── src/
│       │   ├── app/        # App Router
│       │   ├── components/ # UIコンポーネント
│       │   ├── lib/        # ライブラリ
│       │   ├── types/      # 型定義
│       │   └── utils/      # ユーティリティ
│       ├── package.json
│       ├── tsconfig.json
│       ├── tailwind.config.js
│       └── next.config.js
├── packages/                # 共有パッケージ
├── docs/                   # ドキュメント
├── package.json            # ルート package.json
├── pnpm-workspace.yaml     # pnpm workspace設定
└── biome.json             # Biome設定
```

## API エンドポイント

- `GET /health` - ヘルスチェック
- `GET /` - API情報
- `GET /docs` - Swagger UI
- `GET /api-docs` - OpenAPI仕様

## 開発ガイドライン

### コーディング規約
- Biomeによる自動フォーマット・リンター設定を使用
- TypeScriptのstrict modeを有効化
- コミット前に`pnpm lint`と`pnpm type-check`を実行

### コミット規約
- コミットメッセージは日本語で記述
- 機能追加: `feat: 機能の説明`
- バグ修正: `fix: 修正内容の説明`
- ドキュメント: `docs: ドキュメントの更新`

## ライセンス

MIT License