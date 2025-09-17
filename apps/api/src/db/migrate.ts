// データベースマイグレーション実行スクリプト

import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db } from '../infrastructure/database/connection';

async function runMigrations() {
  try {
    console.log('Running database migrations...');
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('Migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
