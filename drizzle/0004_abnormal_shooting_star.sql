ALTER TABLE "generations" ALTER COLUMN "style_preset" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."style_preset";--> statement-breakpoint
CREATE TYPE "public"."style_preset" AS ENUM('friendly', 'professional', 'minimal', 'bold');--> statement-breakpoint
UPDATE "generations" SET "style_preset" = CASE
  WHEN "style_preset" = 'soft_bright' THEN 'friendly'
  WHEN "style_preset" = 'dark_premium' THEN 'professional'
  WHEN "style_preset" = 'clean_minimal' THEN 'minimal'
  WHEN "style_preset" = 'bold_playful' THEN 'bold'
  ELSE "style_preset"
END;--> statement-breakpoint
ALTER TABLE "generations" ALTER COLUMN "style_preset" SET DATA TYPE "public"."style_preset" USING "style_preset"::"public"."style_preset";