import { db } from "../db/drizzle.js";
import { ledgerEntries } from "../db/schema.js";

export async function computeBalances(): Promise<Record<string, bigint>> {
  const rows = await db.select().from(ledgerEntries);
  const balances: Record<string, bigint> = {};
  for (const row of rows) {
    const sign = row.entryType === "DEBIT" ? 1n : -1n;
    const delta = BigInt(row.amountCents) * sign;
    balances[row.accountId] = (balances[row.accountId] ?? 0n) + delta;
  }
  return balances;
}
