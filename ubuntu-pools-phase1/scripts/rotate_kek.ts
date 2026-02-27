import "dotenv/config";
import crypto from "crypto";
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
import { encryptionKeys } from "../src/db/schema.js";
import { eq } from "drizzle-orm";

const { Pool } = pkg;

function hexToKey(hex?: string): Buffer {
  if (!hex || hex.length !== 64) throw new Error("KEK hex must be 64 hex chars (32 bytes)");
  return Buffer.from(hex, "hex");
}

function unwrap(ciphertext: Buffer, iv: Buffer, tag: Buffer, kek: Buffer): Buffer {
  const d = crypto.createDecipheriv("aes-256-gcm", kek, iv);
  d.setAuthTag(tag);
  return Buffer.concat([d.update(ciphertext), d.final()]);
}

function wrap(plaintext: Buffer, kek: Buffer): { ciphertext: Buffer; iv: Buffer; tag: Buffer } {
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv("aes-256-gcm", kek, iv);
  const ciphertext = Buffer.concat([c.update(plaintext), c.final()]);
  const tag = c.getAuthTag();
  return { ciphertext, iv, tag };
}

async function main() {
  const OLD = hexToKey(process.env.OLD_KEK_HEX);
  const NEW = hexToKey(process.env.NEW_KEK_HEX);

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  console.log("Starting KEK rotation...");
  const rows = await db.select().from(encryptionKeys);
  console.log(`Found ${rows.length} DEKs to rewrap`);

  for (const row of rows) {
    if (row.algorithm !== "AES-256-GCM") {
      throw new Error(`Unsupported algorithm on key ${row.keyId}: ${row.algorithm}`);
    }
    const dek = unwrap(
      Buffer.from(row.dekCiphertext),
      Buffer.from(row.dekIv),
      Buffer.from(row.dekAuthTag),
      OLD
    );
    const wrapped = wrap(dek, NEW);

    await db.update(encryptionKeys)
      .set({
        dekCiphertext: wrapped.ciphertext,
        dekIv: wrapped.iv,
        dekAuthTag: wrapped.tag
      })
      .where(eq(encryptionKeys.keyId, row.keyId));
    
    console.log(`Rewrapped key: ${row.keyId}`);
  }

  console.log("Rotation completed. IMPORTANT: Update environment KEK_HEX to NEW_KEK_HEX.");
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
