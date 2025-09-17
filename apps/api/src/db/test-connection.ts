// データベース接続テストスクリプト

import postgres from 'postgres';

async function testConnection() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@postgres:5432/gyulistv2';
  console.log('Connection string:', connectionString);
  
  try {
    const client = postgres(connectionString);
    
    // データベース一覧を取得
    const databases = await client`SELECT datname FROM pg_database WHERE datistemplate = false`;
    console.log('Available databases:', databases);
    
    // 現在のデータベース名を取得
    const currentDb = await client`SELECT current_database()`;
    console.log('Current database:', currentDb);
    
    // テーブル一覧を取得
    const tables = await client`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('Tables in current database:', tables);
    
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('Connection test failed:', error);
    process.exit(1);
  }
}

testConnection();
