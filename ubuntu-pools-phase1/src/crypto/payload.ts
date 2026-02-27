import crypto from "crypto";
import { ensureActorDek } from "./keys.js";

export type EncryptedPayload = {
  readonly ciphertextBase64: string;
  readonly ivBase64: string;
  readonly authTagBase64: string;
  readonly keyId: string;
};

export async function encryptSensitivePayload(
  actorId: string,
  payload: unknown
): Promise<EncryptedPayload> {
  const { keyId, dek } = await ensureActorDek(actorId);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", dek, iv);
  const plaintext = Buffer.from(JSON.stringify(payload), "utf8");
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return {
    ciphertextBase64: ciphertext.toString("base64"),
    ivBase64: iv.toString("base64"),
    authTagBase64: authTag.toString("base64"),
    keyId
  };
}

export function decryptSensitivePayload(dek: Buffer, encrypted: EncryptedPayload): unknown {
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    dek,
    Buffer.from(encrypted.ivBase64, "base64")
  );
  decipher.setAuthTag(Buffer.from(encrypted.authTagBase64, "base64"));
  const pt = Buffer.concat([
    decipher.update(Buffer.from(encrypted.ciphertextBase64, "base64")),
    decipher.final()
  ]);
  return JSON.parse(pt.toString("utf8"));
}
