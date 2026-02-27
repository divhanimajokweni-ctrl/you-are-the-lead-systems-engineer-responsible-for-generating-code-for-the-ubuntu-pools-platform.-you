# Secrets & Environments

This document outlines the secrets strategy for Ubuntu Pools Phase 1.

## Environments

| Environment | Branch | Purpose |
|-------------|--------|---------|
| staging | develop | Testing before production |
| production | main, v* tags | Live environment |

## GitHub Environments Setup

1. Go to GitHub → Repository Settings → Environments
2. Create `staging` and `production` environments
3. Configure required reviewers for production deployments
4. Set branch restrictions (develop → staging, main → production)

## Required Secrets

### DATABASE_URL
Postgres connection string for the environment.
```
postgres://user:password@host:5432/database
```

### KEK_HEX
32-byte (256-bit) Key Encryption Key as 64 hex characters.
```bash
openssl rand -hex 32
```

### AGE_PUBLIC_KEY / AGE_PRIVATE_KEY
Age keys for encrypting/decrypting database snapshots.
```bash
age-keygen
```

### GITHUB_TOKEN
Automatically provided. Use for GHCR push.

### SNAPSHOT_RETENTION_DAYS
Retention policy for snapshot artifacts (default: 7).

## Rotation Secrets (KEK Rotation Only)

### OLD_KEK_HEX
Current KEK before rotation (for decrypting DEKs).

### NEW_KEK_HEX
New KEK after rotation (for re-encrypting DEKs).

## POPIA/GDPR Notes

- Keep PII out of events (enforced by Zod schema)
- `identities` table is mutable and can be cleared
- Snapshots exclude `identities` table or encrypt sensitive data
- Crypto-shredding: Deleting DEKs makes encrypted data unrecoverable (GDPR RTBF)
