// データベースリセットスクリプト

import { db } from '../infrastructure/database/connection';
import { sql } from 'drizzle-orm';

async function resetDatabase() {
  try {
    console.log('Resetting database...');
    
    // 外部キー制約を無効化
    await db.execute(sql`SET session_replication_role = replica;`);
    
    // テーブルを削除
    await db.execute(sql`DROP TABLE IF EXISTS users CASCADE;`);
    await db.execute(sql`DROP TABLE IF EXISTS farms CASCADE;`);
    
    // 外部キー制約を再有効化
    await db.execute(sql`SET session_replication_role = DEFAULT;`);
    
    console.log('Database reset completed!');
    process.exit(0);
  } catch (error) {
    console.error('Database reset failed:', error);
    process.exit(1);
  }
}

resetDatabase();
