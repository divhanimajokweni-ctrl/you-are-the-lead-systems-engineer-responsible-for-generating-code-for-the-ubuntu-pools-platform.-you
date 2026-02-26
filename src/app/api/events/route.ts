/**
 * Ubuntu Pools — Phase 1: Events API Route
 *
 * POST /api/events — Emit a new event
 * GET  /api/events — List recent events (with optional filters)
 *
 * Governance Charter Compliance:
 *   - All inputs validated server-side before any DB write.
 *   - No client-side authority — server enforces all rules.
 *   - Responses never expose internal stack traces in production.
 *   - All monetary values in responses are integer minor units.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { createEventService, EventValidationError, EventDuplicateError } from "@/lib/services/event-service";
import { createEventInputSchema } from "@/lib/events/schemas";

// =============================================================================
// POST /api/events — Emit a new event
// =============================================================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    // Validate input schema
    const parsed = createEventInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "VALIDATION_ERROR",
          message: "Event input validation failed",
          // Zod v4 uses .issues (path is PropertyKey[] which includes symbol)
          details: parsed.error.issues.map((e) => ({
            path: Array.from(e.path).map(String).join("."),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    const service = createEventService(db);
    const result = await service.emit(parsed.data);

    return NextResponse.json(
      {
        event: serializeEvent(result.event),
        wasNew: result.wasNew,
      },
      { status: result.wasNew ? 201 : 200 }
    );
  } catch (error) {
    if (error instanceof EventValidationError) {
      return NextResponse.json(
        {
          error: "VALIDATION_ERROR",
          message: error.message,
          details: error.validationErrors,
        },
        { status: 400 }
      );
    }

    if (error instanceof EventDuplicateError) {
      return NextResponse.json(
        {
          error: "DUPLICATE_EVENT",
          message: error.message,
          existingEventId: error.existingEventId,
        },
        { status: 409 }
      );
    }

    console.error("[POST /api/events] Unexpected error:", error);
    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        message: "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}

// =============================================================================
// GET /api/events — List recent events
// =============================================================================

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);

    const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 200);
    const offset = parseInt(searchParams.get("offset") ?? "0");
    const eventType = searchParams.get("eventType") ?? undefined;
    const status = searchParams.get("status") as
      | "pending"
      | "posted"
      | "failed"
      | undefined;

    // Validate status if provided
    if (status && !["pending", "posted", "failed"].includes(status)) {
      return NextResponse.json(
        {
          error: "VALIDATION_ERROR",
          message: "status must be one of: pending, posted, failed",
        },
        { status: 400 }
      );
    }

    const service = createEventService(db);
    const events = await service.getRecentEvents({
      limit,
      offset,
      eventType,
      status,
    });

    return NextResponse.json({
      events: events.map(serializeEvent),
      count: events.length,
      limit,
      offset,
    });
  } catch (error) {
    console.error("[GET /api/events] Unexpected error:", error);
    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        message: "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}

// =============================================================================
// SERIALIZATION HELPER
// =============================================================================

/**
 * Serializes an event for API response.
 * Converts Date objects to ISO strings.
 * Does NOT expose internal fields.
 */
function serializeEvent(event: {
  id: string;
  eventType: string;
  actorId: string;
  entityId: string;
  entityType: string;
  payload: unknown;
  occurredAt: Date;
  sequenceNo: number | bigint;
  hash: string;
  prevHash: string | null;
  status: string;
}) {
  return {
    id: event.id,
    eventType: event.eventType,
    actorId: event.actorId,
    entityId: event.entityId,
    entityType: event.entityType,
    payload: event.payload,
    occurredAt: event.occurredAt.toISOString(),
    sequenceNo: Number(event.sequenceNo),
    hash: event.hash,
    prevHash: event.prevHash,
    status: event.status,
  };
}
