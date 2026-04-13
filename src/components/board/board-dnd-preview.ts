import type { ColumnTasks, KanbanColumnId } from "./board-kanban-mock";

/** Keep in sync with `WORKSPACE_INBOX_ZONE_ID` in `board-inbox.tsx`. */
const INBOX_DROP_ZONE_ID = "workspace-inbox-zone";

function findContainer(
  inboxIds: string[],
  columns: ColumnTasks,
  columnOrder: string[],
  id: string,
): "inbox" | KanbanColumnId | undefined {
  if (id === INBOX_DROP_ZONE_ID) {
    return "inbox";
  }
  if (inboxIds.includes(id)) {
    return "inbox";
  }
  if (columnOrder.includes(id)) {
    return id;
  }
  for (const col of columnOrder) {
    if (columns[col]?.some((t) => t.id === id)) {
      return col;
    }
  }
  return undefined;
}

export type BoardDropIndicators = {
  inbox: number | null;
} & Record<string, number | null>;

const emptyIndicators = (columnOrder: string[]): BoardDropIndicators => {
  const out: BoardDropIndicators = { inbox: null };
  for (const col of columnOrder) {
    out[col] = null;
  }
  return out;
};

/**
 * Insertion index for a horizontal "drop here" line before the card at that index
 * (or before the trailing slot when index === list.length).
 */
export function computeBoardDropIndicators(
  inboxIds: string[],
  columns: ColumnTasks,
  columnOrder: string[],
  activeId: string | null,
  overId: string | null,
): BoardDropIndicators {
  if (!activeId || !overId) {
    return emptyIndicators(columnOrder);
  }

  const activeContainer = findContainer(inboxIds, columns, columnOrder, activeId);
  const overContainer = findContainer(inboxIds, columns, columnOrder, overId);
  if (!activeContainer || !overContainer) {
    return emptyIndicators(columnOrder);
  }

  const out = emptyIndicators(columnOrder);

  if (activeContainer === overContainer) {
    return out;
  }

  if (overContainer === "inbox") {
    if (overId === INBOX_DROP_ZONE_ID) {
      out.inbox = inboxIds.length;
    } else {
      const overIdx = inboxIds.indexOf(overId);
      if (overIdx >= 0) {
        out.inbox = overIdx;
      }
    }
    return out;
  }

  const col = overContainer;
  const ids = (columns[col] ?? []).map((t) => t.id);
  if (overId === col) {
    out[col] = ids.length;
  } else {
    const overIdx = ids.indexOf(overId);
    if (overIdx >= 0) {
      out[col] = overIdx;
    }
  }
  return out;
}
