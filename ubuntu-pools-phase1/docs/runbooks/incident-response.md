# Incident Response Runbook

## Data Integrity Issues

### Detection
- Hash chain validation fails
- Balance computation returns unexpected values
- Transaction reversal creates unbalanced entries

### Response
1. **Stop writes**: Disable event/transaction posting
2. **Snapshot**: Create encrypted database snapshot
3. **Validate**: Run hash chain verification script
4. **Restore**: If compromised, restore from last known good snapshot
5. **Audit**: Review logs for unauthorized access

## Service Outage

### Detection
- Health check endpoint fails
- HTTP 5xx errors increase
- Docker container crashes

### Response
1. **Check logs**: `docker compose logs -f`
2. **Restart services**: `docker compose restart`
3. **Database health**: `docker compose exec postgres pg_isready`
4. **Rollback**: Revert to previous Docker image if needed

## Unauthorized Access

### Detection
- Unusual API patterns
- Authentication failures
- Secret exposure alerts

### Response
1. **Isolate**: Disable API access
2. **Rotate**: All secrets and keys
3. **Audit**: Review access logs
4. **Report**: Document incident
5. **Remediate**: Fix vulnerability
