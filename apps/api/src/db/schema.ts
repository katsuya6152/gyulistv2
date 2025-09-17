import { pgTable, serial, text, timestamp, varchar, uuid } from "drizzle-orm/pg-core";

// 農場テーブル
export const farms = pgTable("farms", {
  id: uuid("id").primaryKey().defaultRandom(),
  farmName: varchar("farm_name", { length: 200 }).notNull(),
  address: text("address"),
  phoneNumber: varchar("phone_number", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ユーザーテーブル
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", { length: 20 }).notNull().default("farmer"),
  farmId: uuid("farm_id").notNull().references(() => farms.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Farm = typeof farms.$inferSelect;
export type NewFarm = typeof farms.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
