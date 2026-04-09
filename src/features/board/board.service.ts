import type { Board } from "@prisma/client";

import * as boardRepository from "./board.repository";
import type { BoardJson } from "./board.types";

function toBoardJson(board: Board): BoardJson {
  return {
    id: board.id,
    title: board.title,
    createdAt: board.createdAt.toISOString(),
    updatedAt: board.updatedAt.toISOString(),
  };
}

export async function listBoardsForUser(userId: string): Promise<BoardJson[]> {
  await boardRepository.ensureDefaultBoardIfEmpty(userId);
  const boards = await boardRepository.findBoardsByUserId(userId);
  return boards.map(toBoardJson);
}

export async function createBoardForUser(input: {
  userId: string;
  title: string;
}): Promise<BoardJson> {
  const board = await boardRepository.createBoard({
    userId: input.userId,
    title: input.title,
  });
  return toBoardJson(board);
}

export async function getBoardForUser(
  boardId: string,
  userId: string,
): Promise<BoardJson | null> {
  const board = await boardRepository.findBoardByIdForUser(boardId, userId);
  return board ? toBoardJson(board) : null;
}

export async function updateBoardTitleForUser(input: {
  boardId: string;
  userId: string;
  title: string;
}): Promise<BoardJson | null> {
  const board = await boardRepository.updateBoardTitleForUser(input);
  return board ? toBoardJson(board) : null;
}

export async function deleteBoardForUser(
  boardId: string,
  userId: string,
): Promise<boolean> {
  return boardRepository.deleteBoardForUser(boardId, userId);
}
