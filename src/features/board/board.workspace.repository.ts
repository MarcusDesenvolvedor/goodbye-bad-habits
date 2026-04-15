import { prisma } from "@/lib/prisma";

const DEFAULT_LIST_SEED: readonly { title: string; position: number }[] = [
  { title: "Inbox", position: 0 },
  { title: "To do", position: 1 },
  { title: "In progress", position: 2 },
  { title: "Done", position: 3 },
];

export async function countListsForBoard(boardId: string): Promise<number> {
  return prisma.list.count({ where: { boardId } });
}

export async function seedDefaultLists(boardId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const n = await tx.list.count({ where: { boardId } });
    if (n > 0) {
      return;
    }
    for (const row of DEFAULT_LIST_SEED) {
      await tx.list.create({
        data: { boardId, title: row.title, position: row.position },
      });
    }
  });
}

export async function findListsForBoard(boardId: string) {
  return prisma.list.findMany({
    where: { boardId },
    orderBy: { position: "asc" },
  });
}

export async function findCardsForBoard(boardId: string) {
  return prisma.card.findMany({
    where: { list: { boardId } },
    orderBy: [{ listId: "asc" }, { position: "asc" }],
  });
}

export type WorkspaceListWrite = {
  id: string;
  title: string;
  position: number;
};

export type WorkspaceCardWrite = {
  id: string;
  listId: string;
  title: string;
  description: string | null;
  position: number;
  dueAt: Date | null;
};

export async function replaceBoardWorkspace(
  boardId: string,
  lists: WorkspaceListWrite[],
  cards: WorkspaceCardWrite[],
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const existingLists = await tx.list.findMany({ where: { boardId } });
    const existingListIds = new Set(existingLists.map((l) => l.id));
    const incomingListIds = new Set(lists.map((l) => l.id));

    for (const list of lists) {
      if (existingListIds.has(list.id)) {
        await tx.list.update({
          where: { id: list.id },
          data: { title: list.title, position: list.position },
        });
      } else {
        await tx.list.create({
          data: {
            id: list.id,
            boardId,
            title: list.title,
            position: list.position,
          },
        });
      }
    }

    const existingCards = await tx.card.findMany({
      where: { list: { boardId } },
    });
    const incomingCardIds = new Set(cards.map((c) => c.id));

    for (const card of cards) {
      await tx.card.upsert({
        where: { id: card.id },
        create: {
          id: card.id,
          listId: card.listId,
          title: card.title,
          description: card.description,
          position: card.position,
          dueAt: card.dueAt,
        },
        update: {
          listId: card.listId,
          title: card.title,
          description: card.description,
          position: card.position,
          dueAt: card.dueAt,
        },
      });
    }

    for (const card of existingCards) {
      if (!incomingCardIds.has(card.id)) {
        await tx.card.delete({ where: { id: card.id } });
      }
    }

    for (const list of existingLists) {
      if (!incomingListIds.has(list.id)) {
        await tx.list.delete({ where: { id: list.id } });
      }
    }
  });
}
