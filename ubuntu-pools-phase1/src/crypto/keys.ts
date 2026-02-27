import crypto from "crypto";
import { db } from "../db/drizzle.js";
import { encryptionKeys } from "../db/schema.js";
import { eq } from "drizzle-orm";

export function getKek(): Buffer {
  const hex = process.env.KEK_HEX;
  if (!hex || hex.length !== 64) {
    throw new Error("KEK_HEX missing or invalid length (expect 64 hex chars)");
  }
  return Buffer.from(hex, "hex");
}

export function wrapDekWithKek(dek: Buffer): { ciphertext: Buffer; iv: Buffer; authTag: Buffer } {
  const kek = getKek();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", kek, iv);
  const ciphertext = Buffer.concat([cipher.update(dek), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return { ciphertext, iv, authTag };
}

export function unwrapDekWithKek(ciphertext: Buffer, iv: Buffer, authTag: Buffer): Buffer {
  const kek = getKek();
  const decipher = crypto.createDecipheriv("aes-256-gcm", kek, iv);
  decipher.setAuthTag(authTag);
  const dek = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return dek;
}

export async function ensureActorDek(actorId: string): Promise<{ keyId: string; dek: Buffer }> {
  const existing = await db.select().from(encryptionKeys).where(eq(encryptionKeys.actorId, actorId));
  const active = existing.find(k => k.active);
  if (active) {
    const dek = unwrapDekWithKek(
      Buffer.from(active.dekCiphertext),
      Buffer.from(active.dekIv),
      Buffer.from(active.dekAuthTag)
    );
    return { keyId: active.keyId, dek };
  }
  const dek = crypto.randomBytes(32);
  const wrapped = wrapDekWithKek(dek);
  const [inserted] = await db.insert(encryptionKeys).values({
    actorId,
    dekCiphertext: wrapped.ciphertext,
    dekIv: wrapped.iv,
    dekAuthTag: wrapped.authTag,
    algorithm: "AES-256-GCM",
    active: true
  }).returning({ keyId: encryptionKeys.keyId });
  return { keyId: inserted.keyId, dek };
}

export async function shredActorKeys(actorId: string): Promise<void> {
  await db.delete(encryptionKeys).where(eq(encryptionKeys.actorId, actorId));
}
