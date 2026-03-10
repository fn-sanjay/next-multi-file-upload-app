import { z } from "zod";

/**
 * Create Folder
 */
export const createFolderSchema = z.object({
  name: z
    .string()
    .min(1, "Folder name is required")
    .max(255, "Folder name too long"),

  parentId: z
    .string()
    .uuid("Invalid parentId")
    .nullable()
    .optional(),

  tagIds: z
    .array(z.string().uuid("Invalid tag id"))
    .max(3, "Maximum 3 tags per folder")
    .optional(),
});

/**
 * Update Folder
 */
export const updateFolderSchema = z.object({
  name: z
    .string()
    .min(1, "Folder name is required")
    .max(255)
    .optional(),

  parentId: z
    .string()
    .uuid("Invalid parentId")
    .nullable()
    .optional(),
});

/**
 * Batch Folder Operation
 */
export const batchFolderSchema = z.object({
  action: z.enum(["move", "delete", "restore"]),

  destinationFolderId: z
    .string()
    .uuid()
    .nullable()
    .optional(),

  folders: z.array(z.string().uuid()).min(1),
});
