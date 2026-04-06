export type KanbanColumnId = "todo" | "in-progress" | "done";

export type KanbanTask = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  dueAt?: string;
};

export type ColumnTasks = Record<KanbanColumnId, KanbanTask[]>;

export const KANBAN_COLUMN_ORDER: KanbanColumnId[] = [
  "todo",
  "in-progress",
  "done",
];

export const KANBAN_COLUMN_META: Record<
  KanbanColumnId,
  { title: string; accentClass: string }
> = {
  todo: { title: "To do", accentClass: "bg-[#e11d48]" },
  "in-progress": { title: "In progress", accentClass: "bg-[#2563eb]" },
  done: { title: "Done", accentClass: "bg-[#ca8a04]" },
};

export function createMockKanbanColumns(): ColumnTasks {
  return {
    todo: [
      {
        id: "mock-task-1",
        title: "Plan sprint",
        description: "Outline goals and backlog for the week.",
        tags: ["planning", "team"],
        dueAt: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
      },
      {
        id: "mock-task-2",
        title: "Review habits",
        description: "Quick check-in on streaks and blockers.",
        tags: ["habits"],
      },
    ],
    "in-progress": [
      {
        id: "mock-task-3",
        title: "Build Kanban UI",
        description: "Drag cards between columns with mock data.",
        tags: ["frontend", "ux"],
        dueAt: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
      },
    ],
    done: [
      {
        id: "mock-task-4",
        title: "Sign in flow",
        description: "Clerk auth wired for protected routes.",
        tags: ["auth"],
      },
    ],
  };
}
