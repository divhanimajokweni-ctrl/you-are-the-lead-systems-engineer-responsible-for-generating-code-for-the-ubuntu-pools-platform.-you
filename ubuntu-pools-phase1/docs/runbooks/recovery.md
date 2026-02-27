# Recovery Procedures

## Database Restore

### From Snapshot
1. Navigate to GitHub Actions → Restore Database Snapshot
2. Select snapshot date
3. Select target environment
4. Check "I understand this will overwrite existing data"
5. Click "Run workflow"
6. Wait for completion (~5-10 minutes)
7. Verify with: `docker compose exec postgres psql -U app -d ledger -c "SELECT COUNT(*) FROM events;"`

### Manual Restore
```bash
# Download snapshot from artifacts
# Decrypt with age
age -d -i key.txt -o backup.dump backup.tar.age

# Restore
docker compose exec -T postgres pg_restore -U app -d ledger -c backup.dump
```

## Backfill Procedures

If data needs to be corrected:
1. **Never modify history**: Append new events/entries to correct
2. **Reversal pattern**: Reverse erroneous transaction with explanation
3. **Compensating entries**: Add new entries to fix balances

Example:
```typescript
// Reverse erroneous credit
await reverseTransaction(actorId, txnId, "Incorrect amount - was $100, should be $50");

// Post corrected transaction
await postTransaction({
  actorId,
  description: "Corrected amount",
  entries: [
    { accountId: "assets:cash", amountCents: 5000n, type: "DEBIT" },
    { accountId: "revenue:sales", amountCents: 5000n, type: "CREDIT" }
  ]
});
```
