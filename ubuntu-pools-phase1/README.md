# Ubuntu Pools Phase 1 - Ledger & Event System

An immutable, privacy-by-design accounting ledger with crypto-shredding capabilities.

## Architecture

### Event System
- **Append-only**: Events can never be updated or deleted (enforced via PostgreSQL triggers)
- **Hash-chained**: Each event references the previous event's hash, creating a tamper-evident chain
- **PII-free by default**: Event payloads validated via Zod to exclude emails and personal data
- **Optional encryption**: Sensitive payloads encrypted with AES-256-GCM using per-actor DEKs

### Ledger
- **Double-entry bookkeeping**: Every transaction has balanced debits = credits
- **Immutable**: No UPDATEs or DELETEs on transactions or entries
- **Balance computation**: Full history replay (no snapshots)

### Crypto-Shredding (GDPR RTBF)
- **Per-actor DEKs**: Each actor has their own Data Encryption Key
- **KEK-wrapped DEKs**: DEKs are encrypted with a Key Encryption Key
- **Deletion = crypto-shredding**: Deleting the DEK makes encrypted data unrecoverable

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /events | Record an event |
| POST | /transactions | Post a double-entry transaction |
| POST | /transactions/:id/reverse | Reverse a transaction |
| GET | /balances | Compute account balances |
| GET | /health | Health check |

## Running Locally

```bash
# Install dependencies
bun install

# Run database migrations
bun run migrate

# Start development server
bun run dev
```

## Docker

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| DATABASE_URL | PostgreSQL connection string |
| KEK_HEX | 64-char hex key for DEK encryption |
| PORT | HTTP server port (default: 3000) |

## Security

- Events are immutable (triggers prevent UPDATE/DELETE)
- Transactions require balanced debits/credits
- Encryption keys are never exposed in plaintext
- Database snapshots exclude identity tables
