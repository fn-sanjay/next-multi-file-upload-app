import { z } from "zod";

export const updateUserSchema = z.object({
  role: z.enum(["USER", "ADMIN"]).optional(),
  isReadOnly: z.boolean().optional(),
  isBanned: z.boolean().optional(),
  storageQuota: z.union([z.number(), z.string()])
    .transform(v => BigInt(v))
    .optional(),
});