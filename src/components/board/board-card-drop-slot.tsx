"use client";

/**
 * Reserved drop slot: mirrors inbox/kanban card surface tokens
 * (radius, padding, bg, shadow, blur), with dashed outline + `opacity-50` for the
 * “empty seat” affordance. Keep in sync when card shells change.
 */
const BOARD_CARD_DROP_SLOT_CLASS =
  "pointer-events-none box-border w-full shrink-0 touch-none rounded-xl border border-dashed border-cyan-400/50 bg-zinc-900/80 p-3 shadow-[0_0_20px_rgba(0,0,0,0.35)] backdrop-blur-sm opacity-50";

const DEFAULT_MIN_HEIGHT_PX = 88;

export function BoardCardDropSlot({
  minHeightPx,
}: {
  /** Height of the dragged card (`active.rect.current.initial.height`) when available. */
  minHeightPx?: number | null;
}) {
  const h =
    minHeightPx != null && Number.isFinite(minHeightPx) && minHeightPx > 0
      ? Math.round(minHeightPx)
      : DEFAULT_MIN_HEIGHT_PX;

  return (
    <div
      role="presentation"
      aria-hidden
      className={BOARD_CARD_DROP_SLOT_CLASS}
      style={{ minHeight: h }}
    />
  );
}
