# Ubuntu Pools — Operations & Deployment Guide

> This guide covers deployment, scaling, and operations for the Ubuntu Pools platform. For feature documentation, see [README.md](./README.md).

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development](#local-development)
3. [Cloud Development Environments](#cloud-development-environments)
4. [Testing](#testing)
5. [Type Checking & Linting](#type-checking--linting)
6. [Database Setup](#database-setup)
7. [Production Build](#production-build)
8. [Deployment](#deployment)
9. [Scaling Considerations](#scaling-considerations)
10. [Troubleshooting](#troubleshooting)
11. [Future Vision](#future-vision)

---

## Prerequisites

- **Node.js** 18+ 
- **Bun** (recommended) or npm/yarn
- **PostgreSQL** database (for production features)

---

## Local Development

### 1. Install Dependencies

```bash
# Using Bun (recommended)
bun install

# Or using npm
npm install
```

### 2. Configure Environment

Create a `.env.local` file in the root directory:

```env
# Database (required for production features)
DATABASE_URL=postgresql://user:password@localhost:5432/ubuntu_pools

# Optional: For production, add your deployment URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run Development Server

```bash
bun dev
```

The app will be available at `http://localhost:3000`

---

## Cloud Development Environments

### Option 1: GitHub Codespaces (Recommended)

1. Go to your repository on GitHub
2. Click the green **Code** button
3. Select the **Codespaces** tab
4. Click **Create codespace on main**
5. Wait for the container to build (~2-3 minutes)
6. In the terminal, run:

```bash
bun run dev
```

7. Click the **Ports** tab in the bottom panel
8. Click the localhost:3000 link to preview

### Option 2: VS Code for the Web (No Setup)

1. Go to [vscode.dev](https://vscode.dev)
2. Click **"Open Remote"** (bottom-left corner)
3. Select **"Open GitHub Repository"**
4. Paste your repo URL
5. In the terminal:

```bash
bun install
bun run dev
```

6. Click **Ports** → **localhost:3000** → **Open in Browser**

### Option 3: Gitpod

1. Open:
```
https://gitpod.io/#https://github.com/divhanimajokweni-ctrl/you-are-the-lead-systems-engineer-responsible-for-generating-code-for-the-ubuntu-pools-platform.-you
```

2. Sign in with GitHub
3. In terminal:

```bash
bun install
bun run dev
```

4. Click **Open Browser** on port 3000

---

## Testing

```bash
# Run all tests
bun test

# Watch mode
bun test:watch

# With coverage
bun test:coverage
```

---

## Type Checking & Linting

```bash
# Type check
bun typecheck

# Lint
bun lint
```

---

## Database (Optional - for full functionality)

```bash
# Generate Drizzle client
bun db:generate

# Run migrations
bun db:migrate

# Open Drizzle Studio
bun db:studio
```

---

## Production Build

```bash
bun build
```

This creates an optimized production build in the `.next` directory.

---

## Deployment

### Recommended Platform: Vercel

Vercel is the best platform for Next.js applications with zero configuration.

#### Option 1: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

#### Option 2: Deploy via GitHub

1. Push your code to a GitHub repository
2. Go to [vercel.com](https://vercel.com)
3. Click "Add New Project" and import your repository
4. Vercel will automatically detect Next.js and configure the build
5. Add environment variables in the Vercel dashboard if needed
6. Click "Deploy"

#### Environment Variables on Vercel

Add these in your project settings:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |

### Alternative Platforms

#### Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and init
railway login
railway init

# Add PostgreSQL
railway add postgresql

# Deploy
railway up
```

#### Render

1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set build command: `bun install && bun build`
4. Set start command: `bun start`
5. Add `DATABASE_URL` environment variable

#### Docker

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package.json bun.lockb ./
RUN npm install -g bun && bun install --frozen-lockfile
COPY . .
RUN bun build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

Build and run:
```bash
docker build -t ubuntu-pools .
docker run -p 3000:3000 ubuntu-pools
```

---

## Scaling Considerations

### Horizontal Scaling

The Ubuntu Pools platform is designed for horizontal scaling:

| Component | Scaling Strategy |
|-----------|-------------------|
| **Next.js App** | Deploy multiple instances behind a load balancer (Vercel handles this automatically) |
| **PostgreSQL** | Use read replicas for query-heavy workloads; connection pooling (PgBouncer) for high concurrency |
| **WebSocket** | Use Socket.io with Redis adapter for multi-instance deployments |
| **Redis** | For session storage, caching, and real-time pub/sub |

### Recommended Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CDN (Vercel/CloudFlare)               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Load Balancer (Vercel/ALB/CloudFlare)         │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        ┌──────────┐    ┌──────────┐    ┌──────────┐
        │ Next.js  │    │ Next.js  │    │ Next.js  │
        │ Instance │    │ Instance │    │ Instance │
        └──────────┘    └──────────┘    └──────────┘
              │               │               │
              └───────────────┼───────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        ┌──────────┐    ┌──────────┐    ┌──────────┐
        │  Redis   │    │PostgreSQL│    │   S3     │
        │ (Cache)  │    │  (Write) │    │ (Media)  │
        └──────────┘    └──────────┘    └──────────┘
```

### Performance Optimization

1. **Edge Caching** — Static assets served from edge (automatic with Vercel)
2. **Image Optimization** — Use `next/image` for automatic optimization
3. **Bundle Analysis** — Run `bun build && bun analyze` to identify large bundles
4. **Database Indexing** — Ensure indexes on frequently queried columns (member IDs, timestamps)
5. **Query Optimization** — Use Drizzle's query optimization; avoid N+1 queries

### Capacity Recommendations

| Scale | Members | Monthly Transactions | Recommended Stack |
|-------|---------|---------------------|-------------------|
| Village | 1-500 | <10,000 | Single PostgreSQL, no Redis |
| District | 500-10,000 | 10,000-100,000 | PostgreSQL + Redis |
| Region | 10,000-100,000 | 100,000-1,000,000 | PostgreSQL cluster + Redis cluster |
| Global | 100,000+ | 1,000,000+ | Multi-region PostgreSQL + Redis |

### Security Scaling

- **Rate Limiting** — Implement at load balancer level
- **DDoS Protection** — CloudFlare or Vercel built-in
- **API Throttling** — Per-member rate limits in application layer
- **WebSocket Security** — Authenticate connections; implement heartbeat

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Command not found: bun" | Run `curl -fsSL https://bun.sh/install \| bash` |
| Port 3000 in use | `lsof -i :3000` then kill process, or use `bun run dev --port 3001` |
| Dependencies missing | Run `bun install` |
| TypeScript errors | Run `bun run typecheck` to see errors |
| Database connection failed | Verify `DATABASE_URL` in `.env.local` |
| WebSocket connection failed | Ensure port 3001 (or configured port) is accessible |

---

## Future Vision

### Phase 4: Cross-Village Federation

Enable villages to form federations, sharing surplus credit capacity and diversifying risk across geographic boundaries.

**Required Infrastructure:**

| Component | Description |
|-----------|-------------|
| **Inter-Village Governance Protocols** | Federated voting, cross-village proposal ratification, dispute resolution |
| **Settlement Layer** | Atomic swaps between village currencies, real-time gross settlement (RTGS) between pools |
| **Reputation Portability** | Ubuntu Score export/import between villages; federation-wide identity namespace |

**Technical Requirements:**
- Federation-level ledger for inter-village transactions
- Byzantine fault-tolerant consensus for settlement disputes
- Zero-knowledge proofs for cross-village credit verification

**Recommendations:**
- Start with 2-3 pilot villages in same jurisdiction
- Implement tiered federation (village → district → region → global)
- Use hash time-locked contracts (HTLCs) for trustless settlement

---

### Phase 5: Tokenized Commons

Convert commons assets (land, equipment, livestock) into fractional ownership tokens.

**Asset Classes:**

| Asset Type | Tokenization Strategy |
|------------|----------------------|
| **Land** | ERC-1155 tokens representing hectares/fractions; governance voting rights |
| **Equipment** | Usage tokens; maintenance cost sharing |
| **Livestock** | Individual animal tokens; yield/produce sharing |
| **Intellectual Property** | License tokens; royalty distribution |

**Governance Integration:**
- Members earn governance rights proportional to contribution (token holdings + activity)
- Circular incentive: More contribution → More tokens → More governance power → More influence over commons allocation

**Recommendations:**
- Start with non-controversial assets (community tools, meeting halls)
- Implement gradual tokenization (test with 10% of assets first)
- Legal structure: Cooperative or Benefit Corporation to hold assets

---

### Phase 6: Autonomous Economic Zones

Partner with regulators to create special economic zones where Ubuntu Pools governance rules apply directly.

**Partnership Model:**

```
┌─────────────────────────────────────────────────────────────┐
│                    Regulatory Framework                      │
│         (Central Bank / Financial Services Authority)       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Ubuntu Pools SEZ License                     │
│    (Legal entity with custom regulatory treatment)          │
└─────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
   │  Collective │    │  Collective │    │  Collective │
   │   Enterprise │    │   Enterprise │    │   Enterprise │
   │    #1       │    │    #2       │    │    #3       │
   └─────────────┘    └─────────────┘    └─────────────┘
```

**Benefits:**
- Legal recognition of collective ownership
- Preferential tax treatment for pooled resources
- Regulatory sandbox for innovative financial products
- Streamlined compliance for cross-border settlements

**Recommendations:**
- Begin with jurisdictions known for fintech innovation (Kenya, Singapore, UAE, Estonia)
- Engage legal counsel for entity structure (LLC, cooperative, foundation)
- Build relationships with central bank innovation hubs

---

### Phase 7: Global Ubuntu Network

Connect Ubuntu Pools instances across continents, creating a global network of interconnected villages.

**Network Topology:**

```
                        ┌─────────────────┐
                        │  Global Ubuntu   │
                        │    Registry      │
                        │  (Name spacing,  │
                        │   Root of Trust) │
                        └────────┬────────┘
                                 │
      ┌──────────────────────────┼──────────────────────────┐
      │                          │                          │
      ▼                          ▼                          ▼
┌─────────────┐          ┌─────────────┐          ┌─────────────┐
│   African    │◄────────►│   Asian     │◄────────►│   European  │
│   Federation│          │   Federation│          │   Federation│
└─────────────┘          └─────────────┘          └─────────────┘
      │                          │                          │
      ▼                          ▼                          ▼
┌─────────────┐          ┌─────────────┐          ┌─────────────┐
│  Village    │          │  Village    │          │  Village    │
│  Cluster    │          │  Cluster    │          │  Cluster    │
└─────────────┘          └─────────────┘          └─────────────┘
```

**Key Capabilities:**
- **Federated Identity** — Cross-instance member verification
- **Trust Routing** — Trust graph spans instances
- **Currency Bridge** — Convert between village/federation currencies
- **Global Reputation** — Aggregate Ubuntu Score across network

**Trust Graph Evolution:**
- Phase 1-3: Trust graph = relationships between individuals
- Phase 4-7: Trust graph = relationships between individuals AND villages AND federations
- Meta-reputation: Villages earn collective trust scores based on member outcomes

**Recommendations:**
- Establish inter-federation governance before technical integration
- Pilot with diaspora communities (remittance corridors)
- Implement gradual trust (high-value transactions require established relationships)

---

## Long-Term Architectural Considerations

### Decentralization Roadmap

| Phase | Centralization Level | Trust Model |
|-------|---------------------|-------------|
| 1-3 | Centralized server | Single instance, single operator |
| 4 | Federated | Multiple instances, consortium operators |
| 5 | Distributed | Multiple operators, smart contract governance |
| 6-7 | Decentralized | Community-run nodes, open protocol |

### Governance Evolution

As the network scales, governance must evolve:

1. **Village Level** (current) — Direct democracy, all members vote
2. **Federation Level** — Delegate democracy, elected representatives
3. **Global Level** — Liquid democracy, dynamic delegation based on expertise

### Economic Model Sustainability

Long-term sustainability requires:

- **Transaction Fees** — Small fee on credit transactions (0.1-0.5%)
- **Membership Dues** — Annual contribution based on income tier
- **Asset Management** — Tokenized commons generate yield
- **Grants** — Partner with foundations supporting financial inclusion

---

## Additional Resources

- [README.md](./README.md) — Feature documentation and codebase overview
- [Tech Stack](./README.md#technical-decisions-explained) — Architecture decisions
- [API Endpoints](./README.md#api-endpoints) — REST API reference
- [Contributing](./README.md#contributing) — Contribution guidelines

---

## License

MIT
