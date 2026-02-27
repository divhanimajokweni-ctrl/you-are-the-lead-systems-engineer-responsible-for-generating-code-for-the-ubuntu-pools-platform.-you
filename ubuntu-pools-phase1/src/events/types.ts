import { z } from "zod";

const PII_FREE_STRING = z.string().max(256).refine(s => !s.includes("@"), { message: "No emails" });
const PII_FREE_NUMBER = z.number().safe().finite();

export const PII_FREE_LITERAL = z.union([PII_FREE_STRING, PII_FREE_NUMBER, z.boolean(), z.null()]);

export const PII_FREE_VALUE: z.ZodType<unknown> = z.lazy(() =>
  z.union([PII_FREE_LITERAL, z.array(PII_FREE_VALUE), z.record(z.string(), PII_FREE_VALUE)])
);

export const EventInputSchema = z.object({
  actorId: z.string().uuid(),
  type: z.string().min(1),
  payload: PII_FREE_VALUE,
  metadata: z.object({
    purpose: z.enum(["ContractualNecessity", "ExplicitConsent", "LegitimateInterest"]),
    consentVersion: z.string().min(1)
  })
}).strict();

export type EventInput = Readonly<z.infer<typeof EventInputSchema>>;
