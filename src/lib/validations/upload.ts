import { z } from "zod";

export const uploadInitSchema = z.object({
  filename: z.string().min(1).max(255),
  size: z.number().positive(),
  hash: z.string().min(64).max(64),
  folderId: z.uuid().optional().nullable(),
  relativePath: z.string().optional().nullable(),
});

export const uploadChunkSchema = z.object({
  uploadId: z.uuid(),
  partNumber: z.number().int().positive(),
});

export const uploadCompleteSchema = z.object({
  uploadId: z.uuid(),
});
