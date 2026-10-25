import {
  pgTable,
  text,
  integer,
  jsonb,
  timestamp,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
export const profiles = pgTable(
  "profiles",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    balance: integer("balance").notNull().default(0),
    state: jsonb("state").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [check("nonnegative_balance", sql`${t.balance} >= 0`)],
);
export const transactions = pgTable("transactions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => profiles.id),
  amount: integer("amount").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const receipts = pgTable("receipts", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => profiles.id),
  result: jsonb("result"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
