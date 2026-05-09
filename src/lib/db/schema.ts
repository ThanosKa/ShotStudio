import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const transactionType = pgEnum("transaction_type", [
  "purchase",
  "usage",
  "refund",
]);

export const generationStatus = pgEnum("generation_status", [
  "pending",
  "complete",
  "failed",
]);

export const stylePreset = pgEnum("style_preset", [
  "soft_bright",
  "dark_premium",
  "clean_minimal",
  "bold_playful",
]);

export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    stripeCustomerId: text("stripe_customer_id"),
    credits: integer("credits").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("users_email_uniq").on(t.email),
    uniqueIndex("users_stripe_customer_id_uniq")
      .on(t.stripeCustomerId)
      .where(sql`${t.stripeCustomerId} is not null`),
  ],
);

export const transactions = pgTable(
  "transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .references(() => users.id, { onDelete: "restrict" })
      .notNull(),
    type: transactionType("type").notNull(),
    amount: integer("amount").notNull(),
    stripePaymentId: text("stripe_payment_id"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("transactions_stripe_payment_id_uniq")
      .on(t.stripePaymentId)
      .where(sql`${t.stripePaymentId} is not null`),
    index("transactions_user_created_idx").on(t.userId, t.createdAt.desc()),
  ],
);

export const generations = pgTable(
  "generations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    appName: text("app_name").notNull(),
    stylePreset: stylePreset("style_preset").notNull(),
    category: text("category").notNull(),
    status: generationStatus("status").notNull(),
    failureReason: text("failure_reason"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (t) => [
    index("generations_user_created_idx").on(t.userId, t.createdAt.desc()),
    index("generations_pending_idx")
      .on(t.createdAt)
      .where(sql`${t.status} = 'pending'`),
  ],
);
