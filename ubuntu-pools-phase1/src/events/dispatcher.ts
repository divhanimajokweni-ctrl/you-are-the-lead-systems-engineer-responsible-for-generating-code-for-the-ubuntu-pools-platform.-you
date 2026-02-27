import { db } from "../db/drizzle.js";
import { events } from "../db/schema.js";
import { EventInput, EventInputSchema } from "./types.js";
import { computeEventHash } from "./hash.js";
import { desc } from "drizzle-orm";
import { encryptSensitivePayload, EncryptedPayload } from "../crypto/payload.js";

export async function recordEvent(input: Readonly<EventInput> & {
  readonly sensitive?: unknown;
}) {
  const parsed = EventInputSchema.parse(input);

  const prev = await db.query.events.findFirst({
    orderBy: [desc(events.id)]
  });

  let encrypted: EncryptedPayload | undefined = undefined;
  if (typeof input.sensitive !== "undefined") {
    encrypted = await encryptSensitivePayload(parsed.actorId, input.sensitive);
  }

  const core = {
    actorId: parsed.actorId,
    type: parsed.type,
    payload: parsed.payload,
    metadata: parsed.metadata,
    prevEventHash: prev?.eventHash ?? null,
    createdAt: new Date().toISOString()
  };

  const eventHash = computeEventHash(core);

  const [inserted] = await db.insert(events).values({
    actorId: parsed.actorId,
    type: parsed.type,
    payload: parsed.payload,
    metadata: parsed.metadata,
    prevEventHash: prev?.eventHash ?? null,
    eventHash,
    createdAt: new Date(),
    sensitiveCiphertext: encrypted ? Buffer.from(encrypted.ciphertextBase64, "base64") : null,
    sensitiveIv: encrypted ? Buffer.from(encrypted.ivBase64, "base64") : null,
    sensitiveAuthTag: encrypted ? Buffer.from(encrypted.authTagBase64, "base64") : null,
    sensitiveKeyId: encrypted?.keyId ?? null
  }).returning();

  return inserted;
}
