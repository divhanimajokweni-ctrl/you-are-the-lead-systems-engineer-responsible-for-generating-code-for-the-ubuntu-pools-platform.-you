import { db } from "../db/drizzle.js";
import { trustScores, infractions, appeals } from "../db/schema.js";
import { DEFAULT_TRUST_CONFIG, type TrustConfig, type ActionType, type InfractionType } from "./config.js";
import { recordEvent } from "../events/dispatcher.js";
import { eq, and } from "drizzle-orm";

export function computeTrustScoreDecay(
  currentScore: number,
  lastDecayAt: Date | string,
  decayRate: number,
  decayIntervalMs: number,
  minScore: number
): number {
  const lastDecay = typeof lastDecayAt === "string" ? new Date(lastDecayAt) : lastDecayAt;
  const now = new Date();
  const elapsedMs = now.getTime() - lastDecay.getTime();
  const intervals = Math.floor(elapsedMs / decayIntervalMs);
  const decayMultiplier = Math.pow(1 - decayRate, intervals);
  return Math.max(minScore, Math.round(currentScore * decayMultiplier));
}

let trustConfig: TrustConfig = DEFAULT_TRUST_CONFIG;

export function setTrustConfig(config: Partial<TrustConfig>) {
  trustConfig = { ...DEFAULT_TRUST_CONFIG, ...config };
}

export function getTrustConfig(): TrustConfig {
  return trustConfig;
}

export async function getOrCreateTrustScore(actorId: string) {
  let record = await db.query.trustScores.findFirst({
    where: eq(trustScores.actorId, actorId)
  });

  if (!record) {
    const now = new Date();
    const [created] = await db.insert(trustScores).values({
      actorId,
      score: trustConfig.initialScore,
      status: "active",
      lastDecayAt: now,
      lastUpdatedAt: now,
      createdAt: now
    }).returning();
    record = created;
  }

  return record;
}

export async function applyDecay(actorId: string): Promise<number> {
  const record = await getOrCreateTrustScore(actorId);
  if (record.status !== "active") return record.score;

  const newScore = computeTrustScoreDecay(
    record.score,
    record.lastDecayAt,
    trustConfig.decayRate,
    trustConfig.decayIntervalMs,
    trustConfig.minScore
  );

  if (newScore < record.score) {
    await db.update(trustScores)
      .set({ score: newScore, lastDecayAt: new Date() })
      .where(eq(trustScores.actorId, actorId));

    await recordEvent({
      actorId,
      type: "trust.score.decayed",
      payload: { previousScore: record.score, newScore, decayRate: trustConfig.decayRate },
      metadata: { purpose: "LegitimateInterest", consentVersion: "v1.0.0" }
    });
  }

  return newScore;
}

export async function applyPenalty(
  actorId: string,
  type: InfractionType,
  reason: string,
  relatedEventId?: bigint
): Promise<number> {
  await getOrCreateTrustScore(actorId);

  const [infraction] = await db.insert(infractions).values({
    actorId,
    type,
    amount: trustConfig.penaltyAmount,
    reason,
    relatedEventId: relatedEventId ?? null
  }).returning();

  const record = await db.query.trustScores.findFirst({
    where: eq(trustScores.actorId, actorId)
  });

  if (!record) return trustConfig.initialScore;

  const newScore = Math.max(trustConfig.minScore, record.score - trustConfig.penaltyAmount);
  const newStatus = newScore < trustConfig.operationThreshold ? "frozen" : record.status;

  await db.update(trustScores)
    .set({ score: newScore, status: newStatus, lastUpdatedAt: new Date() })
    .where(eq(trustScores.actorId, actorId));

  await recordEvent({
    actorId,
    type: "trust.penalty.applied",
    payload: {
      infractionId: infraction.id,
      type,
      amount: trustConfig.penaltyAmount,
      newScore,
      reason
    },
    metadata: { purpose: "LegitimateInterest", consentVersion: "v1.0.0" }
  });

  return newScore;
}

export async function applyRecovery(actorId: string): Promise<number> {
  const record = await db.query.trustScores.findFirst({
    where: eq(trustScores.actorId, actorId)
  });

  if (!record) return trustConfig.initialScore;

  const newScore = Math.min(trustConfig.maxScore, record.score + trustConfig.recoveryBonus);
  const newStatus = record.status === "banned" ? "frozen" : "active";

  await db.update(trustScores)
    .set({ score: newScore, status: newStatus, lastUpdatedAt: new Date() })
    .where(eq(trustScores.actorId, actorId));

  await recordEvent({
    actorId,
    type: "trust.recovery.applied",
    payload: { previousScore: record.score, newScore, bonus: trustConfig.recoveryBonus },
    metadata: { purpose: "LegitimateInterest", consentVersion: "v1.0.0" }
  });

  return newScore;
}

export async function createAppeal(actorId: string, infractionId: string, reason: string) {
  const [appeal] = await db.insert(appeals).values({
    actorId,
    infractionId,
    reason,
    status: "pending"
  }).returning();

  await recordEvent({
    actorId,
    type: "trust.appeal.created",
    payload: { appealId: appeal.id, infractionId, reason },
    metadata: { purpose: "LegitimateInterest", consentVersion: "v1.0.0" }
  });

  return appeal;
}

export async function reviewAppeal(
  appealId: string,
  reviewerId: string,
  approved: boolean
) {
  const [appeal] = await db.update(appeals)
    .set({
      status: approved ? "approved" : "rejected",
      reviewedBy: reviewerId,
      reviewedAt: new Date()
    })
    .where(eq(appeals.id, appealId))
    .returning();

  const infraction = await db.query.infractions.findFirst({
    where: eq(infractions.id, appeal.infractionId)
  });

  if (!infraction) return appeal;

  if (approved) {
    await applyRecovery(infraction.actorId);
  } else {
    await applyPenalty(infraction.actorId, "appeal_rejected", "Appeal rejected by reviewer");
  }

  await recordEvent({
    actorId: reviewerId,
    type: approved ? "trust.appeal.approved" : "trust.appeal.rejected",
    payload: { appealId, infractionId: appeal.infractionId, reviewerId },
    metadata: { purpose: "LegitimateInterest", consentVersion: "v1.0.0" }
  });

  return appeal;
}
