CREATE TABLE "receipts" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"result" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_user_id_profiles_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id");