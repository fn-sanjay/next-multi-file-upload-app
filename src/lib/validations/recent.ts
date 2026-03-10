import { z } from "zod";

export const createRecentAccessSchema = z
  .object({
    fileId: z.string().uuid().optional(),
    folderId: z.string().uuid().optional(),
  })
  .refine((data) => data.fileId || data.folderId, {
    message: "Either fileId or folderId must be provided",
  });