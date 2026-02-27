import { z } from "zod";

export const TrustConfigSchema = z.object({
  initialScore: z.number().int().min(0).max(100).default(50),
  proposalThreshold: z.number().int().min(0).max(100).default(30),
  operationThreshold: z.number().int().min(0).max(100).default(20),
  adminThreshold: z.number().int().min(0).max(100).default(70),
  decayRate: z.number().min(0).max(1).default(0.01),
  decayIntervalMs: z.number().int().positive().default(86400000),
  penaltyAmount: z.number().int().min(1).default(10),
  maxPenalty: z.number().int().min(1).default(50),
  recoveryBonus: z.number().int().min(1).default(5),
  appealWindowMs: z.number().int().positive().default(604800000),
  minScore: z.number().int().min(0).max(100).default(0),
  maxScore: z.number().int().min(0).max(100).default(100)
}).strict();

export type TrustConfig = Readonly<z.infer<typeof TrustConfigSchema>>;

export const DEFAULT_TRUST_CONFIG: TrustConfig = {
  initialScore: 50,
  proposalThreshold: 30,
  operationThreshold: 20,
  adminThreshold: 70,
  decayRate: 0.01,
  decayIntervalMs: 86400000,
  penaltyAmount: 10,
  maxPenalty: 50,
  recoveryBonus: 5,
  appealWindowMs: 604800000,
  minScore: 0,
  maxScore: 100
};

export const TrustStatusSchema = z.enum(["active", "frozen", "banned"]);
export type TrustStatus = z.infer<typeof TrustStatusSchema>;

export const InfractionTypeSchema = z.enum([
  "failed_proposal",
  "governance_abuse",
  "spam",
  "rule_violation",
  "appeal_rejected"
]);
export type InfractionType = z.infer<typeof InfractionTypeSchema>;

export const AppealStatusSchema = z.enum(["pending", "approved", "rejected"]);
export type AppealStatus = z.infer<typeof AppealStatusSchema>;

export const TrustScoreSchema = z.object({
  actorId: z.string().uuid(),
  score: z.number().int().min(0).max(100),
  status: TrustStatusSchema,
  lastDecayAt: z.string().datetime(),
  lastUpdatedAt: z.string().datetime(),
  createdAt: z.string().datetime()
});
export type TrustScore = z.infer<typeof TrustScoreSchema>;

export const InfractionSchema = z.object({
  id: z.string().uuid(),
  actorId: z.string().uuid(),
  type: InfractionTypeSchema,
  amount: z.number().int(),
  reason: z.string().max(500),
  createdAt: z.string().datetime(),
  relatedEventId: z.string().uuid().nullable()
});
export type Infraction = z.infer<typeof InfractionSchema>;

export const AppealSchema = z.object({
  id: z.string().uuid(),
  actorId: z.string().uuid(),
  infractionId: z.string().uuid(),
  status: AppealStatusSchema,
  reason: z.string().max(1000),
  reviewedBy: z.string().uuid().nullable(),
  reviewedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime()
});
export type Appeal = z.infer<typeof AppealSchema>;

export const ActionTypeSchema = z.enum(["submit_proposal", "trigger_operation", "admin_action"]);
export type ActionType = z.infer<typeof ActionTypeSchema>;

export const TrustGateResultSchema = z.object({
  allowed: z.boolean(),
  reason: z.string().nullable(),
  currentScore: z.number().int().min(0).max(100),
  requiredScore: z.number().int().min(0).max(100)
});
export type TrustGateResult = z.infer<typeof TrustGateResultSchema>;
