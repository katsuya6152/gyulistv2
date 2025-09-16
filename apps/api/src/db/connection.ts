import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema.js';

// データベース接続URL
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@postgres:5432/gyulistv2';

// PostgreSQLクライアント
const client = postgres(connectionString);

// Drizzleクライアントインスタンス
export const db = drizzle(client, { schema });

// データベース接続の健全性をチェックする関数
export async function checkDatabaseConnection() {
  try {
    await client`SELECT 1 as connected`;
    return {
      status: 'connected',
      database: 'gyulistv2',
      host: 'postgres:5432',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
}

// データベース情報を取得する関数
export async function getDatabaseInfo() {
  try {
    const versionResult = await client`SELECT version()`;
    const dbSizeResult = await client`
      SELECT 
        pg_database.datname as database_name,
        pg_size_pretty(pg_database_size(pg_database.datname)) as size
      FROM pg_database 
      WHERE datname = current_database()
    `;
    
    return {
      status: 'connected',
      version: versionResult[0]?.version,
      database: dbSizeResult[0]?.database_name,
      size: dbSizeResult[0]?.size,
      host: 'postgres:5432',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
}
