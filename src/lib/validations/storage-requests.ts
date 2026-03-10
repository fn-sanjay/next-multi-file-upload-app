import { z } from "zod";

export const createStorageRequestSchema = z.object({
  requestedQuota: z
    .union([z.number(), z.string()])
    .transform((v) => BigInt(v)),

  reason: z
    .string()
    .max(500)
    .optional(),
});