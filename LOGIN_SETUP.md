# ログイン機能セットアップガイド

## 概要
DDD+関数型ドメインモデリング+オニオンアーキテクチャで実装されたログイン機能のセットアップ手順です。

## アーキテクチャ

### ドメイン層
- **entities/**: User, Farmエンティティ
- **value-objects/**: Email, Passwordバリューオブジェクト
- **functions/**: 認証関連の純粋関数
- **types/**: ドメイン型定義
- **contracts/**: リポジトリ契約

### アプリケーション層
- **use-cases/**: ログイン、登録、トークン検証ユースケース

### インフラストラクチャ層
- **repositories/**: Drizzleを使用したリポジトリ実装
- **database/**: データベース接続設定

### プレゼンテーション層
- **routes/**: 認証APIルート
- **web/**: ログイン・登録・ダッシュボード画面

## セットアップ手順

### 1. 依存関係のインストール

```bash
# ルートディレクトリで
pnpm install

# APIサーバーで
cd apps/api
pnpm install

# フロントエンドで
cd apps/web
pnpm install
```

### 2. データベースのセットアップ

```bash
# PostgreSQLを起動
# Dockerを使用する場合
docker run --name gyulist-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=gyulist -p 5432:5432 -d postgres:15

# 環境変数を設定
cd apps/api
cp env.example .env
# .envファイルを編集してデータベース接続情報を設定

# データベースマイグレーション
pnpm db:generate
pnpm db:migrate
```

### 3. サーバーの起動

```bash
# APIサーバーを起動
cd apps/api
pnpm dev

# 別のターミナルでフロントエンドを起動
cd apps/web
pnpm dev
```

### 4. アクセス

- **フロントエンド**: http://localhost:3000
- **APIサーバー**: http://localhost:3001
- **API ヘルスチェック**: http://localhost:3001/api/v2/health

## 機能

### 認証機能
- **ログイン**: メールアドレスとパスワードでログイン
- **新規登録**: 農場情報と一緒にユーザー登録
- **トークン検証**: JWTトークンによる認証状態管理
- **ログアウト**: セッション終了

### セキュリティ機能
- **パスワードハッシュ化**: PBKDF2を使用した安全なパスワード保存
- **入力検証**: Zodによる厳密な入力検証
- **CORS設定**: 適切なCORS設定によるセキュリティ確保

## API エンドポイント

### 認証関連
- `POST /api/v2/auth/login` - ログイン
- `POST /api/v2/auth/register` - 新規登録
- `GET /api/v2/auth/verify` - トークン検証
- `POST /api/v2/auth/logout` - ログアウト

### ヘルスチェック
- `GET /api/v2/health` - API状態確認
- `GET /api/v2/health/db` - データベース接続確認

## データベーススキーマ

### users テーブル
- id (UUID, Primary Key)
- email (VARCHAR, Unique)
- password_hash (TEXT)
- role (VARCHAR, Default: 'farmer')
- farm_id (UUID, Foreign Key)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### farms テーブル
- id (UUID, Primary Key)
- farm_name (VARCHAR)
- address (TEXT, Optional)
- phone_number (VARCHAR, Optional)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

## 開発ガイドライン

### 関数型プログラミング
- 純粋関数の使用
- 不変性の確保
- 副作用の分離

### DDD原則
- ドメインロジックの集約
- 境界づけられたコンテキスト
- 依存関係の逆転

### エラーハンドリング
- Result型による明示的なエラー処理
- 適切なエラーメッセージの提供

## トラブルシューティング

### よくある問題

1. **データベース接続エラー**
   - PostgreSQLが起動しているか確認
   - 環境変数の設定を確認
   - データベースが存在するか確認

2. **CORSエラー**
   - フロントエンドのURLが正しく設定されているか確認
   - APIサーバーのCORS設定を確認

3. **インポートエラー**
   - TypeScriptの設定を確認
   - ファイルパスが正しいか確認

## 今後の拡張予定

- JWTトークンの実装
- パスワードリセット機能
- ロールベースのアクセス制御
- セッション管理の改善
- 2要素認証の追加
