import { z } from "zod";

export const batchSchema = z.object({
  action: z.enum(["move", "copy", "delete", "favorite", "restore"]),
  destinationFolderId: z.uuid().nullable().optional(),
  files: z.array(z.uuid()).optional(),
  folders: z.array(z.uuid()).optional(),
});
