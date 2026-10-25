CREATE TABLE "profiles" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"balance" integer DEFAULT 0 NOT NULL,
	"state" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "nonnegative_balance" CHECK ("balance" >= 0)
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"amount" integer NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_profiles_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id");