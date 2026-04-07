import type { CardLabel } from "./board-labels";

export type KanbanColumnId = "todo" | "in-progress" | "done";

export type KanbanTask = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  /** Structured label; preserved when moving cards across inbox and columns */
  label?: CardLabel;
  dueAt?: string;
};

export type ColumnTasks = Record<KanbanColumnId, KanbanTask[]>;

export const KANBAN_COLUMN_ORDER: KanbanColumnId[] = [
  "todo",
  "in-progress",
  "done",
];

/** Column chrome aligned with Stitch preview: neon blue columns + purple “review-style” accent for done. */
export const KANBAN_COLUMN_META: Record<
  KanbanColumnId,
  { title: string; accentBarClass: string; columnShellClass: string }
> = {
  todo: {
    title: "To do",
    accentBarClass:
      "bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-400 opacity-90 shadow-[0_0_12px_rgba(59,130,246,0.5)]",
    columnShellClass:
      "rounded-2xl border border-blue-400/35 bg-zinc-900/45 shadow-[0_0_36px_rgba(59,130,246,0.14)] backdrop-blur-md",
  },
  "in-progress": {
    title: "In progress",
    accentBarClass:
      "bg-gradient-to-r from-blue-600 via-blue-400 to-cyan-300 opacity-90 shadow-[0_0_12px_rgba(34,211,238,0.45)]",
    columnShellClass:
      "rounded-2xl border border-sky-400/35 bg-zinc-900/45 shadow-[0_0_36px_rgba(34,211,238,0.12)] backdrop-blur-md",
  },
  done: {
    title: "Done",
    accentBarClass:
      "bg-gradient-to-r from-violet-500 via-purple-400 to-fuchsia-400 opacity-90 shadow-[0_0_12px_rgba(167,139,250,0.5)]",
    columnShellClass:
      "rounded-2xl border border-violet-400/35 bg-zinc-900/45 shadow-[0_0_36px_rgba(167,139,250,0.16)] backdrop-blur-md",
  },
};

export const TAG_PILL_CLASSES = [
  "border border-blue-400/45 bg-blue-500/15 text-sky-200 shadow-[0_0_10px_rgba(59,130,246,0.2)]",
  "border border-cyan-400/40 bg-cyan-500/10 text-cyan-100 shadow-[0_0_10px_rgba(34,211,238,0.15)]",
  "border border-violet-400/45 bg-violet-500/15 text-violet-200 shadow-[0_0_10px_rgba(167,139,250,0.2)]",
] as const;

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
