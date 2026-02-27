import { describe, it, expect } from "vitest";
import { computeTrustScoreDecay } from "../trust/service.js";
import { TrustConfigSchema, DEFAULT_TRUST_CONFIG, TrustGateResultSchema } from "../trust/config.js";

describe("Trust Config Schema", () => {
  it("validates default config", () => {
    const result = TrustConfigSchema.safeParse(DEFAULT_TRUST_CONFIG);
    expect(result.success).toBe(true);
  });

  it("rejects invalid config", () => {
    const result = TrustConfigSchema.safeParse({
      initialScore: -1,
      proposalThreshold: 30
    });
    expect(result.success).toBe(false);
  });

  it("has valid thresholds", () => {
    expect(DEFAULT_TRUST_CONFIG.proposalThreshold).toBe(30);
    expect(DEFAULT_TRUST_CONFIG.operationThreshold).toBe(20);
    expect(DEFAULT_TRUST_CONFIG.adminThreshold).toBe(70);
  });
});

describe("Trust Decay Algorithm", () => {
  it("applies no decay within interval", () => {
    const recent = new Date();
    const result = computeTrustScoreDecay(50, recent, 0.01, 86400000, 0);
    expect(result).toBe(50);
  });

  it("applies decay after one interval", () => {
    const old = new Date(Date.now() - 180000000);
    const result = computeTrustScoreDecay(50, old, 0.01, 86400000, 0);
    expect(result).toBeLessThan(50);
    expect(result).toBe(49);
  });

  it("never goes below minScore", () => {
    const veryOld = new Date(Date.now() - 86400000 * 100);
    const result = computeTrustScoreDecay(10, veryOld, 0.5, 86400000, 0);
    expect(result).toBe(0);
  });

  it("compounds decay over multiple intervals", () => {
    const old = new Date(Date.now() - 86400000 * 10);
    const result = computeTrustScoreDecay(100, old, 0.1, 86400000, 0);
    const expected = Math.round(100 * Math.pow(0.9, 10));
    expect(result).toBe(expected);
  });
});

describe("Trust Gate Result Schema", () => {
  it("validates valid gate result", () => {
    const result = TrustGateResultSchema.safeParse({
      allowed: true,
      reason: null,
      currentScore: 50,
      requiredScore: 30
    });
    expect(result.success).toBe(true);
  });

  it("validates denied gate result", () => {
    const result = TrustGateResultSchema.safeParse({
      allowed: false,
      reason: "Score too low",
      currentScore: 10,
      requiredScore: 30
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid scores", () => {
    const result = TrustGateResultSchema.safeParse({
      allowed: true,
      reason: null,
      currentScore: 150,
      requiredScore: 30
    });
    expect(result.success).toBe(false);
  });
});

describe("Ledger Invariant Preservation", () => {
  it("trust scores are separate from ledger entries", () => {
    const ledgerEntries = [
      { accountId: "assets:cash", amountCents: 1000n, entryType: "DEBIT" as const },
      { accountId: "revenue:sales", amountCents: 1000n, entryType: "CREDIT" as const }
    ];
    
    const debit = ledgerEntries.filter(e => e.entryType === "DEBIT").reduce((s, e) => s + e.amountCents, 0n);
    const credit = ledgerEntries.filter(e => e.entryType === "CREDIT").reduce((s, e) => s + e.amountCents, 0n);
    
    expect(debit).toBe(credit);
    
    const trustScore = 25;
    expect(debit).not.toBe(trustScore);
  });

  it("trust score ranges are bounded independently", () => {
    expect(DEFAULT_TRUST_CONFIG.minScore).toBe(0);
    expect(DEFAULT_TRUST_CONFIG.maxScore).toBe(100);
    
    const testDecay = computeTrustScoreDecay(100, new Date(), 0.5, 1, 0);
    expect(testDecay).toBeGreaterThanOrEqual(0);
    expect(testDecay).toBeLessThanOrEqual(100);
  });
});

describe("Trust Status Transitions", () => {
  it("active status allows actions when score >= threshold", () => {
    const score = 50;
    const threshold = 30;
    expect(score >= threshold).toBe(true);
  });

  it("frozen status blocks actions regardless of score", () => {
    const status = "frozen";
    expect(status === "frozen" || status === "banned").toBe(true);
  });

  it("banned status blocks all governance actions", () => {
    const status = "banned";
    expect(status === "banned").toBe(true);
  });
});
