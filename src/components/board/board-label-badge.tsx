"use client";

import type { CardLabel } from "./board-labels";
import { LABEL_COLOR_META } from "./board-labels";

export function CardLabelBadge({
  label,
  className = "",
  onRemove,
}: {
  label: CardLabel;
  className?: string;
  onRemove?: () => void;
}) {
  const meta = LABEL_COLOR_META[label.color];
  if (label.kind === "preset") {
    return (
      <span
        className={`inline-flex max-w-full items-center ${className}`}
        title={meta.title}
      >
        <span
          className={`h-2 w-[4.25rem] max-w-[40%] min-w-[3rem] shrink-0 rounded-full ${meta.dotClass}`}
          aria-hidden
        />
      </span>
    );
  }
  return (
    <span
      className={`inline-flex max-w-full items-center gap-1 rounded-md px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide ${meta.pillClass} ${className}`}
    >
      <span className="min-w-0 truncate">{label.name}</span>
      {onRemove ? (
        <button
          type="button"
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-zinc-300/80 transition hover:bg-black/20 hover:text-white"
          aria-label="Remove label"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onRemove();
          }}
        >
          ×
        </button>
      ) : null}
    </span>
  );
}
