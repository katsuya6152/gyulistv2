# Gyulist v2 Development Container

このディレクトリには、Gyulist v2プロジェクトの開発用Dev Container設定が含まれています。

## 🚀 使用方法

### 1. Dev Containerで開く

1. VS Codeでプロジェクトを開く
2. コマンドパレット（Cmd+Shift+P）を開く
3. "Dev Containers: Reopen in Container" を選択
4. 初回はコンテナのビルドに時間がかかります

### 2. 開発環境のセットアップ

Dev Containerが起動したら、以下のコマンドを実行：

```bash
pnpm setup:dev
```

または手動で：

```bash
# 依存関係のインストール
pnpm install

# Prismaクライアントの生成
pnpm db:generate

# データベースマイグレーション
pnpm db:migrate
```

### 3. 開発サーバーの起動

#### 個別に起動
```bash
# APIサーバーのみ
pnpm dev:api

# Webアプリのみ
pnpm dev:web
```

#### 同時に起動
```bash
# 両方同時に起動
pnpm dev:full
```

### 4. デバッグ

VS Codeのデバッグ機能を使用：

- **API Server**: F5キーまたは「Debug API Server」を選択
- **Web App**: 「Debug Web App」を選択
- **Full Stack**: 「Debug Full Stack」を選択

## 📁 ディレクトリ構造

```
.devcontainer/
├── devcontainer.json          # Dev Container設定
├── docker-compose.dev.yml     # 開発用Docker Compose
├── Dockerfile.dev             # 開発用Dockerfile
├── .vscode/
│   ├── settings.json          # VS Code設定
│   ├── launch.json            # デバッグ設定
│   └── tasks.json             # タスク設定
├── scripts/
│   └── dev-setup.sh           # セットアップスクリプト
└── README.md                  # このファイル
```

## 🔧 利用可能なコマンド

| コマンド | 説明 |
|---------|------|
| `pnpm dev:api` | APIサーバーを起動 |
| `pnpm dev:web` | Webアプリを起動 |
| `pnpm dev:full` | 両方を同時に起動 |
| `pnpm db:studio` | Prisma Studioを開く |
| `pnpm db:generate` | Prismaクライアントを生成 |
| `pnpm db:migrate` | データベースマイグレーションを実行 |
| `pnpm setup:dev` | 開発環境をセットアップ |

## 🌐 アクセスURL

- **Web App**: http://localhost:3000
- **API Server**: http://localhost:3001
- **PostgreSQL**: localhost:5432

## 🛠️ トラブルシューティング

### コンテナが起動しない場合
```bash
# コンテナを再ビルド
docker-compose -f .devcontainer/docker-compose.dev.yml down
docker-compose -f .devcontainer/docker-compose.dev.yml up --build
```

### データベース接続エラーの場合
```bash
# データベースの状態確認
docker-compose -f .devcontainer/docker-compose.dev.yml ps

# データベースを再起動
docker-compose -f .devcontainer/docker-compose.dev.yml restart postgres
```

### 依存関係の問題
```bash
# node_modulesをクリアして再インストール
rm -rf node_modules apps/*/node_modules
pnpm install
```

## 📝 注意事項

- Dev Containerは開発専用です
- 本番環境では通常のDocker Composeを使用してください
- ファイルの変更は即座にコンテナ内に反映されます
- ホットリロードが有効になっています




