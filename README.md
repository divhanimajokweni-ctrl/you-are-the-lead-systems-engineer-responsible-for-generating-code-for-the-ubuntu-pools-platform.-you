# Ubuntu Pools Platform

A Digital Ubuntu Platform — "I am because we are" — A collective prosperity system with trust-based governance, immutable ledger, and community-driven impact.

## Tech Stack

- **Framework**: Next.js 16 (React 19)
- **Styling**: Tailwind CSS 4
- **Animation**: Framer Motion
- **Database**: PostgreSQL with Drizzle ORM
- **Real-time**: WebSocket (Socket.io)
- **Validation**: Zod
- **Testing**: Vitest

## Prerequisites

- Node.js 18+
- Bun (recommended) or npm/yarn
- PostgreSQL database (for production)

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

### 4. Run Tests

```bash
# Run all tests
bun test

# Watch mode
bun test:watch

# With coverage
bun test:coverage
```

### 5. Type Checking & Linting

```bash
# Type check
bun typecheck

# Lint
bun lint
```

### 6. Database (Optional - for full functionality)

```bash
# Generate Drizzle client
bun db:generate

# Run migrations
bun db:migrate

# Open Drizzle Studio
bun db:studio
```

## Build for Production

```bash
bun build
```

This creates an optimized production build in the `.next` directory.

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

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── page.tsx           # Home page
│   └── globals.css       # Global styles
├── components/
│   ├── home/              # Home screen components
│   ├── village/          # Village/collective components
│   ├── ledger/            # Ledger components
│   ├── privacy/           # Privacy components
│   └── dashboard/         # Dashboard components
├── lib/
│   ├── events/            # Event handling
│   ├── governance/        # Governance logic
│   ├── ledger/            # Ledger engine
│   ├── privacy/           # Privacy framework
│   ├── reputation/        # Trust/reputation
│   ├── services/          # Business logic
│   └── websocket/         # Real-time
└── db/
    ├── migrations/         # SQL migrations
    ├── schema.ts           # Drizzle schema
    └── client.ts           # DB client
```

## Features

- **The Pulse**: Real-time global impact map
- **Tribal Impact Dashboard**: Personal contribution tracking
- **Immutable Ledger**: Append-only event stream with hash chain
- **Trust Circle**: Peer-attested reputation system
- **Commons Vault**: Shared community resources
- **Prosperity Tiers**: Family Wealth Reserve, SME Bulk-Buying Circles
- **FAQ & AI Assistant**: Lindiwe chatbot for support

## License

MIT
