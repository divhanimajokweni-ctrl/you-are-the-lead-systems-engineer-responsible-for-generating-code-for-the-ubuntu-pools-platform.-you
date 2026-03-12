# Ubuntu Pools Platform

> *"I am because we are"* — A collective prosperity system with trust-based governance, immutable ledger, and community-driven impact.

---

## Vision Statement

Ubuntu Pools is a digital platform designed to operationalize the African philosophy of Ubuntu — collective interdependence — through technology. The platform enables communities to pool resources, build trust through transparent governance, and create sustainable prosperity circles that transcend traditional financial systems.

### Core Philosophy

The platform addresses three fundamental challenges in community-based finance:

1. **Trust Deficits** — Traditional systems require centralized authorities to establish trust. Ubuntu Pools replaces this with a cryptographically verifiable, peer-attested reputation system where trust is earned through demonstrated reciprocity and community contribution.

2. **Exclusion** — Billions remain unbanked or underbanked. The platform's zero-knowledge proofs and privacy-preserving architecture allow participation without revealing sensitive personal data.

3. **Vulnerability** — Individual families face catastrophic risk from single-point failures. The collective structure distributes risk across the village while maintaining individual sovereignty.

---

## Detailed Codebase Preview

### Architecture Overview

```
src/
├── app/                          # Next.js 16 App Router
│   ├── api/                      # REST API endpoints
│   ├── page.tsx                 # Main dashboard
│   └── globals.css              # Tailwind 4 theme
├── components/
│   ├── backbone/                # Lindiwe AI integration
│   ├── collective/             # Timebank & contribution systems
│   ├── dashboard/              # Trust score & technical dashboards
│   ├── governance/             # Proposal & voting UI
│   ├── home/                   # FAQ, prosperity tiers, activity
│   ├── ledger/                 # Immutable transaction display
│   ├── lindiwe/                # AI governance assistant
│   ├── privacy/                # Sovereignty controls
│   ├── sovereignty/            # Data rights management
│   ├── stitch/                 # South African banking integration
│   ├── village/                # Village circles, pools, commons
│   └── ui/                     # Shared UI components
├── lib/
│   ├── access/                  # RBAC & consent management
│   ├── api/                     # Route handlers & validation
│   ├── auth/                    # Authentication middleware
│   ├── backbone/                # Central nervous system
│   ├── bank-provider/           # Banking abstraction layer
│   ├── cache/                   # Performance caching
│   ├── custody/                 # Custody adapters
│   ├── events/                  # Event schemas & signing
│   ├── eventsourcing/           # Event sourcing core
│   ├── features/                # Feature flags
│   ├── governance/               # Constitution & proposals
│   ├── identity/                # Keypair management & proofs
│   ├── integrations/            # OpenClaw & Stitch
│   ├── ledger/                  # Merkle trees & snapshots
│   ├── observability/           # Logging & performance
│   ├── openclaw/                # Executive shadow gateway
│   ├── performance/             # Edge optimization
│   ├── privacy/                 # Data sovereignty framework
│   ├── reputation/              # Trust score engine
│   ├── services/                # Business logic services
│   ├── sybil/                   # Sybil attack defense
│   ├── trust-graph/             # Graph-based fraud detection
│   └── websocket/               # Real-time communication
├── db/
│   ├── migrations/               # Drizzle migrations
│   ├── schema.ts                # Database schema
│   ├── schema-credit.ts         # Credit facilities schema
│   └── client.ts                # DB client
└── tests/                        # Vitest test suite
```

---

## Feature Justifications

### 1. Trust-Based Reputation System (`src/lib/reputation/`)

**What it does**: Calculates a composite Ubuntu Score (0-100) from five weighted components:
- Reciprocity Index (25%) — ratio of help given vs. received
- Consistency Score (20%) — activity spread over 30-day windows
- Community Endorsements (20%) — peer attestations received
- Governance Participation (20%) — proposal and voting engagement
- Resource Sharing (15%) — value contributed to commons

**Why it matters**: The score replaces credit bureaus with community knowledge. A new member starts at 0 but can rapidly build trust through small contributions. The score gates access to credit facilities, governance rights, and village membership — all determined by demonstrated commitment, not static identity data.

**Authority Levels**: The system maps scores to five tiers (novice → archivist), each with escalating privileges from view-only to emergency constitutional powers.

### 2. Governance Constitution Engine (`src/lib/governance/`)

**What it does**: Machine-enforced governance rules via a versioned constitution. The `GovernanceRuleEngine` evaluates proposals against deterministic rules for:
- **Quorum** — minimum participation thresholds
- **Approval threshold** — percentage of yes votes required
- **Eligibility** — membership requirements for proposers
- **Timing** — minimum/maximum voting periods
- **Constraints** — supermajority for constitutional amendments

**Why it matters**: Human governance is slow, inconsistent, and susceptible to capture. This system makes governance outcomes predictable and auditable while preserving the collective decision-making spirit of Ubuntu.

**Key invariant**: All rules are enforced server-side. The UI cannot bypass them.

### 3. Immutable Ledger with Double-Entry Bookkeeping (`src/lib/ledger/`)

**What it does**: An append-only journal with cryptographic hash chains. Every transaction creates balanced debit/credit pairs. The Merkle tree enables proof-of-existence for any historical entry.

**Why it matters**: Community finance requires absolute transparency. The ledger ensures every contribution and withdrawal is traceable and verifiable. The hash chain makes historical tampering impossible without detection.

**Compliance**: The system enforces balance assertions before commit, integer minor units (no floating-point errors), and immutable entries.

### 4. Credit Facilities with Pool Health (`src/lib/services/credit-service.ts`)

**What it does**: A phased credit system (Formation → Microcredit → Scaling) where:
- **Phase 1**: Members contribute to a buffer; no loans until target reached
- **Phase 2**: Microcredit with Ubuntu Score-based limits
- **Phase 3**: Scaled lending with diversified risk

Pool health is a composite metric (buffer ratio, capital adequacy, default rate, liquidity, asset quality, profitability, growth) that gates new loans.

**Why it matters**: Traditional microfinance exploits the poor with opaque terms. Ubuntu Pools makes credit terms transparent, rates community-driven, and default consequences collective — creating natural incentives for mutual support.

### 5. Data Sovereignty Framework (`src/lib/privacy/sovereignty.ts`)

**What it does**: Implements the four fundamental data rights:
- **Right to Export** — full data portability
- **Right to Deletion** — complete erasure
- **Right to Portability** — machine-readable export
- **Right to Transparency** — clear processing records

Plus zero-knowledge proofs that verify membership/score without revealing identity.

**Why it matters**: In a trust-based system, members must share data to build reputation. But sharing shouldn't mean surrendering control. This framework gives members granular consent over what data is shared, with whom, and for how long.

### 6. Sybil Defense System (`src/lib/sybil/`)

**What it does**: Multi-layered defense against fake identities:
- **Human Verification** — biometric/liveness checks
- **Device Binding** — hardware attestation
- **Social Anchors** — trusted introducer network
- **Economic Activity** — contribution requirements
- **Diversity Scoring** — detects coordinated attacks
- **Time Trust** — age-weighted scoring
- **Growth Limits** — rate-limiting new membership
- **Village Shield** — collective threat detection

**Why it matters**: Open membership systems are vulnerable to Sybil attacks where one entity creates many fake identities to subvert voting or drain collective resources. These defenses make attack economically unviable.

### 7. Trust Graph & Fraud Detection (`src/lib/trust-graph/`)

**What it does**: Graph-based analysis of member relationships:
- **PageRank** — influence scoring
- **Cluster Detection** — identifies suspicious subgroups
- **Fraud Rings** — detects coordinated fraud patterns
- **Weight Calculator** — relationship strength metrics

**Why it matters**: Individual reputation scores can be gamed through colluding pairs. The trust graph detects patterns that single-metric systems miss.

### 8. Lindiwe AI — Autonomous Governance Matriarch (`src/lib/backbone/lindiwe.ts`)

**What it does**: An autonomous governance agent that:
- Monitors pool health, member scores, and system safety
- Triggers SHIELD/PROSPERITY/EMERGENCY modes
- Proposes credit terms and governance adjustments
- Provides natural-language insights via chat

**Why it matters**: Human governance can't monitor real-time system health. Lindiwe provides continuous vigilance, alerting the collective (via OpenClaw) when intervention is needed.

### 9. OpenClaw Integration (`src/lib/integrations/openclaw/`)

**What it does**: A command-and-control bridge that:
- Receives alerts from Lindiwe
- Sends WhatsApp/Signal notifications to the Founder
- Executes voice/text commands from the Founder
- Provides a "Live Canvas" dashboard

**Why it matters**: The platform needs human override capability. OpenClaw ensures the Founder always retains control while delegating day-to-day operations to autonomous systems.

### 10. Stitch Banking Integration (`src/lib/integrations/stitch/`)

**What it does**: Connects to South African banking infrastructure for:
- Payment initiation
- Account verification
- Transaction categorization
- Balance synchronization

**Why it matters**: Ubuntu Pools bridges collective finance with the formal banking system. Members can contribute from bank accounts and withdraw to them.

---

## Technical Decisions Explained

### Why Next.js 16 + React 19?

The App Router provides the ideal balance of server-side security (for governance rules) and client-side interactivity (for dashboards). Server Components by default reduce JavaScript payload while `"use client"` annotations make boundary management explicit.

### Why Drizzle ORM?

Drizzle provides type-safe SQL without the abstraction overhead of full ORMs. It's lean, fast, and SQL-first — appropriate for a system where financial integrity is paramount.

### Why WebSocket over HTTP Polling?

Real-time updates are essential for governance votes, pool health changes, and collective activity feeds. WebSocket provides the low-latency communication the platform requires.

### Why Zero-Knowledge Proofs?

The platform must verify membership and creditworthiness without collecting sensitive identity data. ZK proofs enable a member to prove "my Ubuntu Score > 70" without revealing their actual score or identity.

---

## Future Vision

### Phase 4: Cross-Village Federation

Enable villages to form federations, sharing surplus credit capacity and diversifying risk across geographic boundaries. This requires:
- Inter-village governance protocols
- Settlement layer between villages
- Reputation portability

### Phase 5: Tokenized Commons

Convert commons assets (land, equipment, livestock) into fractional ownership tokens. Members earn governance rights proportional to contribution, creating circular incentive structures.

### Phase 6: Autonomous Economic Zones

Partner with regulators to create special economic zones where Ubuntu Pools governance rules apply directly — enabling collective-owned enterprises with legal recognition.

### Phase 7: Global Ubuntu Network

Connect Ubuntu Pools instances across continents, creating a global network of interconnected villages. The trust graph becomes a web of villages, not just individuals.

---

## Getting Started

### Prerequisites

- Node.js 18+
- Bun (recommended) or npm/yarn
- PostgreSQL database (for production)

### Quick Start

```bash
# Install dependencies
bun install

# Configure environment
cp .env.local.example .env.local
# Edit .env.local with your DATABASE_URL

# Run development server
bun dev
```

Visit `http://localhost:3000` to see the platform.

### Run Tests

```bash
bun test              # All tests
bun test:watch        # Watch mode
bun test:coverage     # Coverage report
```

### Type Check & Lint

```bash
bun typecheck        # TypeScript validation
bun lint             # Code quality
```

---

## Project Structure

| Directory | Purpose |
|-----------|---------|
| `src/app/` | Next.js App Router pages and API routes |
| `src/components/` | React UI components organized by feature |
| `src/lib/` | Core business logic, services, and utilities |
| `src/db/` | Drizzle ORM schema and migrations |
| `src/tests/` | Vitest test suite |

---

## Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| Next.js | 16 | React framework with App Router |
| React | 19 | UI library |
| Tailwind CSS | 4 | Utility-first styling |
| Framer Motion | latest | Animation library |
| Drizzle ORM | latest | Type-safe database access |
| PostgreSQL | latest | Primary data store |
| Socket.io | latest | Real-time WebSocket communication |
| Zod | latest | Schema validation |
| Vitest | latest | Testing framework |

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/members` | GET/POST | Member management |
| `/api/villages` | GET/POST | Village operations |
| `/api/credit` | GET/POST | Credit facilities |
| `/api/governance` | GET/POST | Proposals & voting |
| `/api/ledger` | GET | Transaction history |
| `/api/reputation` | GET | Trust scores |
| `/api/sovereignty` | POST | Data rights |

---

## Contributing

This platform is designed for community ownership. To contribute:

1. Fork the repository
2. Create a feature branch
3. Run tests and typecheck
4. Submit a pull request

All contributors agree to the Governance Charter upon their first contribution.

---

## License

MIT
