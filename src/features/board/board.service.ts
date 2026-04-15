import type { Board, Card, List } from "@prisma/client";

import * as boardRepository from "./board.repository";
import type { BoardJson, BoardWorkspaceJson, CardJson, ListJson } from "./board.types";
import type { WorkspaceCardWrite, WorkspaceListWrite } from "./board.workspace.repository";
import * as workspaceRepository from "./board.workspace.repository";

function toBoardJson(board: Board): BoardJson {
  return {
    id: board.id,
    title: board.title,
    createdAt: board.createdAt.toISOString(),
    updatedAt: board.updatedAt.toISOString(),
  };
}

function toListJson(list: List): ListJson {
  return {
    id: list.id,
    boardId: list.boardId,
    title: list.title,
    position: list.position,
    createdAt: list.createdAt.toISOString(),
    updatedAt: list.updatedAt.toISOString(),
  };
}

function toCardJson(card: Card): CardJson {
  return {
    id: card.id,
    listId: card.listId,
    title: card.title,
    description: card.description,
    position: card.position,
    dueAt: card.dueAt ? card.dueAt.toISOString() : null,
    remindAt: card.remindAt ? card.remindAt.toISOString() : null,
    createdAt: card.createdAt.toISOString(),
    updatedAt: card.updatedAt.toISOString(),
  };
}

export async function listBoardsForUser(userId: string): Promise<BoardJson[]> {
  const count = await boardRepository.countBoardsByUserId(userId);
  if (count === 0) {
    await boardRepository.createBoard({ userId, title: "TODAY" });
  }
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

export async function getBoardWorkspaceForUser(
  boardId: string,
  userId: string,
): Promise<BoardWorkspaceJson | null> {
  const board = await boardRepository.findBoardByIdForUser(boardId, userId);
  if (!board) {
    return null;
  }
  await workspaceRepository.seedDefaultLists(boardId);
  const lists = await workspaceRepository.findListsForBoard(boardId);
  const cards = await workspaceRepository.findCardsForBoard(boardId);
  return {
    board: toBoardJson(board),
    lists: lists.map(toListJson),
    cards: cards.map(toCardJson),
  };
}

export async function saveBoardWorkspaceForUser(input: {
  boardId: string;
  userId: string;
  lists: WorkspaceListWrite[];
  cards: WorkspaceCardWrite[];
}): Promise<BoardWorkspaceJson | null> {
  const board = await boardRepository.findBoardByIdForUser(input.boardId, input.userId);
  if (!board) {
    return null;
  }

  const listIds = new Set(input.lists.map((l) => l.id));
  for (const card of input.cards) {
    if (!listIds.has(card.listId)) {
      throw new Error("Card references unknown list");
    }
  }

  await workspaceRepository.replaceBoardWorkspace(
    input.boardId,
    input.lists,
    input.cards,
  );

  return getBoardWorkspaceForUser(input.boardId, input.userId);
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
