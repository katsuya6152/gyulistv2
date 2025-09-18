import { date, decimal, integer, pgTable, serial, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

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
  farmId: uuid("farm_id")
    .notNull()
    .references(() => farms.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 母牛テーブル
export const cows = pgTable("cows", {
  id: uuid("id").primaryKey().defaultRandom(),
  individualNumber: varchar("individual_number", { length: 20 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  birthDate: date("birth_date").notNull(),
  // 血統情報
  sirePedigree: varchar("sire_pedigree", { length: 200 }), // 父牛血統
  maternalGrandsire: varchar("maternal_grandsire", { length: 200 }), // 母の父血統
  maternalGreatGrandsire: varchar("maternal_great_grandsire", { length: 200 }), // 母の祖父血統
  maternalGreatGreatGrandsire: varchar("maternal_great_great_grandsire", { length: 200 }), // 母の母の祖父血統
  // 母牛情報
  damName: varchar("dam_name", { length: 100 }), // 母牛名号
  damRegistrationNumber: varchar("dam_registration_number", { length: 50 }), // 母牛登録番号
  maternalScore: decimal("maternal_score", { precision: 5, scale: 2 }), // 母得点
  // 登録・識別情報
  registrationSymbolNumber: varchar("registration_symbol_number", { length: 50 }), // 登録記号番号
  producerName: varchar("producer_name", { length: 200 }), // 生産者氏名
  individualIdentificationNumber: varchar("individual_identification_number", {
    length: 20,
  }).unique(), // 個体識別番号
  // 日付情報
  auctionDate: date("auction_date"), // せり年月日（導入日）
  healthStatus: varchar("health_status", { length: 20 }).notNull().default("HEALTHY"),
  farmId: uuid("farm_id")
    .notNull()
    .references(() => farms.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 子牛テーブル（出荷管理用）
export const calves = pgTable("calves", {
  id: uuid("id").primaryKey().defaultRandom(),
  individualNumber: varchar("individual_number", { length: 20 }).notNull().unique(),
  calfName: varchar("calf_name", { length: 100 }).notNull(), // 名号
  // 母牛情報（出荷管理画面で表示用）
  damName: varchar("dam_name", { length: 100 }), // 母牛名
  damIndividualNumber: varchar("dam_individual_number", { length: 20 }), // 母牛の個体番号
  // 血統情報
  sirePedigree: varchar("sire_pedigree", { length: 200 }), // 父牛血統
  maternalGrandsire: varchar("maternal_grandsire", { length: 200 }), // 母の父血統
  maternalGreatGrandsire: varchar("maternal_great_grandsire", { length: 200 }), // 母の祖父血統
  maternalGreatGreatGrandsire: varchar("maternal_great_great_grandsire", { length: 200 }), // 母の母の祖父血統
  // 繁殖・出産情報
  matingDate: date("mating_date"), // 種付年月日
  expectedBirthDate: date("expected_birth_date"), // 出産予定日
  birthDate: date("birth_date").notNull(),
  auctionDate: date("auction_date"), // せり年月日（出荷日として使用）
  matingInterval: integer("mating_interval"), // 種付け間隔（日数）
  // 個体情報
  weight: decimal("weight", { precision: 8, scale: 2 }), // 体重（kg）
  ageInDays: integer("age_in_days"), // 日齢
  gender: varchar("gender", { length: 10 }).notNull(), // 性別（MALE/FEMALE/CASTRATED）
  // 取引情報（出荷管理で使用）
  price: decimal("price", { precision: 12, scale: 2 }), // 価格（円）
  buyer: varchar("buyer", { length: 200 }), // 購買者
  remarks: text("remarks"), // 備考
  // その他
  cowId: uuid("cow_id").references(() => cows.id), // 母牛ID（nullable）
  healthStatus: varchar("health_status", { length: 20 }).notNull().default("HEALTHY"),
  farmId: uuid("farm_id")
    .notNull()
    .references(() => farms.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Farm = typeof farms.$inferSelect;
export type NewFarm = typeof farms.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Cow = typeof cows.$inferSelect;
export type NewCow = typeof cows.$inferInsert;
export type Calf = typeof calves.$inferSelect;
export type NewCalf = typeof calves.$inferInsert;
