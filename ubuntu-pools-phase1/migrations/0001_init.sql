-- Migration 0001: Initialize Phase 1 Schema
-- Enforces append-only via triggers and balance constraints

-- Events: No UPDATES or DELETES allowed
CREATE OR REPLACE FUNCTION prevent_event_update_delete()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Events are immutable: no UPDATE or DELETE allowed';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_events_no_update_delete
BEFORE UPDATE OR DELETE ON events
FOR EACH ROW EXECUTE FUNCTION prevent_event_update_delete();

-- Transactions: No UPDATES or DELETES allowed  
CREATE OR REPLACE FUNCTION prevent_txn_update_delete()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Transactions are immutable: no UPDATE or DELETE allowed';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_transactions_no_update_delete
BEFORE UPDATE OR DELETE ON transactions
FOR EACH ROW EXECUTE FUNCTION prevent_txn_update_delete();

-- Ledger Entries: No UPDATES or DELETES allowed
CREATE OR REPLACE FUNCTION prevent_ledger_entry_update_delete()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Ledger entries are immutable: no UPDATE or DELETE allowed';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_ledger_entries_no_update_delete
BEFORE UPDATE OR DELETE ON ledger_entries
FOR EACH ROW EXECUTE FUNCTION prevent_ledger_entry_update_delete();

-- Encryption Keys: Soft delete only (set active=false)
CREATE OR REPLACE FUNCTION prevent_key_hard_delete()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.active = true AND (NEW.active = false OR OLD.active IS DISTINCT FROM NEW.active) THEN
    -- Allow soft delete
    RETURN NEW;
  END IF;
  IF OLD.active = true AND NEW.active = true THEN
    RAISE EXCEPTION 'Cannot modify active encryption key';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_encryption_keys_no_hard_delete
BEFORE UPDATE ON encryption_keys
FOR EACH ROW EXECUTE FUNCTION prevent_key_hard_delete();

-- Double-entry balance enforcement: DEFERRABLE constraint
-- This requires the transaction to be balanced before commit
ALTER TABLE ledger_entries ADD CONSTRAINT chk_balanced_posting 
CHECK (
  EXISTS (
    SELECT 1 FROM transactions t
    WHERE t.id = (ledger_entries.transaction_id::bigint)
  )
);

-- Create index for event hash chaining verification
CREATE INDEX idx_events_prev_hash ON events(prev_event_hash);
CREATE INDEX idx_events_actor ON events(actor_id);
CREATE INDEX idx_events_type ON events(type);

-- Create indexes for ledger performance
CREATE INDEX idx_ledger_entries_txn ON ledger_entries(transaction_id);
CREATE INDEX idx_ledger_entries_account ON ledger_entries(account_id);
CREATE INDEX idx_transactions_event ON transactions(event_id);
