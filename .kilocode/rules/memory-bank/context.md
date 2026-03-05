# Active Context: Ubuntu Pools — Phase 8 Complete

## Current State

**Phase 8 Status**: ✅ Complete — Plaid → Stitch Pivot (Local Open Banking)

The financial data provider has been migrated from Plaid (global) to Stitch (South African local). This maintains the Adapter Pattern architecture to allow future provider swaps without breaking MemberCore or UbuntuScore logic.

## Recently Completed

- [x] **Phase 8: Plaid → Stitch Pivot** (2026-03-05)
  - Bank Provider Adapter Pattern (`src/lib/bank-provider/`)
    - Abstract interfaces: `BankProvider`, `BankAccount`, `BankTransaction`, `BankConnection`
    - `types.ts` - Normalized data models (provider-agnostic)
    - `stitch.ts` - Stitch provider implementation with full SA bank coverage
    - `index.ts` - Provider factory with environment config
  - Stitch Integration
    - `StitchLink.tsx` - React component replacing PlaidLink
    - API Routes (`/api/stitch/`):
      - `create-link-token` - Initialize bank connection flow
      - `exchange-token` - Exchange public token for access token
      - `transactions` - Fetch normalized transactions
      - `connection` - Manage bank connections (refresh/disconnect)
  - Removed: All Plaid SDKs, components, and API routes
  - Updated: Sovereignty system uses 'stitch' source instead of 'plaid'
  - Updated: Privacy page toggle renamed to 'Stitch Transactions'
  - Environment: Added `STITCH_CLIENT_ID`, `STITCH_CLIENT_SECRET`, `STITCH_ENV`, `BANK_PROVIDER`
  - Build: ✅ Zero TypeScript regressions

- [x] **Phase 7: Sovereignty & Matchmaker** (2026-03-02)
  - Sovereignty Proxy Service (`src/lib/services/sovereignty-proxy.ts`)
    - NER-based anonymization engine
    - Intent Tag extraction from social content
    - Profile types: blank, ESG-focused, Community Anchor, Entrepreneur, Mixed
    - TTL-based data ephemerality (default 30 days)
    - Category filtering: ESG, Community, Entrepreneur, Lifestyle
  - Matchmaker Service (`src/lib/services/matchmaker.ts`)
    - Signal-to-Asset algorithm
    - Pool recommendations based on intent tags
    - Social-Accord Synergy calculation
    - Combined Score: UbuntuScore × 0.65 + Synergy × 0.35
    - Personalized prosperity opportunities with discounted rates
  - UI Components (`src/components/sovereignty/`)
    - `SovereigntyToggle.tsx` - User-controlled data sharing switch
    - `MatchmakerCard.tsx` - Pool recommendation cards
    - `ProsperityOpportunityCard.tsx` - Personalized opportunity display
  - API Routes:
    - `POST/GET /api/sovereignty` - Toggle, configure, ingest, profile
    - `POST/GET /api/matchmaker/opportunity` - Generate prosperity opportunities
    - `POST/GET /api/matchmaker/recommendations` - Pool recommendations

- [x] **Phase 6.1: Ubuntu Score Implementation** (2026-03-02)
  - Ubuntu Score calculation in credit service (`src/lib/services/credit-service.ts`)
    - Member-level components: Coverage (35%), Timeliness (25%), Consistency (20%), Stress (20%)
    - Pool Health: Buffer Coverage Ratio + Default Rate → Pool Multiplier [0.75, 1.0]
    - Formula: `UbuntuScore = 100 * clamp(MemberCore * PoolMultiplier, 0, 1)`
    - Rolling window: configurable (default 90 days)
  - API Route: `POST/GET /api/credit/score` - Ubuntu Score calculation
  - Tests (7 new tests):
    - Perfect payment history → high score
    - Missed payments → stress penalty
    - Late payments → timeliness penalty
    - Pool health multiplier effect
    - Buffer strength impact

- [x] **Phase 6: Credit Facilities** (2026-03-02)
  - Credit database schema (`src/db/schema-credit.ts`)
    - `credit_pool_config` - Pool configuration and phase state
    - `member_credit_profile` - Member credit limits and history
    - `credit_loans` - Active loans with payment tracking
    - `credit_payments` - Payment records
    - `pool_health_history` - Historical health metrics
  - Credit service (`src/lib/services/credit-service.ts`)
    - Three-phase credit system with automatic transitions
    - Pool health calculation with liquidity/asset/profitability/growth scores
    - Credit eligibility checking with Ubuntu Score and contribution base
    - Loan approval with exposure limits
    - Payment processing and repayment tracking
  - Credit event schemas (`src/lib/events/schemas-credit.ts`)
    - `credit.pool_initialized`, `credit.capital_deposited`, `credit.phase_transition`
    - `credit.eligibility_checked`, `credit.loan_requested`, `credit.loan_approved`
    - `credit.loan_issued`, `credit.payment_received`, `credit.loan_repaid`
    - `credit.loan_defaulted`, `credit.health_updated`
  - API Routes:
    - `POST/GET /api/credit/pools` - Pool configuration
    - `POST /api/credit/eligibility` - Check credit eligibility
    - `POST/GET /api/credit/loans` - Loan management
    - `POST /api/credit/payments` - Process payments
    - `GET /api/credit/health` - Pool health metrics
  - UI Components:
    - `CreditDashboard.tsx` - Credit facilities dashboard with phase indicators
    - `PoolHealthGauge.tsx` - Visual pool health gauge with metrics
  - Tests (15 tests, 100% pass):
    - `src/tests/credit.test.ts` - Credit service unit tests

- [x] **Home Screen Redesign** (2026-03-01)
  - New humanistic UI with warm gradient background (`midnight` → `neutral-900` → `deep-forest`)
  - Added components:
    - `WelcomeDashboard.tsx` - Greeting, user stats (Ubuntu Score, Trust Circle, Contributions, Impact Points)
    - `VaultBalance.tsx` - Commons Vault balance display with progress bar
    - `ActivityFeed.tsx` - Recent community activities (contributions, badges, vouches, payments)
    - `QuickResources.tsx` - Billing, Docs, FICA Status, Platform Audit links
    - `FAQSection.tsx` - Expandable FAQ with categories (Philosophy & Trust, Payments & Liquidity, Security & Legal, Prosperity Tiers), AI Assistant CTA
    - `ProsperityTiers.tsx` - Family Wealth Reserve, SME Bulk-Buying Circle, Youth Unity Fund
    - `UserProfile.tsx` - Profile dropdown with settings, notifications, privacy controls
  - New CSS components: glass-card, warm-glow, humanistic-card, stat-card, activity-item, resource-link, faq-item, tier-card
  - New animations: float, breathe
  - New colors: sage, warm-cream, terracotta, deep-forest, sunset, midnight

- [x] **Phase 3 Implementation** (2026-02-27)
  - WebSocket server & client (`src/lib/websocket/`)
  - Trust-based reputation engine (`src/lib/reputation/engine.ts`)
  - Observability service (`src/lib/observability/service.ts`)
  - Data sovereignty/privacy framework (`src/lib/privacy/sovereignty.ts`)
  - Edge caching config (`src/lib/performance/edge.ts`)
  - UI Components:
    - `PulseVisualization.tsx` - Real-time collective pulses
    - `TrustConstellation.tsx` - Visual trust network
    - `ContributionResonance.tsx` - Impact multiplier visualization
    - `TimebankHarmony.tsx` - Mutual aid timebanking
    - `GovernanceHub.tsx` - Trust-based governance UI
    - `ObservabilityDashboard.tsx` - Community transparency
  - API Routes:
    - `/api/observability/health`
    - `/api/observability/metrics`
  - Tests (286 total, 100% pass):
    - `reputation.test.ts` - Trust score calculations
    - `observability.test.ts` - Transparency metrics
    - `privacy.test.ts` - Data sovereignty

- [x] **Phase 3 Technical Roadmap Document** (`docs/phase3-ubuntu-transformation.md`)
  - 12-week migration timeline with detailed deliverables
  - WebSocket architecture for real-time community feedback
  - Motion design specifications (trust flow animations, contribution ripples)
  - Trust score algorithm and authority levels
  - User-facing observability dashboard design
  - CI/CD pipeline (GitHub Actions with security scanning)
  - Edge-caching strategy for global <100ms TTFB
  - Privacy-first security framework (ZK proofs, data rights)

- [x] **5 Interactive Features for Collective Prosperity**
  1. Trust Constellation - visual web of trust relationships
  2. Contribution Resonance - ripple waves showing impact multiplier
  3. The Ubuntu Circle - collaborative task adoption system
  4. Timebank Harmony - mutual aid time-banking with circulation incentives
  5. Collective Achievement Constellation - community milestones over individual badges

- [x] **Trust-Based Governance Model**
  - Three-layer architecture: Constitutional, Operational, Arbitration
  - Trust circles as foundation (mutual vouching)
  - Council of Elders (elected arbitrators)
  - Archivist Council (protocol guardians)
  - Quadratic + conviction voting mechanisms
  - Dispute resolution flow (peer → mediation → elders → appeal)
  - Complete comparison: Traditional moderation vs trust-based governance

- [x] **Phase 4: Trust System** (previously completed)
  - Trust scores, decay, penalties, and appeals as gating mechanisms

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
| `src/db/schema-credit.ts` | Credit facilities schema | ✅ Ready |
| `src/db/client.ts` | DB connection | ✅ Ready |
| `src/lib/events/schemas.ts` | Zod validators | ✅ Ready |
| `src/lib/events/schemas-credit.ts` | Credit event schemas | ✅ Ready |
| `src/lib/events/hasher.ts` | SHA-256 hashing | ✅ Ready |
| `src/lib/events/emitter.ts` | Event emission | ✅ Ready |
| `src/lib/ledger/posting-engine.ts` | Double-entry posting | ✅ Ready |
| `src/lib/ledger/queries.ts` | Ledger queries | ✅ Ready |
| `src/lib/services/event-service.ts` | EventService | ✅ Ready |
| `src/lib/services/ledger-service.ts` | LedgerService | ✅ Ready |
| `src/lib/services/credit-service.ts` | CreditService | ✅ Ready |
| `src/lib/services/sovereignty-proxy.ts` | Sovereignty Proxy | ✅ Ready |
| `src/lib/services/matchmaker.ts` | Matchmaker Service | ✅ Ready |
| `src/app/api/events/route.ts` | Events API | ✅ Ready |
| `src/app/api/events/[id]/route.ts` | Single event API | ✅ Ready |
| `src/app/api/ledger/accounts/route.ts` | Accounts API | ✅ Ready |
| `src/app/api/ledger/accounts/[id]/balance/route.ts` | Balance API | ✅ Ready |
| `src/app/api/credit/pools/route.ts` | Credit pool API | ✅ Ready |
| `src/app/api/credit/eligibility/route.ts` | Credit eligibility API | ✅ Ready |
| `src/app/api/credit/loans/route.ts` | Loans API | ✅ Ready |
| `src/app/api/credit/payments/route.ts` | Payments API | ✅ Ready |
| `src/app/api/credit/health/route.ts` | Health API | ✅ Ready |
| `src/app/api/credit/score/route.ts` | Ubuntu Score API | ✅ Ready |
| `src/app/api/sovereignty/route.ts` | Sovereignty API | ✅ Ready |
| `src/app/api/matchmaker/route.ts` | Matchmaker API | ✅ Ready |
| `src/components/credit/CreditDashboard.tsx` | Credit dashboard UI | ✅ Ready |
| `src/components/credit/PoolHealthGauge.tsx` | Health gauge UI | ✅ Ready |
| `src/components/stitch/StitchLink.tsx` | Bank connection UI | ✅ Ready |
| `src/lib/bank-provider/types.ts` | Bank provider interfaces | ✅ Ready |
| `src/lib/bank-provider/stitch.ts` | Stitch implementation | ✅ Ready |
| `src/lib/bank-provider/index.ts` | Provider factory | ✅ Ready |
| `src/tests/` | Unit tests (287 tests) | ✅ Ready |

## Phase 1 + Phase 4 + Phase 6 Governance Compliance

| Requirement | Status |
|-------------|--------|
| Append-only event log | ✅ DB triggers prevent DELETE/UPDATE of core fields |
| Double-entry ledger | ✅ Balance asserted at app + DB level |
| Deterministic hashing | ✅ SHA-256 over canonical JSON (sorted keys) |
| Hash chain | ✅ prev_hash links events for tamper-evidence |
| Non-custodial | ✅ System records intent only, no fund custody |
| Integer minor units | ✅ All monetary values are bigint |
| Server-side validation | ✅ All inputs validated before DB write |
| Trust as Permissions | ✅ Trust scores gate proposals/operations (not balance math) |
| Trust Decay | ✅ Time-based decay with configurable rate |
| Trust Penalties | ✅ Infractions reduce score, emit events |
| Appeals Process | ✅ Recovery workflow with audit trail |
| Credit Phases | ✅ Three-phase rollout with buffer-first design |
| Pool Health Gates | ✅ Automatic credit freeze at health < 70% |
| Ubuntu Score Limits | ✅ Credit tied to contribution reliability |

## What's NOT Included (Future Phases)

- WebSocket server production deployment
- Full database integration for trust/reputation
- Real authentication system

## Setup Requirements

1. PostgreSQL database
2. `DATABASE_URL` environment variable
3. Run migration: `psql $DATABASE_URL < src/db/migrations/0001_phase1_foundation.sql`

## Session History

| Date | Changes |
|------|---------|
| Initial | Template created with base Next.js setup |
| 2026-02-26 | Phase 1 foundation implemented: event log, double-entry ledger, posting engine, 130 tests |
| 2026-02-27 | Phase 4 trust system: scores, decay, penalties, appeals, gating middleware |
| 2026-02-27 | Phase 3 transformation: technical roadmap, 5 prosperity features, trust-based governance model |
| 2026-03-01 | Home screen redesign: humanistic UI, Welcome Dashboard, Vault Balance, Activity Feed, Quick Resources, FAQ, Prosperity Tiers, User Profile |
| 2026-03-02 | Phase 6 credit facilities: phased credit system, Pool Health gates, Ubuntu Score limits, 15 tests |
| 2026-03-02 | Phase 6.1 Ubuntu Score: forward-looking trust score, Coverage/Timeliness/Consistency/Stress + Pool Multiplier, 22 tests |
| 2026-03-02 | Phase 7 Sovereignty & Matchmaker: NER anonymization, Sovereignty Toggle, TTL-based intent tags, Signal-to-Asset matching, 287 tests |
| 2026-03-05 | Phase 8 Plaid → Stitch Pivot: Adapter Pattern, Stitch integration, removed Plaid deps, zero regressions |
