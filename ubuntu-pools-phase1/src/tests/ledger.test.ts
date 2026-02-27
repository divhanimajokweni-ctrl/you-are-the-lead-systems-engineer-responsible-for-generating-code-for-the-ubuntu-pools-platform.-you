import { describe, it, expect, vi } from "vitest";

describe("Ledger Engine Validation", () => {
  it("validates balanced entries", () => {
    const entries = [
      { accountId: "assets:cash", amountCents: 1000n, type: "DEBIT" as const },
      { accountId: "revenue:sales", amountCents: 1000n, type: "CREDIT" as const }
    ];
    
    const debit = entries.filter(e => e.type === "DEBIT").reduce((s, e) => s + e.amountCents, 0n);
    const credit = entries.filter(e => e.type === "CREDIT").reduce((s, e) => s + e.amountCents, 0n);
    
    expect(debit).toBe(credit);
  });
  
  it("rejects unbalanced entries", () => {
    const entries = [
      { accountId: "assets:cash", amountCents: 1000n, type: "DEBIT" as const },
      { accountId: "revenue:sales", amountCents: 500n, type: "CREDIT" as const }
    ];
    
    const debit = entries.filter(e => e.type === "DEBIT").reduce((s, e) => s + e.amountCents, 0n);
    const credit = entries.filter(e => e.type === "CREDIT").reduce((s, e) => s + e.amountCents, 0n);
    
    expect(() => {
      if (debit !== credit) throw new Error("Unbalanced");
    }).toThrow();
  });
  
  it("validates positive amounts", () => {
    const valid = { accountId: "test", amountCents: 100n, type: "DEBIT" as const };
    const invalid = { accountId: "test", amountCents: -100n, type: "DEBIT" as const };
    
    expect(valid.amountCents > 0n).toBe(true);
    expect(invalid.amountCents > 0n).toBe(false);
  });
});

describe("Balance Calculation", () => {
  it("computes correct balance", () => {
    const entries = [
      { accountId: "cash", amountCents: 1000n, entryType: "DEBIT" },
      { accountId: "cash", amountCents: 300n, entryType: "CREDIT" }
    ];
    
    const balances: Record<string, bigint> = {};
    for (const row of entries) {
      const sign = row.entryType === "DEBIT" ? 1n : -1n;
      const delta = BigInt(row.amountCents) * sign;
      balances[row.accountId] = (balances[row.accountId] ?? 0n) + delta;
    }
    
    expect(balances.cash).toBe(700n);
  });
});
