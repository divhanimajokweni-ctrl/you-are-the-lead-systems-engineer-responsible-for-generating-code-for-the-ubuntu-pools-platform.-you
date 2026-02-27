import { db } from "../db/drizzle.js";
import { ledgerEntries, transactions } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { postTransaction } from "./engine.js";

export async function reverseTransaction(actorId: string, transactionId: number, reason: string) {
  const entries = await db.select().from(ledgerEntries)
    .where(eq(ledgerEntries.transactionId, BigInt(transactionId)));

  if (entries.length === 0) throw new Error("Transaction not found");

  const reversing = entries.map(e => ({
    accountId: e.accountId,
    amountCents: BigInt(e.amountCents),
    type: e.entryType === "DEBIT" ? "CREDIT" as const : "DEBIT" as const
  }));

  return postTransaction({
    actorId,
    description: `Reversal of txn ${transactionId}: ${reason}`,
    entries: reversing
  });
}
