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

---

### Cloud Development (VS Code Online)

#### Option 1: GitHub Codespaces (Recommended)

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

#### Option 2: VS Code for the Web (No Setup)

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

#### Option 3: Gitpod

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

---

### Troubleshooting

| Issue | Solution |
|-------|----------|
| "Command not found: bun" | Run `curl -fsSL https://bun.sh/install \| bash` |
| Port 3000 in use | `lsof -i :3000` then kill process, or use `bun run dev --port 3001` |
| Dependencies missing | Run `bun install` |
| TypeScript errors | Run `bun run typecheck` to see errors |

### 5. Run Tests

```bash
# Run all tests
bun test

# Watch mode
bun test:watch

# With coverage
bun test:coverage
```

### 6. Type Checking & Linting

```bash
# Type check
bun typecheck

# Lint
bun lint
```

### 7. Database (Optional - for full functionality)

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

---

## OpenClaw Integration: The Executive Shadow

The Ubuntu Pools platform integrates with **OpenClaw** to provide real-time alerts and command-and-control capabilities for the Founder.

### System Architecture

| Component | Role |
|-----------|------|
| **Lindiwe AI** | Financial Matriarch - autonomous governance |
| **Stitch** | Financial Sensor - South African banking integration |
| **OpenClaw** | Executive Shadow - your personal command center |
| **Ubuntu Backbone** | Central nervous system connecting all components |

### How It Works

1. **Lindiwe** monitors the Ubuntu Backbone (safety buffer, member scores, pool health)
2. When Lindiwe triggers **Shield/Prosperity/Emergency** modes, the Backbone notifies **OpenClaw**
3. **OpenClaw** sends WhatsApp/Signal alerts to your personal device
4. You can issue commands back to the system via OpenClaw

### Production Setup

#### 1. Environment Variables

Add these to your `.env.local`:

```env
# OpenClaw Integration (Executive Shadow)
OPENCLAW_ENABLED=true
OPENCLAW_GATEWAY_URL=http://localhost:18789
OPENCLAW_API_KEY=your_openclaw_api_key
```

#### 2. Install OpenClaw (on your local machine)

```bash
# Install globally using Bun
bun add -g openclaw@latest

# Run the onboarding wizard
openclaw onboard --install-daemon

# Set up WhatsApp/Signal channel
openclaw channel add whatsapp
```

#### 3. Install the Ubuntu Monitor Skill

Copy the skill file to your OpenClaw workspace:

```bash
# Default location
cp openclaw-skills/ubuntu-monitor.ts ~/.openclaw/workspaces/default/skills/
```

#### 4. Verify Installation

```bash
# Check if Gateway is alive
openclaw doctor

# List installed skills
openclaw skill list | grep ubuntu-monitor
```

### OpenClaw Commands

#### Give OpenClaw its directive:

> "OpenClaw, load the ubuntu-monitor skill. You are now synced with Lindiwe. If Lindiwe triggers SHIELD mode, I want a WhatsApp notification immediately. Once a day at 18:00, use your 'Live Canvas' to show me a summary of the total Village $S_u$ growth. If you detect a Stitch Shield fraud alert, bypass Lindiwe and call me directly."

#### Useful Commands:

```bash
# Test the integration
openclaw message send --message "TEST: Lindiwe signaling Shield Mode" --thinking low

# Check Gateway port (should show listening on 18789)
lsof -i :18789

# Get system status via OpenClaw
openclaw message send --message "ubuntu-monitor getSystemStatus"
```

### Heartbeat Monitoring

The system includes automatic health checks. To enable periodic heartbeats:

```typescript
import { openClawGateway } from '@/lib/openclaw/gateway';

// Call in your server cron job
await openClawGateway.performSystemHandshake('online', 'ready');
```

### Troubleshooting

| Issue | Solution |
|-------|----------|
| Gateway unreachable | Ensure `OPENCLAW_ENABLED=true` and port 18789 is open |
| No messages received | Check DM pairing is approved in WhatsApp |
| Skill not loaded | Copy skill file to `~/.openclaw/workspaces/default/skills/` |
| TypeScript errors in skill | Skill runs in OpenClaw's environment, not this project |

---

## License

MIT
