import { db } from "../db/drizzle.js";
import { ledgerEntries, transactions } from "../db/schema.js";
import { recordEvent } from "../events/dispatcher.js";

export type PostingEntry = Readonly<{
  readonly accountId: string;
  readonly amountCents: bigint;
  readonly type: "DEBIT" | "CREDIT";
}>;

function validatePostingEntries(entries: ReadonlyArray<PostingEntry>): void {
  for (const e of entries) {
    if (e.amountCents <= 0n) throw new Error("amountCents must be positive");
    if (e.type !== "DEBIT" && e.type !== "CREDIT") throw new Error("Invalid entry type");
  }
  const debit = entries.filter(e => e.type === "DEBIT").reduce((s, e) => s + e.amountCents, 0n);
  const credit = entries.filter(e => e.type === "CREDIT").reduce((s, e) => s + e.amountCents, 0n);
  if (debit !== credit) throw new Error("Unbalanced posting (debits != credits)");
}

export async function postTransaction(input: Readonly<{
  readonly actorId: string;
  readonly description: string;
  readonly entries: ReadonlyArray<PostingEntry>;
}>) {
  validatePostingEntries(input.entries);

  const event = await recordEvent({
    actorId: input.actorId,
    type: "ledger.transaction.posted",
    payload: {
      description: input.description,
      entries: input.entries
    },
    metadata: {
      purpose: "ContractualNecessity",
      consentVersion: "v1.0.0"
    }
  });

  const [txn] = await db.insert(transactions).values({
    eventId: BigInt(event.id),
    description: input.description
  }).returning();

  for (const e of input.entries) {
    await db.insert(ledgerEntries).values({
      transactionId: BigInt(txn.id),
      accountId: e.accountId,
      amountCents: e.amountCents,
      entryType: e.type
    });
  }

  return { event, transaction: txn };
}
