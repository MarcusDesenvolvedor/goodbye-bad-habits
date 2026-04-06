import { NextResponse } from "next/server";

import {
  createBoardBodySchema,
} from "@/features/board/board.schema";
import * as boardService from "@/features/board/board.service";
import { requireAppUser } from "@/lib/require-app-user";

export async function GET() {
  const user = await requireAppUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const boards = await boardService.listBoardsForUser(user.id);
  return NextResponse.json(boards);
}

export async function POST(request: Request) {
  const user = await requireAppUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createBoardBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const board = await boardService.createBoardForUser({
    userId: user.id,
    title: parsed.data.title,
  });

  return NextResponse.json(board, { status: 201 });
}
