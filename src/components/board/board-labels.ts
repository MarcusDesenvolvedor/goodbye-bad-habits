export type LabelColor =
  | "green"
  | "yellow"
  | "orange"
  | "red"
  | "purple"
  | "blue";

/** Card label: preset is color-only; custom includes title from the workspace palette */
export type CardLabel =
  | { kind: "preset"; color: LabelColor }
  | { kind: "custom"; id: string; name: string; color: LabelColor };

export type WorkspaceCustomLabel = {
  id: string;
  name: string;
  color: LabelColor;
};

export const LABEL_COLOR_META: Record<
  LabelColor,
  { title: string; pillClass: string; dotClass: string }
> = {
  green: {
    title: "Green",
    pillClass:
      "border border-emerald-400/50 bg-emerald-500/15 text-emerald-100 shadow-[0_0_10px_rgba(16,185,129,0.2)]",
    dotClass: "bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]",
  },
  yellow: {
    title: "Yellow",
    pillClass:
      "border border-yellow-400/50 bg-yellow-500/15 text-yellow-100 shadow-[0_0_10px_rgba(234,179,8,0.2)]",
    dotClass: "bg-yellow-400 shadow-[0_0_8px_rgba(234,179,8,0.55)]",
  },
  orange: {
    title: "Orange",
    pillClass:
      "border border-orange-400/50 bg-orange-500/15 text-orange-100 shadow-[0_0_10px_rgba(249,115,22,0.2)]",
    dotClass: "bg-orange-400 shadow-[0_0_8px_rgba(249,115,22,0.55)]",
  },
  red: {
    title: "Red",
    pillClass:
      "border border-red-400/50 bg-red-500/15 text-red-100 shadow-[0_0_10px_rgba(248,113,113,0.2)]",
    dotClass: "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.55)]",
  },
  purple: {
    title: "Purple",
    pillClass:
      "border border-violet-400/50 bg-violet-500/15 text-violet-200 shadow-[0_0_10px_rgba(167,139,250,0.2)]",
    dotClass: "bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.55)]",
  },
  blue: {
    title: "Blue",
    pillClass:
      "border border-blue-400/50 bg-blue-500/15 text-sky-200 shadow-[0_0_10px_rgba(59,130,246,0.2)]",
    dotClass: "bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.55)]",
  },
};

export const LABEL_COLOR_ORDER: LabelColor[] = [
  "green",
  "yellow",
  "orange",
  "red",
  "purple",
  "blue",
];

export function labelsMatch(
  a: CardLabel | undefined,
  b: CardLabel | undefined,
) {
  if (a === b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  if (a.kind !== b.kind) {
    return false;
  }
  if (a.kind === "preset" && b.kind === "preset") {
    return a.color === b.color;
  }
  if (a.kind === "custom" && b.kind === "custom") {
    return a.id === b.id;
  }
  return false;
}
