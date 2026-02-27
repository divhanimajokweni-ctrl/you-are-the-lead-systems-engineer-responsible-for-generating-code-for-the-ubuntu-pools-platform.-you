import { getTrustConfig, getOrCreateTrustScore, applyDecay } from "./service.js";
import { TrustGateResultSchema, type ActionType, type TrustGateResult } from "./config.js";

export async function checkTrustGate(
  actorId: string,
  action: ActionType
): Promise<TrustGateResult> {
  const config = getTrustConfig();

  await applyDecay(actorId);
  const trustRecord = await getOrCreateTrustScore(actorId);

  const thresholds: Record<ActionType, number> = {
    submit_proposal: config.proposalThreshold,
    trigger_operation: config.operationThreshold,
    admin_action: config.adminThreshold
  };

  const requiredScore = thresholds[action];
  const currentScore: number = Number(trustRecord.score);

  let allowed = false;
  let reason: string | null = null;

  if (trustRecord.status === "banned") {
    reason = "Actor is banned from all governance actions";
  } else if (trustRecord.status === "frozen") {
    reason = "Actor is frozen due to low trust score";
  } else if (currentScore < requiredScore) {
    reason = `Trust score ${currentScore} is below required threshold ${requiredScore} for ${action}`;
  } else {
    allowed = true;
  }

  return TrustGateResultSchema.parse({
    allowed,
    reason,
    currentScore,
    requiredScore
  });
}

export async function assertTrustGate(actorId: string, action: ActionType): Promise<void> {
  const result = await checkTrustGate(actorId, action);
  if (!result.allowed) {
    throw new Error(`Trust gate failed: ${result.reason}`);
  }
}
