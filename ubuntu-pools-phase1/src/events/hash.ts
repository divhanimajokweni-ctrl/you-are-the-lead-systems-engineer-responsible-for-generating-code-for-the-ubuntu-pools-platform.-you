import crypto from "crypto";

function canonicalize(o: unknown): string {
  if (o === null || typeof o !== "object") return JSON.stringify(o);
  if (Array.isArray(o)) return `[${o.map(canonicalize).join(",")}]`;
  return `{${Object.keys(o as Record<string, unknown>).sort().map(k => JSON.stringify(k) + ":" + canonicalize((o as Record<string, unknown>)[k])).join(",")}}`;
}

export function computeEventHash(eventCore: object): string {
  const canon = canonicalize(eventCore);
  return crypto.createHash("sha256").update(canon).digest("hex");
}
