/**
 * Ubuntu Pools — Phase 1: Event Schemas & Zod Validators
 *
 * Defines the canonical event schema and all Phase 1 event types.
 *
 * Governance Charter Compliance:
 *   - All event payloads are validated server-side before emission.
 *   - Monetary values in payloads MUST be integer minor units (bigint/number).
 *   - Event types are namespaced strings (domain.action).
 *   - Schemas are the authoritative definition of what constitutes a valid event.
 *
 * Phase 1 Event Types (Ledger + Event Foundations only):
 *   - system.initialized       — system bootstrap event
 *   - ledger.account_opened    — a new ledger account was created
 *   - ledger.posting_rule_created — a new posting rule was registered
 *   - ledger.transaction_posted — a balanced journal transaction was posted
 *   - ledger.transaction_failed — a posting attempt failed
 *
 * NO Phase 2–5 event types (governance, permissions, trust) are defined here.
 */

import { z } from "zod";

// =============================================================================
// PRIMITIVE VALIDATORS
// =============================================================================

/**
 * UUID validator — standard UUID v4 format.
 */
export const uuidSchema = z.string().uuid("Must be a valid UUID");

/**
 * ISO 4217 currency code — 3 uppercase letters.
 */
export const currencySchema = z
  .string()
  .length(3)
  .regex(/^[A-Z]{3}$/, "Must be a 3-letter ISO 4217 currency code (e.g. USD)");

/**
 * Minor unit amount — positive integer (no decimals, no negatives, no zero).
 * Represents the smallest unit of a currency (cents, pence, satoshis, etc.)
 */
export const minorUnitAmountSchema = z
  .number()
  .int()
  .positive();

/**
 * Namespaced event type — must contain exactly one dot.
 * e.g. 'pool.created', 'ledger.account_opened'
 */
export const eventTypeSchema = z
  .string()
  .min(3)
  .regex(
    /^[a-z][a-z0-9_]*\.[a-z][a-z0-9_.]*$/,
    "Event type must be namespaced: '<domain>.<action>' (lowercase, underscores allowed)"
  );

/**
 * SHA-256 hex hash — 64 hex characters.
 */
export const sha256HashSchema = z
  .string()
  .length(64)
  .regex(/^[0-9a-f]{64}$/, "Must be a valid SHA-256 hex hash");

// =============================================================================
// BASE EVENT SCHEMA
// =============================================================================

/**
 * BaseEventSchema: the canonical structure of every event in Ubuntu Pools.
 *
 * This schema is validated before any event is written to the event log.
 * The hash field is computed by the event emission library, not the caller.
 */
export const baseEventSchema = z.object({
  /** UUID primary key (DB-generated, omitted on input) */
  id: uuidSchema.optional(),

  /**
   * Namespaced event type.
   * Convention: '<domain>.<action>'
   */
  eventType: eventTypeSchema,

  /**
   * UUID of the entity that caused this event.
   * Must be a valid UUID — the actor must be identifiable.
   */
  actorId: uuidSchema,

  /**
   * UUID of the primary entity this event concerns.
   */
  entityId: uuidSchema,

  /**
   * String discriminator for entityId.
   * e.g. 'pool', 'member', 'contribution', 'system'
   */
  entityType: z
    .string()
    .min(1, "entityType must not be empty")
    .regex(
      /^[a-z][a-z0-9_]*$/,
      "entityType must be lowercase with underscores"
    ),

  /**
   * Structured event data.
   * Schema is specific to each event type (see below).
   */
  payload: z.record(z.string(), z.unknown()),

  /**
   * Wall-clock time of event emission (UTC).
   * Provided by the caller; used in deterministic hash computation.
   */
  occurredAt: z.iso.datetime(),

  /**
   * Monotonically increasing sequence number per entity.
   * Provided by the EventService after querying the current max.
   */
  sequenceNo: z.number().int().positive(),

  /**
   * SHA-256 hash of the canonical event fields.
   * Computed by the event emission library.
   */
  hash: sha256HashSchema,

  /**
   * Hash of the previous event for this entity.
   * NULL only for the first event (sequenceNo = 1).
   */
  prevHash: sha256HashSchema.nullable(),

  /** Lifecycle state */
  status: z.enum(["pending", "posted", "failed"]).default("pending"),
});

export type BaseEvent = z.infer<typeof baseEventSchema>;

/**
 * Input schema for creating a new event.
 * The caller provides: eventType, actorId, entityId, entityType, payload, occurredAt.
 * The EventService computes: sequenceNo, hash, prevHash, status.
 */
export const createEventInputSchema = baseEventSchema.pick({
  eventType: true,
  actorId: true,
  entityId: true,
  entityType: true,
  payload: true,
  occurredAt: true,
});

export type CreateEventInput = z.infer<typeof createEventInputSchema>;

// =============================================================================
// PHASE 1 EVENT PAYLOAD SCHEMAS
// =============================================================================

/**
 * system.initialized
 *
 * Emitted once when the system is bootstrapped.
 * Creates the system actor and initial ledger accounts.
 */
export const systemInitializedPayloadSchema = z.object({
  /** Human-readable description of the initialization */
  description: z.string().min(1),

  /** Version of the system being initialized */
  systemVersion: z.string().min(1),

  /** ISO 8601 timestamp of initialization */
  initializedAt: z.string().datetime({ offset: true }),
});

export type SystemInitializedPayload = z.infer<
  typeof systemInitializedPayloadSchema
>;

/**
 * ledger.account_opened
 *
 * Emitted when a new ledger account is created.
 * The posting engine uses this to register the account.
 */
export const ledgerAccountOpenedPayloadSchema = z.object({
  /** The account code being opened */
  accountCode: z
    .string()
    .min(1)
    .regex(/^[A-Z0-9_-]+$/, "Account code must be uppercase alphanumeric"),

  /** Human-readable account name */
  accountName: z.string().min(1),

  /** Account type */
  accountType: z.enum(["asset", "liability", "equity", "revenue", "expense"]),

  /** ISO 4217 currency code */
  currency: currencySchema,

  /** Optional: entity this account belongs to */
  entityId: uuidSchema.optional(),

  /** Optional: entity type discriminator */
  entityType: z.string().optional(),
});

export type LedgerAccountOpenedPayload = z.infer<
  typeof ledgerAccountOpenedPayloadSchema
>;

/**
 * ledger.posting_rule_created
 *
 * Emitted when a new posting rule is registered.
 */
export const ledgerPostingRuleCreatedPayloadSchema = z.object({
  /** The event type this rule applies to */
  targetEventType: eventTypeSchema,

  /** Human-readable rule name */
  ruleName: z.string().min(1),

  /** Account code to debit (may contain {entity_id} template) */
  debitAccountCode: z.string().min(1),

  /** Account code to credit (may contain {entity_id} template) */
  creditAccountCode: z.string().min(1),

  /** JSONPath to amount in event payload */
  amountPayloadPath: z.string().min(1),

  /** JSONPath to currency in event payload */
  currencyPayloadPath: z.string().min(1),

  /** Description template */
  descriptionTemplate: z.string().default(""),

  /** Rule version */
  version: z.number().int().positive().default(1),
});

export type LedgerPostingRuleCreatedPayload = z.infer<
  typeof ledgerPostingRuleCreatedPayloadSchema
>;

/**
 * ledger.transaction_posted
 *
 * Emitted when a balanced journal transaction is successfully posted.
 * This event is the audit trail for every ledger posting.
 */
export const ledgerTransactionPostedPayloadSchema = z.object({
  /** The transaction ID grouping the journal entries */
  transactionId: uuidSchema,

  /** The event ID that triggered this posting */
  sourceEventId: uuidSchema,

  /** The posting rule ID that was applied */
  postingRuleId: uuidSchema,

  /** Total amount posted (integer minor units) */
  amount: minorUnitAmountSchema,

  /** Currency of the transaction */
  currency: currencySchema,

  /** Account code that was debited */
  debitAccountCode: z.string().min(1),

  /** Account code that was credited */
  creditAccountCode: z.string().min(1),

  /** Number of journal entries created */
  entryCount: z.number().int().positive(),
});

export type LedgerTransactionPostedPayload = z.infer<
  typeof ledgerTransactionPostedPayloadSchema
>;

/**
 * ledger.transaction_failed
 *
 * Emitted when a posting attempt fails.
 * The source event is marked as 'failed' in the event log.
 * This event is the audit trail for posting failures.
 */
export const ledgerTransactionFailedPayloadSchema = z.object({
  /** The event ID that triggered the failed posting */
  sourceEventId: uuidSchema,

  /** The posting rule ID that was attempted (if found) */
  postingRuleId: uuidSchema.optional(),

  /** Human-readable error message */
  errorMessage: z.string().min(1),

  /** Error code for programmatic handling */
  errorCode: z.enum([
    "RULE_NOT_FOUND",
    "ACCOUNT_NOT_FOUND",
    "CURRENCY_MISMATCH",
    "AMOUNT_EXTRACTION_FAILED",
    "BALANCE_ASSERTION_FAILED",
    "DUPLICATE_TRANSACTION",
    "UNKNOWN_ERROR",
  ]),

  /** Stack trace (development only, omitted in production) */
  stackTrace: z.string().optional(),
});

export type LedgerTransactionFailedPayload = z.infer<
  typeof ledgerTransactionFailedPayloadSchema
>;

// =============================================================================
// TYPED EVENT SCHEMAS (full event with typed payload)
// =============================================================================

/**
 * Typed event schemas for each Phase 1 event type.
 * These combine the base event schema with the specific payload schema.
 */

export const systemInitializedEventSchema = baseEventSchema.extend({
  eventType: z.literal("system.initialized"),
  entityType: z.literal("system"),
  payload: systemInitializedPayloadSchema,
});

export const ledgerAccountOpenedEventSchema = baseEventSchema.extend({
  eventType: z.literal("ledger.account_opened"),
  entityType: z.literal("ledger_account"),
  payload: ledgerAccountOpenedPayloadSchema,
});

export const ledgerPostingRuleCreatedEventSchema = baseEventSchema.extend({
  eventType: z.literal("ledger.posting_rule_created"),
  entityType: z.literal("posting_rule"),
  payload: ledgerPostingRuleCreatedPayloadSchema,
});

export const ledgerTransactionPostedEventSchema = baseEventSchema.extend({
  eventType: z.literal("ledger.transaction_posted"),
  entityType: z.literal("ledger_transaction"),
  payload: ledgerTransactionPostedPayloadSchema,
});

export const ledgerTransactionFailedEventSchema = baseEventSchema.extend({
  eventType: z.literal("ledger.transaction_failed"),
  entityType: z.literal("ledger_transaction"),
  payload: ledgerTransactionFailedPayloadSchema,
});

// =============================================================================
// DISCRIMINATED UNION: all Phase 1 events
// =============================================================================

/**
 * Phase1Event: discriminated union of all valid Phase 1 event types.
 * Used for exhaustive type checking in the posting engine.
 */
export const phase1EventSchema = z.discriminatedUnion("eventType", [
  systemInitializedEventSchema,
  ledgerAccountOpenedEventSchema,
  ledgerPostingRuleCreatedEventSchema,
  ledgerTransactionPostedEventSchema,
  ledgerTransactionFailedEventSchema,
]);

export type Phase1Event = z.infer<typeof phase1EventSchema>;

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

// Zod v4 safe parse result type (replaces z.SafeParseReturnType which was removed in v4)
export type SafeParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: z.ZodError };

/**
 * Validates a raw event input before emission.
 * Returns a typed result with success/failure.
 */
export function validateEventInput(
  input: unknown
): SafeParseResult<CreateEventInput> {
  return createEventInputSchema.safeParse(input) as SafeParseResult<CreateEventInput>;
}

/**
 * Validates a complete event (including computed fields).
 * Used by the event log writer to verify integrity before insert.
 */
export function validateCompleteEvent(
  event: unknown
): SafeParseResult<BaseEvent> {
  return baseEventSchema.safeParse(event) as SafeParseResult<BaseEvent>;
}

/**
 * Validates a payload against a specific event type's schema.
 * Returns a typed result.
 */
export function validatePayloadForEventType(
  eventType: string,
  payload: unknown
): { success: true; data: unknown } | { success: false; error: z.ZodError } {
  const schemaMap: Record<string, z.ZodSchema> = {
    "system.initialized": systemInitializedPayloadSchema,
    "ledger.account_opened": ledgerAccountOpenedPayloadSchema,
    "ledger.posting_rule_created": ledgerPostingRuleCreatedPayloadSchema,
    "ledger.transaction_posted": ledgerTransactionPostedPayloadSchema,
    "ledger.transaction_failed": ledgerTransactionFailedPayloadSchema,
  };

  const schema = schemaMap[eventType];
  if (!schema) {
    // Unknown event types are allowed in Phase 1 (open schema)
    // but their payloads are not validated beyond being a valid object
    const result = z.record(z.string(), z.unknown()).safeParse(payload);
    return result;
  }

  return schema.safeParse(payload);
}
