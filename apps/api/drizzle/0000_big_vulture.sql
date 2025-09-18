CREATE TABLE "calves" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"individual_number" varchar(20) NOT NULL,
	"calf_name" varchar(100) NOT NULL,
	"dam_name" varchar(100),
	"dam_individual_number" varchar(20),
	"sire_pedigree" varchar(200),
	"maternal_grandsire" varchar(200),
	"maternal_great_grandsire" varchar(200),
	"maternal_great_great_grandsire" varchar(200),
	"mating_date" date,
	"expected_birth_date" date,
	"birth_date" date NOT NULL,
	"auction_date" date,
	"mating_interval" integer,
	"weight" numeric(8, 2),
	"age_in_days" integer,
	"gender" varchar(10) NOT NULL,
	"price" numeric(12, 2),
	"buyer" varchar(200),
	"remarks" text,
	"cow_id" uuid NOT NULL,
	"health_status" varchar(20) DEFAULT 'HEALTHY' NOT NULL,
	"farm_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "calves_individual_number_unique" UNIQUE("individual_number")
);
--> statement-breakpoint
CREATE TABLE "cows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"individual_number" varchar(20) NOT NULL,
	"name" varchar(100) NOT NULL,
	"birth_date" date NOT NULL,
	"sire_pedigree" varchar(200),
	"maternal_grandsire" varchar(200),
	"maternal_great_grandsire" varchar(200),
	"maternal_great_great_grandsire" varchar(200),
	"dam_name" varchar(100),
	"dam_registration_number" varchar(50),
	"maternal_score" numeric(5, 2),
	"registration_symbol_number" varchar(50),
	"producer_name" varchar(200),
	"individual_identification_number" varchar(20),
	"auction_date" date,
	"health_status" varchar(20) DEFAULT 'HEALTHY' NOT NULL,
	"farm_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "cows_individual_number_unique" UNIQUE("individual_number"),
	CONSTRAINT "cows_individual_identification_number_unique" UNIQUE("individual_identification_number")
);
--> statement-breakpoint
CREATE TABLE "farms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"farm_name" varchar(200) NOT NULL,
	"address" text,
	"phone_number" varchar(20),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"role" varchar(20) DEFAULT 'farmer' NOT NULL,
	"farm_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "calves" ADD CONSTRAINT "calves_cow_id_cows_id_fk" FOREIGN KEY ("cow_id") REFERENCES "public"."cows"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calves" ADD CONSTRAINT "calves_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cows" ADD CONSTRAINT "cows_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;