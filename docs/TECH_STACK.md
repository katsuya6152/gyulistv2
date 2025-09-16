# 技術スタック

## 概要
Gyulist v2の技術スタックとアーキテクチャの詳細を記載します。

## アーキテクチャ
- **モノレポ構成**: pnpm workspaceを使用
- **フロントエンド**: Next.js (apps/web)
- **バックエンド**: Hono (apps/api)
- **データベース**: PostgreSQL
- **インフラ**: AWS

## 技術スタック詳細

### フロントエンド (apps/web)
- **フレームワーク**: Next.js 14+
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **UIコンポーネント**: shadcn/ui
- **バリデーション**: Zod
- **フォーム管理**: Conform
- **パッケージマネージャー**: pnpm

### バックエンド (apps/api)
- **フレームワーク**: Hono
- **言語**: TypeScript
- **ORM**: Drizzle ORM
- **マイグレーション**: drizzle-kit
- **バリデーション**: Zod
- **API仕様**: OpenAPI
- **パッケージマネージャー**: pnpm

### データベース
- **RDBMS**: PostgreSQL
- **ORM**: Drizzle ORM
- **マイグレーション**: drizzle-kit

### インフラストラクチャ
- **クラウドプロバイダー**: AWS
- **コンテナ**: Docker (予定)
- **CI/CD**: GitHub Actions (予定)

### 開発ツール
- **パッケージマネージャー**: pnpm
- **リンター**: Biome
- **フォーマッター**: Biome
- **型チェック**: TypeScript
- **モノレポ管理**: pnpm workspace

## ディレクトリ構造
```
gyulistv2/
├── apps/
│   ├── api/          # Hono API サーバー
│   └── web/          # Next.js フロントエンド
├── packages/         # 共有パッケージ
├── docs/            # ドキュメント
├── package.json     # ルート package.json
├── pnpm-workspace.yaml
└── biome.json       # Biome設定
```

## 開発環境セットアップ

### 前提条件
- Node.js 18+
- pnpm
- PostgreSQL

### セットアップ手順
1. リポジトリのクローン
2. `pnpm install` で依存関係のインストール
3. 環境変数の設定
4. データベースのセットアップ
5. `pnpm dev` で開発サーバー起動

## 各技術の選択理由

### Hono
- 軽量で高速なWebフレームワーク
- TypeScriptファースト
- Edge Runtime対応
- シンプルなAPI設計

### Drizzle ORM
- TypeScriptファーストのORM
- 軽量で高速
- SQLクエリの可視性が高い
- マイグレーション管理が簡単

### Next.js
- React フレームワーク
- SSR/SSG対応
- 優れた開発体験
- 豊富なエコシステム

### Tailwind CSS + shadcn/ui
- 効率的なスタイリング
- 一貫性のあるデザインシステム
- カスタマイズ性が高い
- アクセシビリティ対応

### Biome
- 高速なリンター・フォーマッター
- ESLint + Prettier の代替
- TypeScript対応
- 設定がシンプル
