import type { ColumnTasks, KanbanColumnId } from "./board-kanban-mock";
import { KANBAN_COLUMN_ORDER } from "./board-kanban-mock";

/** Keep in sync with `WORKSPACE_INBOX_ZONE_ID` in `board-inbox.tsx`. */
const INBOX_DROP_ZONE_ID = "workspace-inbox-zone";

function findContainer(
  inboxIds: string[],
  columns: ColumnTasks,
  id: string,
): "inbox" | KanbanColumnId | undefined {
  if (id === INBOX_DROP_ZONE_ID) {
    return "inbox";
  }
  if (inboxIds.includes(id)) {
    return "inbox";
  }
  if (KANBAN_COLUMN_ORDER.includes(id as KanbanColumnId)) {
    return id as KanbanColumnId;
  }
  for (const col of KANBAN_COLUMN_ORDER) {
    if (columns[col].some((t) => t.id === id)) {
      return col;
    }
  }
  return undefined;
}

export type BoardDropIndicators = {
  inbox: number | null;
} & Record<KanbanColumnId, number | null>;

const emptyIndicators = (): BoardDropIndicators => ({
  inbox: null,
  todo: null,
  "in-progress": null,
  done: null,
});

/**
 * Insertion index for a horizontal “drop here” line before the card at that index
 * (or before the trailing slot when index === list.length).
 */
export function computeBoardDropIndicators(
  inboxIds: string[],
  columns: ColumnTasks,
  activeId: string | null,
  overId: string | null,
): BoardDropIndicators {
  if (!activeId || !overId) {
    return emptyIndicators();
  }

  const activeContainer = findContainer(inboxIds, columns, activeId);
  const overContainer = findContainer(inboxIds, columns, overId);
  if (!activeContainer || !overContainer) {
    return emptyIndicators();
  }

  const out = emptyIndicators();

  function setInbox(index: number | null) {
    out.inbox = index;
  }

  function setColumn(col: KanbanColumnId, index: number | null) {
    out[col] = index;
  }

  // Preview only on the list that would receive the drop (or reorder target).
  if (activeContainer === overContainer) {
    if (activeContainer === "inbox") {
      if (activeId === overId) {
        return out;
      }
      if (overId === INBOX_DROP_ZONE_ID) {
        setInbox(inboxIds.length);
        return out;
      }
      const overIdx = inboxIds.indexOf(overId);
      if (overIdx >= 0) {
        setInbox(overIdx);
      }
      return out;
    }

    const col = activeContainer;
    const ids = columns[col].map((t) => t.id);
    if (activeId === overId) {
      return out;
    }
    if (overId === col) {
      setColumn(col, ids.length);
      return out;
    }
    const overIdx = ids.indexOf(overId);
    if (overIdx >= 0) {
      setColumn(col, overIdx);
    }
    return out;
  }

  // Cross-container: show indicator only on the target column / inbox.
  if (overContainer === "inbox") {
    if (overId === INBOX_DROP_ZONE_ID) {
      setInbox(inboxIds.length);
    } else {
      const overIdx = inboxIds.indexOf(overId);
      if (overIdx >= 0) {
        setInbox(overIdx);
      }
    }
    return out;
  }

  const col = overContainer;
  const ids = columns[col].map((t) => t.id);
  if (overId === col) {
    setColumn(col, ids.length);
  } else {
    const overIdx = ids.indexOf(overId);
    if (overIdx >= 0) {
      setColumn(col, overIdx);
    }
  }
  return out;
}
