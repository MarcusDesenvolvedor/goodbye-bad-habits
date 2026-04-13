/** Shared easing for list reflow while dragging — keeps sibling cards sliding instead of snapping. */
export const BOARD_SORTABLE_TRANSITION = {
  duration: 150,
  easing: "cubic-bezier(0.25, 1, 0.45, 1)",
} as const;
