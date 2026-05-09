CREATE TYPE "public"."generation_status" AS ENUM('pending', 'complete', 'failed');--> statement-breakpoint
CREATE TYPE "public"."style_preset" AS ENUM('soft_bright', 'dark_premium', 'clean_minimal', 'bold_playful');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('purchase', 'usage', 'refund');--> statement-breakpoint
ALTER TABLE "generations" DROP CONSTRAINT "generations_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "generations" ALTER COLUMN "style_preset" SET DATA TYPE "public"."style_preset" USING "style_preset"::"public"."style_preset";--> statement-breakpoint
ALTER TABLE "generations" ALTER COLUMN "status" SET DATA TYPE "public"."generation_status" USING "status"::"public"."generation_status";--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "type" SET DATA TYPE "public"."transaction_type" USING "type"::"public"."transaction_type";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "stripe_customer_id" text;--> statement-breakpoint
ALTER TABLE "generations" ADD CONSTRAINT "generations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "generations_user_created_idx" ON "generations" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "generations_pending_idx" ON "generations" USING btree ("created_at") WHERE "generations"."status" = 'pending';--> statement-breakpoint
CREATE UNIQUE INDEX "transactions_stripe_payment_id_uniq" ON "transactions" USING btree ("stripe_payment_id") WHERE "transactions"."stripe_payment_id" is not null;--> statement-breakpoint
CREATE INDEX "transactions_user_created_idx" ON "transactions" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_uniq" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "users_stripe_customer_id_uniq" ON "users" USING btree ("stripe_customer_id");