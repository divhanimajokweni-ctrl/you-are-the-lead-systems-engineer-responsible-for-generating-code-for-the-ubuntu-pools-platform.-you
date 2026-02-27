import { pgTable, serial, uuid, text, jsonb, bigint, timestamp, pgEnum, customType, boolean } from "drizzle-orm/pg-core";

const bytea = customType<{ data: Buffer }>({
  dataType() {
    return "bytea";
  }
});

export const entryTypeEnum = pgEnum("entry_type", ["DEBIT", "CREDIT"]);

export const identities = pgTable("identities", {
  internalId: uuid("internal_id").primaryKey().defaultRandom(),
  piiCiphertext: bytea("pii_ciphertext"),
  piiIv: bytea("pii_iv"),
  piiAuthTag: bytea("pii_auth_tag"),
  piiKeyId: uuid("pii_key_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export const encryptionKeys = pgTable("encryption_keys", {
  keyId: uuid("key_id").primaryKey().defaultRandom(),
  actorId: uuid("actor_id").notNull(),
  dekCiphertext: bytea("dek_ciphertext").notNull(),
  dekIv: bytea("dek_iv").notNull(),
  dekAuthTag: bytea("dek_auth_tag").notNull(),
  algorithm: text("algorithm").notNull().default("AES-256-GCM"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  active: boolean("active").notNull().default(true)
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  actorId: uuid("actor_id").notNull(),
  type: text("type").notNull(),
  payload: jsonb("payload").notNull(),
  sensitiveCiphertext: bytea("sensitive_ciphertext"),
  sensitiveIv: bytea("sensitive_iv"),
  sensitiveAuthTag: bytea("sensitive_auth_tag"),
  sensitiveKeyId: uuid("sensitive_key_id").references(() => encryptionKeys.keyId),
  metadata: jsonb("metadata").notNull(),
  prevEventHash: text("prev_event_hash"),
  eventHash: text("event_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  eventId: bigint("event_id", { mode: "bigint" }).notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const ledgerEntries = pgTable("ledger_entries", {
  id: serial("id").primaryKey(),
  transactionId: bigint("transaction_id", { mode: "bigint" }).notNull(),
  accountId: text("account_id").notNull(),
  amountCents: bigint("amount_cents", { mode: "bigint" }).notNull(),
  entryType: entryTypeEnum("type").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const trustStatusEnum = pgEnum("trust_status", ["active", "frozen", "banned"]);
export const infractionTypeEnum = pgEnum("infraction_type", ["failed_proposal", "governance_abuse", "spam", "rule_violation", "appeal_rejected"]);
export const appealStatusEnum = pgEnum("appeal_status", ["pending", "approved", "rejected"]);

export const trustScores = pgTable("trust_scores", {
  actorId: uuid("actor_id").primaryKey(),
  score: bigint("score", { mode: "number" }).notNull(),
  status: trustStatusEnum("status").notNull().default("active"),
  lastDecayAt: timestamp("last_decay_at", { withTimezone: true }).notNull().defaultNow(),
  lastUpdatedAt: timestamp("last_updated_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const infractions = pgTable("infractions", {
  id: uuid("id").primaryKey().defaultRandom(),
  actorId: uuid("actor_id").notNull(),
  type: infractionTypeEnum("type").notNull(),
  amount: bigint("amount", { mode: "number" }).notNull(),
  reason: text("reason").notNull(),
  relatedEventId: bigint("related_event_id", { mode: "bigint" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const appeals = pgTable("appeals", {
  id: uuid("id").primaryKey().defaultRandom(),
  actorId: uuid("actor_id").notNull(),
  infractionId: uuid("infraction_id").notNull().references(() => infractions.id),
  status: appealStatusEnum("status").notNull().default("pending"),
  reason: text("reason").notNull(),
  reviewedBy: uuid("reviewed_by"),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});
