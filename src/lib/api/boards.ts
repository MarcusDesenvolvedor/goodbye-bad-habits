import type { WorkspaceSaveBody } from "@/features/board/board.schema";
import type { BoardJson, BoardWorkspaceJson } from "@/features/board/board.types";

async function readJson(res: Response): Promise<unknown> {
  return res.json().catch(() => ({}));
}

export async function fetchBoards(): Promise<BoardJson[]> {
  const res = await fetch("/api/boards", { credentials: "include" });
  const data = await readJson(res);
  if (!res.ok || !Array.isArray(data)) {
    throw new Error("Failed to load boards");
  }
  return data as BoardJson[];
}

export async function createBoard(title: string): Promise<BoardJson> {
  const res = await fetch("/api/boards", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  const data = await readJson(res);
  if (!res.ok) {
    throw new Error("Failed to create board");
  }
  return data as BoardJson;
}

export async function deleteBoard(boardId: string): Promise<void> {
  const res = await fetch(`/api/boards/${boardId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error("Failed to delete board");
  }
}

export async function patchBoardTitle(
  boardId: string,
  title: string,
): Promise<BoardJson> {
  const res = await fetch(`/api/boards/${boardId}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  const data = await readJson(res);
  if (!res.ok) {
    throw new Error("Failed to update board title");
  }
  return data as BoardJson;
}

export async function fetchBoardWorkspace(
  boardId: string,
): Promise<BoardWorkspaceJson> {
  const res = await fetch(`/api/boards/${boardId}/workspace`, {
    credentials: "include",
  });
  if (res.status === 404) {
    throw new Error("NOT_FOUND");
  }
  const data = await readJson(res);
  if (!res.ok) {
    throw new Error("Failed to load board workspace");
  }
  return data as BoardWorkspaceJson;
}

export async function saveBoardWorkspace(
  boardId: string,
  body: WorkspaceSaveBody,
): Promise<BoardWorkspaceJson> {
  const res = await fetch(`/api/boards/${boardId}/workspace`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await readJson(res);
  if (!res.ok) {
    throw new Error("Failed to save board workspace");
  }
  return data as BoardWorkspaceJson;
}
