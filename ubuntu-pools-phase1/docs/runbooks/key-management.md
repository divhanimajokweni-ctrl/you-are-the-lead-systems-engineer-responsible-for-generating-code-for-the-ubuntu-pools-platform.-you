# Key Management SOP

## Generating KEK

```bash
openssl rand -hex 32
```

Store the result in a secure secret manager (GitHub Secrets, HashiCorp Vault, etc.).

## Rotating KEK

1. Generate new KEK: `openssl rand -hex 32`
2. Store as `NEW_KEK_HEX` in secrets
3. Trigger `kek-rotation` workflow in GitHub Actions
4. After successful rotation, update `KEK_HEX` secret to new value

## Emergency Key Revocation

If KEK is compromised:
1. Trigger KEK rotation immediately
2. Rotate all DEKs using the new KEK
3. Consider database snapshot restoration to a known-good state
4. Audit logs for any unauthorized access

## Crypto-Shredding (GDPR RTBF)

To delete an actor's data:
1. Run `shredActorKeys(actorId)` - deletes all DEKs for that actor
2. Delete any related events/ledger entries
3. This makes encrypted sensitive data unrecoverable
