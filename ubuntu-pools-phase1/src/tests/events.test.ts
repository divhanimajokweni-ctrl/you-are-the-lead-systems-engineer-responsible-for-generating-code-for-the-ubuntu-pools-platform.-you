import { describe, it, expect } from "vitest";
import { computeEventHash } from "../events/hash.js";

describe("Event Hash", () => {
  it("computes consistent hash", () => {
    const payload = {
      actorId: "test-uuid",
      type: "test.event",
      payload: { foo: "bar" },
      metadata: { purpose: "ExplicitConsent", consentVersion: "v1" },
      prevEventHash: null,
      createdAt: "2024-01-01T00:00:00.000Z"
    };
    
    const hash1 = computeEventHash(payload);
    const hash2 = computeEventHash(payload);
    
    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
  });
  
  it("produces different hash for different input", () => {
    const payload1 = { data: "test1" };
    const payload2 = { data: "test2" };
    
    const hash1 = computeEventHash(payload1);
    const hash2 = computeEventHash(payload2);
    
    expect(hash1).not.toBe(hash2);
  });
});
