import { NextResponse } from "next/server";

import { workspaceSaveBodySchema } from "@/features/board/board.schema";
import * as boardService from "@/features/board/board.service";
import { requireAppUser } from "@/lib/require-app-user";

type RouteContext = { params: Promise<{ boardId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const user = await requireAppUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { boardId } = await context.params;
  const workspace = await boardService.getBoardWorkspaceForUser(boardId, user.id);
  if (!workspace) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(workspace);
}

export async function PUT(request: Request, context: RouteContext) {
  const user = await requireAppUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { boardId } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = workspaceSaveBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const lists = parsed.data.lists.map((l) => ({
    id: l.id,
    title: l.title,
    position: l.position,
  }));

  const cards = parsed.data.cards.map((c) => ({
    id: c.id,
    listId: c.listId,
    title: c.title,
    description: c.description ?? null,
    position: c.position,
    dueAt: c.dueAt == null ? null : new Date(c.dueAt),
  }));

  let saved;
  try {
    saved = await boardService.saveBoardWorkspaceForUser({
      boardId,
      userId: user.id,
      lists,
      cards,
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid workspace payload" },
      { status: 400 },
    );
  }

  if (!saved) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(saved);
}
