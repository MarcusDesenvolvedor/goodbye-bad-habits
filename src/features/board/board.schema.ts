import { z } from "zod";

export const createBoardBodySchema = z.object({
  title: z.string().trim().min(1).max(200),
});

export const updateBoardBodySchema = z.object({
  title: z.string().trim().min(1).max(200),
});

export const workspaceListSaveSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(1).max(120),
  position: z.number().int().min(0),
});

export const workspaceCardSaveSchema = z.object({
  id: z.string().uuid(),
  listId: z.string().uuid(),
  title: z.string().trim().min(1).max(500),
  description: z.string().max(20_000).nullable().optional(),
  position: z.number().int().min(0),
  dueAt: z.union([z.string(), z.null()]).optional(),
});

export const workspaceSaveBodySchema = z.object({
  lists: z.array(workspaceListSaveSchema).min(1),
  cards: z.array(workspaceCardSaveSchema),
});

export type CreateBoardBody = z.infer<typeof createBoardBodySchema>;
export type UpdateBoardBody = z.infer<typeof updateBoardBodySchema>;
export type WorkspaceSaveBody = z.infer<typeof workspaceSaveBodySchema>;
