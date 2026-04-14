import type { CardLabel } from "./board-labels";

export type KanbanColumnId = string;

export type KanbanTask = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  /** Structured label; preserved when moving cards across inbox and columns */
  label?: CardLabel;
  dueAt?: string;
};

export type ColumnTasks = Record<string, KanbanTask[]>;

export type ColumnMeta = {
  title: string;
  accentBarClass: string;
  columnShellClass: string;
};

/** Stitch Etheric Kanban — tonal lanes (surface_container_low), no heavy borders */
const EDITORIAL_COLUMN =
  "rounded-xl bg-ds-surface-container-low shadow-[0_1px_3px_rgba(26,28,28,0.06)]";

export const KANBAN_COLUMN_ORDER: string[] = [
  "todo",
  "in-progress",
  "done",
];

export const KANBAN_COLUMN_META: Record<string, ColumnMeta> = {
  todo: {
    title: "To do",
    accentBarClass: "h-1 w-full shrink-0 opacity-0",
    columnShellClass: EDITORIAL_COLUMN,
  },
  "in-progress": {
    title: "In progress",
    accentBarClass: "h-1 w-full shrink-0 opacity-0",
    columnShellClass: EDITORIAL_COLUMN,
  },
  done: {
    title: "Done",
    accentBarClass: "h-1 w-full shrink-0 opacity-0",
    columnShellClass: EDITORIAL_COLUMN,
  },
};

export const NEW_LIST_ACCENT_POOL: Omit<ColumnMeta, "title">[] = [
  {
    accentBarClass: "h-1 w-full shrink-0 stitch-accent-bar opacity-90",
    columnShellClass: EDITORIAL_COLUMN,
  },
  {
    accentBarClass:
      "h-1 w-full shrink-0 bg-gradient-to-r from-ds-primary-container to-ds-primary opacity-85",
    columnShellClass: EDITORIAL_COLUMN,
  },
  {
    accentBarClass: "h-1 w-full shrink-0 bg-ds-primary-fixed",
    columnShellClass: EDITORIAL_COLUMN,
  },
];

export const TAG_PILL_CLASSES = [
  "bg-ds-secondary-fixed text-ds-on-secondary-fixed-variant text-[0.65rem] font-bold uppercase tracking-wide",
  "bg-ds-primary-fixed text-ds-on-primary-fixed-variant text-[0.65rem] font-bold uppercase tracking-wide",
  "bg-ds-secondary-container text-ds-on-secondary-container text-[0.65rem] font-bold uppercase tracking-wide",
] as const;

export type ListColorPreset = {
  name: string;
  dotClass: string;
  accentBarClass: string;
  columnShellClass: string;
};

export const LIST_COLOR_PRESETS: ListColorPreset[] = [
  {
    name: "Blue",
    dotClass: "bg-ds-primary",
    accentBarClass: KANBAN_COLUMN_META.todo.accentBarClass,
    columnShellClass: KANBAN_COLUMN_META.todo.columnShellClass,
  },
  {
    name: "Cyan",
    dotClass: "bg-ds-primary-container",
    accentBarClass: KANBAN_COLUMN_META["in-progress"].accentBarClass,
    columnShellClass: KANBAN_COLUMN_META["in-progress"].columnShellClass,
  },
  {
    name: "Violet",
    dotClass: "bg-ds-on-primary-fixed-variant",
    accentBarClass: KANBAN_COLUMN_META.done.accentBarClass,
    columnShellClass: KANBAN_COLUMN_META.done.columnShellClass,
  },
  {
    name: "Emerald",
    dotClass: "bg-emerald-500",
    accentBarClass: NEW_LIST_ACCENT_POOL[0].accentBarClass,
    columnShellClass: NEW_LIST_ACCENT_POOL[0].columnShellClass,
  },
  {
    name: "Amber",
    dotClass: "bg-amber-500",
    accentBarClass: NEW_LIST_ACCENT_POOL[1].accentBarClass,
    columnShellClass: NEW_LIST_ACCENT_POOL[1].columnShellClass,
  },
  {
    name: "Rose",
    dotClass: "bg-rose-400",
    accentBarClass: NEW_LIST_ACCENT_POOL[2].accentBarClass,
    columnShellClass: NEW_LIST_ACCENT_POOL[2].columnShellClass,
  },
];

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
