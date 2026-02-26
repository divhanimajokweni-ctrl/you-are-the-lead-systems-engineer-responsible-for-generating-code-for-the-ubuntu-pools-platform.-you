# Active Context: Ubuntu Pools — Phase 1 Foundation

## Current State

**Phase 1 Status**: ✅ Complete — Ledger + Event Foundations

The system implements the Ubuntu Pools Phase 1 governance foundation:
- Immutable, append-only event log with SHA-256 hash chain
- Double-entry ledger with DB-level balance enforcement
- Posting rules engine
- Full TypeScript type safety (0 errors)
- 130/130 unit tests passing
- 0 lint errors

## Recently Completed

- [x] PostgreSQL schema migration (`src/db/migrations/0001_phase1_foundation.sql`)
  - `events` table (append-only, immutability triggers)
  - `ledger_accounts` table (chart of accounts)
  - `journal_entries` table (double-entry, immutability triggers)
  - `posting_rules` table (event→ledger mapping config)
  - `v_account_balances` view
  - `v_transaction_balance_check` view
  - `assert_transaction_balanced()` DB function
  - Immutability triggers on all core tables
- [x] Drizzle ORM schema (`src/db/schema.ts`) — TypeScript representation
- [x] Database client (`src/db/client.ts`) — postgres.js + Drizzle
- [x] Event schemas & Zod validators (`src/lib/events/schemas.ts`)
  - Zod v4 compatible (uses `.issues`, `z.iso.datetime()`, `z.record(z.string(), z.unknown())`)
  - Phase 1 event types: system.initialized, ledger.account_opened, ledger.posting_rule_created, ledger.transaction_posted, ledger.transaction_failed
- [x] Deterministic event hasher (`src/lib/events/hasher.ts`)
  - SHA-256 over canonical JSON (sorted keys, snake_case fields)
  - Hash chain verification
- [x] Event emitter (`src/lib/events/emitter.ts`)
  - Append-only enforced
  - Idempotent (duplicate hash detection)
  - Atomic sequence number assignment
  - Status transitions: pending → posted | failed
- [x] Journal posting engine (`src/lib/ledger/posting-engine.ts`)
  - Double-entry balance assertion (app + DB level)
  - Payload extraction (dot-notation + JSONPath)
  - Account code template substitution
  - Audit events for success/failure
- [x] Ledger query utilities (`src/lib/ledger/queries.ts`)
  - Account balances (debit-normal / credit-normal)
  - Transaction history
  - Integrity checks (unbalanced transaction detection)
- [x] EventService (`src/lib/services/event-service.ts`)
- [x] LedgerService (`src/lib/services/ledger-service.ts`)
- [x] API routes:
  - `POST/GET /api/events`
  - `GET /api/events/[id]`
  - `POST/GET /api/ledger/accounts`
  - `GET /api/ledger/accounts/[id]/balance`
- [x] Test suite (130 tests, 100% pass rate)
  - `src/tests/hasher.test.ts` (39 tests)
  - `src/tests/schemas.test.ts` (49 tests)
  - `src/tests/posting-engine.test.ts` (42 tests)
- [x] Vitest configuration (`vitest.config.ts`)
- [x] Drizzle Kit configuration (`drizzle.config.ts`)

## Current Structure

| File/Directory | Purpose | Status |
|----------------|---------|--------|
| `src/db/migrations/0001_phase1_foundation.sql` | PostgreSQL schema | ✅ Ready |
| `src/db/schema.ts` | Drizzle ORM schema | ✅ Ready |
| `src/db/client.ts` | DB connection | ✅ Ready |
| `src/lib/events/schemas.ts` | Zod validators | ✅ Ready |
| `src/lib/events/hasher.ts` | SHA-256 hashing | ✅ Ready |
| `src/lib/events/emitter.ts` | Event emission | ✅ Ready |
| `src/lib/ledger/posting-engine.ts` | Double-entry posting | ✅ Ready |
| `src/lib/ledger/queries.ts` | Ledger queries | ✅ Ready |
| `src/lib/services/event-service.ts` | EventService | ✅ Ready |
| `src/lib/services/ledger-service.ts` | LedgerService | ✅ Ready |
| `src/app/api/events/route.ts` | Events API | ✅ Ready |
| `src/app/api/events/[id]/route.ts` | Single event API | ✅ Ready |
| `src/app/api/ledger/accounts/route.ts` | Accounts API | ✅ Ready |
| `src/app/api/ledger/accounts/[id]/balance/route.ts` | Balance API | ✅ Ready |
| `src/tests/` | Unit tests (130 tests) | ✅ Ready |

## Phase 1 Governance Compliance

| Requirement | Status |
|-------------|--------|
| Append-only event log | ✅ DB triggers prevent DELETE/UPDATE of core fields |
| Double-entry ledger | ✅ Balance asserted at app + DB level |
| Deterministic hashing | ✅ SHA-256 over canonical JSON (sorted keys) |
| Hash chain | ✅ prev_hash links events for tamper-evidence |
| Non-custodial | ✅ System records intent only, no fund custody |
| Integer minor units | ✅ All monetary values are bigint |
| Server-side validation | ✅ All inputs validated before DB write |
| No Phase 2–5 features | ✅ No governance, permissions, or trust scoring |

## What's NOT Included (Phase 2+)

- Governance logic
- Permission system
- Trust scoring / decay
- Pool management
- Member management
- UX / UI

## Setup Requirements

1. PostgreSQL database
2. `DATABASE_URL` environment variable
3. Run migration: `psql $DATABASE_URL < src/db/migrations/0001_phase1_foundation.sql`

## Session History

| Date | Changes |
|------|---------|
| Initial | Template created with base Next.js setup |
| 2026-02-26 | Phase 1 foundation implemented: event log, double-entry ledger, posting engine, 130 tests |
