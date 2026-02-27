import "dotenv/config";
import { recordEvent } from "./events/dispatcher.js";
import { postTransaction, PostingEntry } from "./ledger/engine.js";
import { reverseTransaction } from "./ledger/reverse.js";
import { computeBalances } from "./ledger/balance.js";
import { EventInputSchema } from "./events/types.js";

const routes: Record<string, (req: Request) => Promise<Response>> = {
  "POST /events": async (req) => {
    try {
      const body = await req.json();
      const parsed = EventInputSchema.parse(body);
      const result = await recordEvent({
        ...parsed,
        sensitive: body.sensitive
      });
      return Response.json(result, { status: 201 });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Invalid request";
      return Response.json({ error: msg }, { status: 400 });
    }
  },

  "POST /transactions": async (req) => {
    try {
      const body = await req.json();
      const { actorId, description, entries } = body;
      if (!actorId || !description || !Array.isArray(entries)) {
        return Response.json({ error: "Missing required fields" }, { status: 400 });
      }
      const typedEntries: PostingEntry[] = entries.map((e: { accountId: string; amountCents: string | number; type: "DEBIT" | "CREDIT" }) => ({
        accountId: e.accountId,
        amountCents: BigInt(e.amountCents),
        type: e.type
      }));
      const result = await postTransaction({ actorId, description, entries: typedEntries });
      return Response.json(result, { status: 201 });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Invalid request";
      return Response.json({ error: msg }, { status: 400 });
    }
  },

  "POST /transactions/:id/reverse": async (req) => {
    try {
      const id = parseInt(new URL(req.url).pathname.split("/").pop() || "0", 10);
      if (isNaN(id)) {
        return Response.json({ error: "Invalid transaction ID" }, { status: 400 });
      }
      const body = await req.json();
      const { actorId, reason } = body;
      if (!actorId || !reason) {
        return Response.json({ error: "Missing actorId or reason" }, { status: 400 });
      }
      const result = await reverseTransaction(actorId, id, reason);
      return Response.json(result, { status: 201 });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Invalid request";
      return Response.json({ error: msg }, { status: 400 });
    }
  },

  "GET /balances": async () => {
    try {
      const balances = await computeBalances();
      const serialized: Record<string, string> = {};
      for (const [k, v] of Object.entries(balances)) {
        serialized[k] = v.toString();
      }
      return Response.json(serialized);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error computing balances";
      return Response.json({ error: msg }, { status: 500 });
    }
  },

  "GET /health": async () => {
    return Response.json({ status: "ok" });
  }
};

const notFound = (): Response => Response.json({ error: "Not found" }, { status: 404 });

export default {
  port: parseInt(process.env.PORT || "3000", 10),
  fetch: async (req: Request): Promise<Response> => {
    const url = new URL(req.url);
    const key = `${req.method} ${url.pathname}`;
    const handler = routes[key];
    if (handler) return handler(req);
    const prefix = routes[`${req.method} ${url.pathname.split("/").slice(0, 3).join("/")}`];
    if (prefix) return prefix(req);
    return notFound();
  }
};
