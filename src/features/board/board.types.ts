export type BoardJson = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export type ListJson = {
  id: string;
  boardId: string;
  title: string;
  position: number;
  createdAt: string;
  updatedAt: string;
};

export type CardJson = {
  id: string;
  listId: string;
  title: string;
  description: string | null;
  position: number;
  dueAt: string | null;
  remindAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BoardWorkspaceJson = {
  board: BoardJson;
  lists: ListJson[];
  cards: CardJson[];
};
