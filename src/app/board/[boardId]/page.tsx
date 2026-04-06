import { BoardViewClient } from "@/components/board/board-view-client";

export default async function BoardPage({
  params,
}: {
  params: Promise<{ boardId: string }>;
}) {
  const { boardId } = await params;
  return <BoardViewClient boardId={boardId} />;
}
