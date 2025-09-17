// データベース接続設定

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../../db/schema.js';

// 環境変数からデータベース接続情報を取得
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@postgres:5432/gyulistv2';

// PostgreSQL接続を作成
const client = postgres(connectionString);

// Drizzleインスタンスを作成
export const db = drizzle(client, { schema });
