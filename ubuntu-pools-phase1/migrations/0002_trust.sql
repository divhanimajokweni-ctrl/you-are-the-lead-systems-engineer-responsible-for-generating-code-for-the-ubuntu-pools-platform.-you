-- Migration 0002: Trust System (Phase 4)
-- Trust scores, decay, penalties, and appeals

-- Trust status enum
CREATE TYPE trust_status AS ENUM ('active', 'frozen', 'banned');
CREATE TYPE infraction_type AS ENUM ('failed_proposal', 'governance_abuse', 'spam', 'rule_violation', 'appeal_rejected');
CREATE TYPE appeal_status AS ENUM ('pending', 'approved', 'rejected');

-- Trust scores table
CREATE TABLE trust_scores (
  actor_id UUID PRIMARY KEY,
  score BIGINT NOT NULL CHECK (score >= 0 AND score <= 100),
  status trust_status NOT NULL DEFAULT 'active',
  last_decay_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Infractions table
CREATE TABLE infractions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL,
  type infraction_type NOT NULL,
  amount BIGINT NOT NULL,
  reason TEXT NOT NULL,
  related_event_id BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Appeals table
CREATE TABLE appeals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL,
  infraction_id UUID NOT NULL REFERENCES infractions(id),
  status appeal_status NOT NULL DEFAULT 'pending',
  reason TEXT NOT NULL,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trust scores: No DELETEs allowed (soft delete via status)
CREATE OR REPLACE FUNCTION prevent_trust_delete()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Trust scores are immutable: no DELETE allowed';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_trust_scores_no_delete
BEFORE DELETE ON trust_scores
FOR EACH ROW EXEXECUTE FUNCTION prevent_trust_delete();

-- Infractions: Immutable record
CREATE OR REPLACE FUNCTION prevent_infractions_update_delete()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Infractions are immutable: no UPDATE or DELETE allowed';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_infractions_no_update_delete
BEFORE UPDATE OR DELETE ON infractions
FOR EACH ROW EXECUTE FUNCTION prevent_infractions_update_delete();

-- Appeals: Status changes allowed, no hard delete
CREATE OR REPLACE FUNCTION prevent_appeals_delete()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Appeals are immutable: no DELETE allowed';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_appeals_no_delete
BEFORE DELETE ON appeals
FOR EACH ROW EXECUTE FUNCTION prevent_appeals_delete();

-- Indexes
CREATE INDEX idx_trust_scores_status ON trust_scores(status);
CREATE INDEX idx_infractions_actor ON infractions(actor_id);
CREATE INDEX idx_infractions_type ON infractions(type);
CREATE INDEX idx_appeals_actor ON appeals(actor_id);
CREATE INDEX idx_appeals_infraction ON appeals(infraction_id);
CREATE INDEX idx_appeals_status ON appeals(status);
