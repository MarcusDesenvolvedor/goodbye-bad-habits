import type { Board } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export async function findBoardsByUserId(userId: string): Promise<Board[]> {
  return prisma.board.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
}

export async function countBoardsByUserId(userId: string): Promise<number> {
  return prisma.board.count({ where: { userId } });
}

export async function createBoard(input: {
  userId: string;
  title: string;
}): Promise<Board> {
  return prisma.board.create({
    data: {
      userId: input.userId,
      title: input.title,
    },
  });
}

export async function findBoardByIdForUser(
  boardId: string,
  userId: string,
): Promise<Board | null> {
  return prisma.board.findFirst({
    where: { id: boardId, userId },
  });
}

export async function updateBoardTitleForUser(input: {
  boardId: string;
  userId: string;
  title: string;
}): Promise<Board | null> {
  const existing = await findBoardByIdForUser(input.boardId, input.userId);
  if (!existing) {
    return null;
  }
  return prisma.board.update({
    where: { id: input.boardId },
    data: { title: input.title },
  });
}

export async function deleteBoardForUser(
  boardId: string,
  userId: string,
): Promise<boolean> {
  const existing = await findBoardByIdForUser(boardId, userId);
  if (!existing) {
    return false;
  }
  await prisma.board.delete({ where: { id: boardId } });
  return true;
}
