FROM node:20-alpine

WORKDIR /app

# pnpmをインストール
RUN npm install -g pnpm

# package.jsonとpnpm-lock.yamlをコピー
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

# 依存関係をインストール
RUN pnpm install --force

# ソースコードをコピー
COPY . .

# Prismaクライアントを生成
RUN pnpm --filter @gyulistv2/api db:generate

# ポートを公開
EXPOSE 3001

# アプリケーションを起動
WORKDIR /app/apps/api
CMD ["pnpm", "dev"]
