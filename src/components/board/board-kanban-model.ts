import type { CardLabel } from "./board-labels";

export type KanbanColumnId = string;

export type KanbanTask = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  label?: CardLabel;
  dueAt?: string;
  creatorImageUrl?: string;
  creatorName?: string;
};

export type ColumnTasks = Record<string, KanbanTask[]>;

export type ColumnMeta = {
  title: string;
  accentBarClass: string;
  columnShellClass: string;
};

const STITCH_COLUMN_LAYOUT =
  "flex w-[min(100%,280px)] shrink-0 min-h-0 flex-col gap-6";

export const NEW_LIST_ACCENT_POOL: Omit<ColumnMeta, "title">[] = [
  { accentBarClass: "", columnShellClass: STITCH_COLUMN_LAYOUT },
  { accentBarClass: "", columnShellClass: STITCH_COLUMN_LAYOUT },
  { accentBarClass: "", columnShellClass: STITCH_COLUMN_LAYOUT },
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
    accentBarClass: "",
    columnShellClass: STITCH_COLUMN_LAYOUT,
  },
  {
    name: "Cyan",
    dotClass: "bg-ds-primary-container",
    accentBarClass: "",
    columnShellClass: STITCH_COLUMN_LAYOUT,
  },
  {
    name: "Violet",
    dotClass: "bg-ds-on-primary-fixed-variant",
    accentBarClass: "",
    columnShellClass: STITCH_COLUMN_LAYOUT,
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

export function columnMetaForListTitle(
  title: string,
  presetIndex: number,
): ColumnMeta {
  const preset = LIST_COLOR_PRESETS[presetIndex % LIST_COLOR_PRESETS.length];
  return {
    title,
    accentBarClass: preset.accentBarClass,
    columnShellClass: preset.columnShellClass,
  };
}
