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

# Next.jsアプリケーションをビルド
RUN pnpm --filter @gyulistv2/web build

# ポートを公開
EXPOSE 3000

# アプリケーションを起動
WORKDIR /app/apps/web
CMD ["pnpm", "start"]
