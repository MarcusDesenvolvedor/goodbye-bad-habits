import { NextResponse } from "next/server";

import { updateBoardBodySchema } from "@/features/board/board.schema";
import * as boardService from "@/features/board/board.service";
import { requireAppUser } from "@/lib/require-app-user";

type RouteContext = { params: Promise<{ boardId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const user = await requireAppUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { boardId } = await context.params;
  const board = await boardService.getBoardForUser(boardId, user.id);
  if (!board) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(board);
}

export async function PATCH(request: Request, context: RouteContext) {
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

  const parsed = updateBoardBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const board = await boardService.updateBoardTitleForUser({
    boardId,
    userId: user.id,
    title: parsed.data.title,
  });

  if (!board) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(board);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const user = await requireAppUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { boardId } = await context.params;
  const deleted = await boardService.deleteBoardForUser(boardId, user.id);
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
