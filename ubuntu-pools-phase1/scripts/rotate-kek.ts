#!/usr/bin/env bun
import crypto from "crypto";
import { db } from "../src/db/drizzle.js";
import { encryptionKeys } from "../src/db/schema.js";
import { eq } from "drizzle-orm";

const CURRENT_KEK = process.env.KEK_HEX as string;
const NEW_KEK = process.env.NEW_KEK_HEX as string;

if (!CURRENT_KEK || CURRENT_KEK.length !== 64) {
  console.error("KEK_HEX missing or invalid");
  process.exit(1);
}

if (!NEW_KEK || NEW_KEK.length !== 64) {
  console.error("NEW_KEK_HEX missing or invalid");
  process.exit(1);
}

async function rotateKek() {
  console.log("Starting KEK rotation...");
  
  const allKeys = await db.select().from(encryptionKeys).where(eq(encryptionKeys.active, true));
  
  for (const key of allKeys) {
    console.log(`Re-encrypting DEK for actor: ${key.actorId}`);
    
    const oldDek = (() => {
      const iv = key.dekIv as unknown as Buffer;
      const authTag = key.dekAuthTag as unknown as Buffer;
      const ciphertext = key.dekCiphertext as unknown as Buffer;
      const decipher = crypto.createDecipheriv("aes-256-gcm", Buffer.from(CURRENT_KEK, "hex"), iv);
      decipher.setAuthTag(authTag);
      return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    })();
    
    const newIv = crypto.randomBytes(12);
    const newCipher = crypto.createCipheriv("aes-256-gcm", Buffer.from(NEW_KEK, "hex"), newIv);
    const newCiphertext = Buffer.concat([
      newCipher.update(oldDek),
      newCipher.final()
    ]);
    const newAuthTag = newCipher.getAuthTag();
    
    await db.update(encryptionKeys)
      .set({
        dekCiphertext: newCiphertext,
        dekIv: newIv,
        dekAuthTag: newAuthTag
      })
      .where(eq(encryptionKeys.keyId, key.keyId));
      
    console.log(`  Rotated key: ${key.keyId}`);
  }
  
  console.log("KEK rotation complete!");
}

rotateKek().catch(err => {
  console.error("Rotation failed:", err);
  process.exit(1);
});
