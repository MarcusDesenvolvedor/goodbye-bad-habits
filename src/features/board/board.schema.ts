import { z } from "zod";

export const createBoardBodySchema = z.object({
  title: z.string().trim().min(1).max(200),
});

export const updateBoardBodySchema = z.object({
  title: z.string().trim().min(1).max(200),
});

export type CreateBoardBody = z.infer<typeof createBoardBodySchema>;
export type UpdateBoardBody = z.infer<typeof updateBoardBodySchema>;
