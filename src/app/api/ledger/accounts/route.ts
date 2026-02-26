/**
 * Ubuntu Pools — Phase 1: Ledger Accounts API Route
 *
 * POST /api/ledger/accounts — Open a new ledger account
 * GET  /api/ledger/accounts — List ledger accounts (with optional filters)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db/client";
import { createEventService } from "@/lib/services/event-service";
import { createLedgerService } from "@/lib/services/ledger-service";

// =============================================================================
// INPUT SCHEMA
// =============================================================================

const openAccountSchema = z.object({
  code: z
    .string()
    .min(1)
    .regex(
      /^[A-Z0-9_-]+$/,
      "Account code must be uppercase alphanumeric with hyphens/underscores"
    ),
  name: z.string().min(1),
  accountType: z.enum(["asset", "liability", "equity", "revenue", "expense"]),
  currency: z
    .string()
    .length(3)
    .regex(/^[A-Z]{3}$/, "Currency must be 3 uppercase letters"),
  entityId: z.string().uuid().optional(),
  entityType: z.string().optional(),
  actorId: z.string().uuid("actorId must be a valid UUID"),
});

// =============================================================================
// POST /api/ledger/accounts — Open a new account
// =============================================================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    const parsed = openAccountSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "VALIDATION_ERROR",
          message: "Account input validation failed",
          // Zod v4 uses .issues (path is PropertyKey[] which includes symbol)
          details: parsed.error.issues.map((e) => ({
            path: Array.from(e.path).map(String).join("."),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    const eventService = createEventService(db);
    const ledgerService = createLedgerService(db, eventService);

    const account = await ledgerService.openAccount(parsed.data);

    return NextResponse.json({ account }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("already exists")) {
      return NextResponse.json(
        { error: "CONFLICT", message: error.message },
        { status: 409 }
      );
    }

    console.error("[POST /api/ledger/accounts] Unexpected error:", error);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

// =============================================================================
// GET /api/ledger/accounts — List accounts
// =============================================================================

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);

    const entityId = searchParams.get("entityId") ?? undefined;
    const entityType = searchParams.get("entityType") ?? undefined;
    const currency = searchParams.get("currency") ?? undefined;

    const eventService = createEventService(db);
    const ledgerService = createLedgerService(db, eventService);

    const accounts = await ledgerService.getAccounts({
      entityId,
      entityType,
      currency,
    });

    return NextResponse.json({ accounts, count: accounts.length });
  } catch (error) {
    console.error("[GET /api/ledger/accounts] Unexpected error:", error);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
