// データベーステーブル確認スクリプト

import { db } from '../infrastructure/database/connection';
import { sql } from 'drizzle-orm';

async function checkTables() {
  try {
    console.log('Checking database tables...');
    
    // テーブル一覧を取得
    const result = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('Tables found:', result);
    
    // farmsテーブルの構造を確認
    const farmsStructure = await db.execute(sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'farms'
      ORDER BY ordinal_position
    `);
    
    console.log('Farms table structure:', farmsStructure);
    
    // usersテーブルの構造を確認
    const usersStructure = await db.execute(sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    
    console.log('Users table structure:', usersStructure);
    
    process.exit(0);
  } catch (error) {
    console.error('Check failed:', error);
    process.exit(1);
  }
}

checkTables();
