"use client";

import { restrictToHorizontalAxis, snapCenterToCursor } from "@dnd-kit/modifiers";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  closestCenter,
  useSensor,
  useSensors,
  type Active,
  type CollisionDetection,
  type DragEndEvent,
  type DragMoveEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { useUser } from "@clerk/nextjs";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";

import type { WorkspaceSaveBody } from "@/features/board/board.schema";
import type { BoardWorkspaceJson, CardJson } from "@/features/board/board.types";

import { computeBoardDropIndicators } from "./board-dnd-preview";
import {
  type ColumnMeta,
  type ColumnTasks,
  type KanbanColumnId,
  type KanbanTask,
  columnMetaForListTitle,
} from "./board-kanban-model";
import {
  BoardInboxSection,
  InboxCardPreview,
  WORKSPACE_INBOX_ZONE_ID,
  type InboxTask,
} from "./board-inbox";
import type { WorkspaceCustomLabel } from "./board-labels";
import { CardPreview, ColumnDragPreview, KanbanBoardSection } from "./board-kanban";

function readActiveCardHeightPx(active: Active): number | null {
  const initial = active.rect.current.initial;
  const h = initial?.height;
  if (h == null || !Number.isFinite(h) || h <= 0) {
    return null;
  }
  return Math.round(h);
}

function findKanbanContainer(
  columnOrder: string[],
  columns: ColumnTasks,
  id: string,
): KanbanColumnId | undefined {
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

function findKanbanTask(
  columnOrder: string[],
  columns: ColumnTasks,
  taskId: string,
): KanbanTask | undefined {
  for (const col of columnOrder) {
    const t = columns[col]?.find((c) => c.id === taskId);
    if (t) {
      return t;
    }
  }
  return undefined;
}

function findWorkspaceContainer(
  inboxTasks: InboxTask[],
  columnOrder: string[],
  columns: ColumnTasks,
  id: string,
): "inbox" | KanbanColumnId | undefined {
  if (id === WORKSPACE_INBOX_ZONE_ID) {
    return "inbox";
  }
  if (inboxTasks.some((t) => t.id === id)) {
    return "inbox";
  }
  return findKanbanContainer(columnOrder, columns, id);
}

function workspaceToUiState(workspace: BoardWorkspaceJson) {
  const listsSorted = [...workspace.lists].sort((a, b) => a.position - b.position);
  const inboxList = listsSorted[0];
  const kanbanLists = listsSorted.slice(1);
  if (!inboxList) {
    throw new Error("Board workspace has no lists");
  }
  const inboxListId = inboxList.id;
  const columnOrder = kanbanLists.map((l) => l.id);
  const columnMeta: Record<string, ColumnMeta> = {};
  kanbanLists.forEach((l, i) => {
    columnMeta[l.id] = columnMetaForListTitle(l.title, i);
  });
  const columns: ColumnTasks = {};
  for (const id of columnOrder) {
    columns[id] = [];
  }
  const cardsByList = new Map<string, CardJson[]>();
  for (const c of workspace.cards) {
    const arr = cardsByList.get(c.listId) ?? [];
    arr.push(c);
    cardsByList.set(c.listId, arr);
  }
  for (const [, arr] of cardsByList) {
    arr.sort((a, b) => a.position - b.position);
  }
  const inboxTasks: InboxTask[] = (cardsByList.get(inboxListId) ?? []).map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description ?? "",
    createdAt: c.createdAt,
  }));
  for (const listId of columnOrder) {
    columns[listId] = (cardsByList.get(listId) ?? []).map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description ?? "",
      tags: [] as string[],
      dueAt: c.dueAt ? c.dueAt.slice(0, 10) : undefined,
      createdAt: c.createdAt,
    }));
  }
  return {
    inboxListId,
    inboxListTitle: inboxList.title,
    inboxTasks,
    columnOrder,
    columnMeta,
    columns,
  };
}

function buildWorkspaceSavePayload(
  inboxListId: string,
  inboxListTitle: string,
  inboxTasks: InboxTask[],
  columnOrder: string[],
  columnMeta: Record<string, ColumnMeta>,
  columns: ColumnTasks,
): WorkspaceSaveBody {
  const lists: WorkspaceSaveBody["lists"] = [
    { id: inboxListId, title: inboxListTitle.trim() || "Inbox", position: 0 },
    ...columnOrder.map((id, index) => ({
      id,
      title: (columnMeta[id]?.title ?? "List").trim() || "List",
      position: index + 1,
    })),
  ];
  const cards: WorkspaceSaveBody["cards"] = [];
  inboxTasks.forEach((t, position) => {
    cards.push({
      id: t.id,
      listId: inboxListId,
      title: t.title.trim() || "Untitled",
      description: t.description.trim() ? t.description : null,
      position,
      dueAt: null,
    });
  });
  for (const listId of columnOrder) {
    const tasks = columns[listId] ?? [];
    tasks.forEach((t, position) => {
      const dueRaw = t.dueAt?.trim();
      const dueAt =
        dueRaw == null || dueRaw === ""
          ? null
          : new Date(`${dueRaw}T12:00:00.000Z`).toISOString();
      cards.push({
        id: t.id,
        listId: listId,
        title: t.title.trim() || "Untitled",
        description: t.description.trim() ? t.description : null,
        position,
        dueAt,
      });
    });
  }
  return { lists, cards };
}

type BoardWorkspaceProps = {
  workspace: BoardWorkspaceJson;
  onPersist: (body: WorkspaceSaveBody) => Promise<void>;
};

function createColumnAwareCollision(
  dragTypeRef: RefObject<"card" | "column" | null>,
  stateRef: RefObject<{ columnOrder: string[] }>,
): CollisionDetection {
  return (args) => {
    const columnOnly = {
      ...args,
      droppableContainers: args.droppableContainers.filter((c) =>
        stateRef.current.columnOrder.includes(String(c.id)),
      ),
    };

    if (dragTypeRef.current === "column") {
      const pw = pointerWithin(columnOnly);
      return pw.length > 0 ? pw : closestCenter(columnOnly);
    }

    const pw = pointerWithin(args);
    return pw.length > 0 ? pw : closestCenter(args);
  };
}

export function BoardWorkspace({ workspace, onPersist }: BoardWorkspaceProps) {
  const { user } = useUser();
  const defaultCardCreator = useMemo(
    () => ({
      creatorImageUrl: user?.imageUrl ?? undefined,
      creatorName:
        user?.fullName ??
        user?.primaryEmailAddress?.emailAddress ??
        undefined,
    }),
    [
      user?.imageUrl,
      user?.fullName,
      user?.primaryEmailAddress?.emailAddress,
    ],
  );
  const defaultCardCreatorRef = useRef(defaultCardCreator);
  useLayoutEffect(() => {
    defaultCardCreatorRef.current = defaultCardCreator;
  }, [defaultCardCreator]);

  const pack = useMemo(() => workspaceToUiState(workspace), [workspace]);

  const inboxListId = pack.inboxListId;
  const [inboxTasks, setInboxTasks] = useState(pack.inboxTasks);
  const [columns, setColumns] = useState(pack.columns);
  const [columnOrder, setColumnOrder] = useState(pack.columnOrder);
  const [columnMeta, setColumnMeta] = useState(pack.columnMeta);

  const skipNextPersist = useRef(true);
  useEffect(() => {
    if (skipNextPersist.current) {
      skipNextPersist.current = false;
      return;
    }
    const handle = setTimeout(() => {
      const payload = buildWorkspaceSavePayload(
        inboxListId,
        pack.inboxListTitle,
        inboxTasks,
        columnOrder,
        columnMeta,
        columns,
      );
      void onPersist(payload);
    }, 450);
    return () => clearTimeout(handle);
  }, [
    inboxListId,
    pack.inboxListTitle,
    inboxTasks,
    columnOrder,
    columnMeta,
    columns,
    onPersist,
  ]);

  const [dragSurfaceKind, setDragSurfaceKind] = useState<"card" | "column" | null>(
    null,
  );

  const [dndPointer, setDndPointer] = useState<{
    activeId: string | null;
    overId: string | null;
  }>({ activeId: null, overId: null });
  const [selectedKanbanColumnId, setSelectedKanbanColumnId] =
    useState<KanbanColumnId | null>(null);
  const [workspaceCustomLabels, setWorkspaceCustomLabels] = useState<
    WorkspaceCustomLabel[]
  >([]);

  const [dragSlotMinHeightPx, setDragSlotMinHeightPx] = useState<number | null>(
    null,
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const stateRef = useRef({ inboxTasks, columns, columnOrder });
  useLayoutEffect(() => {
    stateRef.current = { inboxTasks, columns, columnOrder };
  }, [inboxTasks, columns, columnOrder]);

  const dragTypeRef = useRef<"card" | "column" | null>(null);

  const columnAwareCollision = useMemo(
    () =>
      // eslint-disable-next-line react-hooks/refs -- refs read only when dnd-kit invokes collision
      createColumnAwareCollision(dragTypeRef, stateRef),
    [],
  );

  const dragSnapshotRef = useRef<{
    inboxTasks: InboxTask[];
    columns: ColumnTasks;
    columnOrder: string[];
  } | null>(null);

  const activeContainerRef = useRef<"inbox" | KanbanColumnId | null>(null);

  const activeDragTaskRef = useRef<{
    id: string;
    title: string;
    description: string;
    label?: InboxTask["label"];
    comments?: string[];
    tags: string[];
    dueAt?: string;
    createdAt?: string;
  } | null>(null);

  const activeId = dndPointer.activeId;

  const activeInboxTask = useMemo(
    () => (activeId ? inboxTasks.find((t) => t.id === activeId) : undefined),
    [activeId, inboxTasks],
  );

  const activeKanbanTask = useMemo(
    () =>
      activeId && dragSurfaceKind !== "column"
        ? findKanbanTask(columnOrder, columns, activeId)
        : undefined,
    [activeId, columnOrder, columns, dragSurfaceKind],
  );

  const activeColumnForDrag = useMemo(() => {
    if (!activeId || dragSurfaceKind !== "column") return undefined;
    return columnOrder.includes(activeId) ? activeId : undefined;
  }, [activeId, columnOrder, dragSurfaceKind]);

  const isColumnDrag = !!activeColumnForDrag;

  const dndContextModifiers = useMemo(
    () => (isColumnDrag ? [restrictToHorizontalAxis] : []),
    [isColumnDrag],
  );

  const overlayModifiers = useMemo(
    () =>
      isColumnDrag
        ? [snapCenterToCursor, restrictToHorizontalAxis]
        : [snapCenterToCursor],
    [isColumnDrag],
  );

  const dropIndicators = useMemo(
    () =>
      computeBoardDropIndicators(
        inboxTasks.map((t) => t.id),
        columns,
        columnOrder,
        dndPointer.activeId,
        dndPointer.overId,
      ),
    [inboxTasks, columns, columnOrder, dndPointer.activeId, dndPointer.overId],
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const id = String(event.active.id);

      const isColumnDrag = columnOrder.includes(id);
      dragTypeRef.current = isColumnDrag ? "column" : "card";
      setDragSurfaceKind(isColumnDrag ? "column" : "card");

      dragSnapshotRef.current = {
        inboxTasks: inboxTasks.map((t) => ({ ...t })),
        columns: Object.fromEntries(
          columnOrder.map((col) => [col, (columns[col] ?? []).map((t) => ({ ...t }))])
        ),
        columnOrder: [...columnOrder],
      };

      if (isColumnDrag) {
        activeContainerRef.current = null;
        activeDragTaskRef.current = null;
        setDragSlotMinHeightPx(null);
        setDndPointer({ activeId: id, overId: null });
        return;
      }

      activeContainerRef.current =
        findWorkspaceContainer(inboxTasks, columnOrder, columns, id) ?? null;

      const inboxT = inboxTasks.find((t) => t.id === id);
      const kanbanT = findKanbanTask(columnOrder, columns, id);
      activeDragTaskRef.current = {
        id,
        title: inboxT?.title ?? kanbanT?.title ?? "",
        description: inboxT?.description ?? kanbanT?.description ?? "",
        label: inboxT?.label ?? kanbanT?.label,
        comments: inboxT?.comments,
        tags: kanbanT?.tags ?? [],
        dueAt: kanbanT?.dueAt,
        createdAt: inboxT?.createdAt ?? kanbanT?.createdAt,
      };

      setDragSlotMinHeightPx(readActiveCardHeightPx(event.active));
      setDndPointer({ activeId: id, overId: null });
    },
    [inboxTasks, columns, columnOrder],
  );

  const handleDragMove = useCallback((event: DragMoveEvent) => {
    if (dragTypeRef.current === "column") return;

    setDragSlotMinHeightPx((prev) =>
      prev != null ? prev : readActiveCardHeightPx(event.active),
    );
    const nextActive = String(event.active.id);
    const nextOver = event.over ? String(event.over.id) : null;
    setDndPointer((prev) => {
      if (prev.activeId === nextActive && prev.overId === nextOver) {
        return prev;
      }
      return { activeId: nextActive, overId: nextOver };
    });
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    if (dragTypeRef.current === "column") {
      const activeIdStr = String(active.id);
      const overIdStr = String(over.id);
      if (activeIdStr === overIdStr) return;

      const curOrder = stateRef.current.columnOrder;
      if (!curOrder.includes(overIdStr)) return;
      const oldIdx = curOrder.indexOf(activeIdStr);
      const newIdx = curOrder.indexOf(overIdStr);
      if (oldIdx === -1 || newIdx === -1 || oldIdx === newIdx) return;

      setColumnOrder(arrayMove(curOrder, oldIdx, newIdx));
      return;
    }

    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);
    if (activeIdStr === overIdStr) return;

    const activeContainer = activeContainerRef.current;
    if (!activeContainer) return;

    const dragTask = activeDragTaskRef.current;
    if (!dragTask) return;

    const { inboxTasks: curInbox, columns: curColumns, columnOrder: curOrder } =
      stateRef.current;
    const overContainer = findWorkspaceContainer(
      curInbox,
      curOrder,
      curColumns,
      overIdStr,
    );
    if (!overContainer || activeContainer === overContainer) return;

    activeContainerRef.current = overContainer;

    if (activeContainer === "inbox") {
      const dc = defaultCardCreatorRef.current;
      const kanbanTask: KanbanTask = {
        id: dragTask.id,
        title: dragTask.title,
        description: dragTask.description,
        tags: dragTask.tags,
        label: dragTask.label,
        dueAt: dragTask.dueAt,
        createdAt: dragTask.createdAt ?? new Date().toISOString(),
        creatorImageUrl: dc.creatorImageUrl,
        creatorName: dc.creatorName,
      };
      setInboxTasks((prev) => prev.filter((t) => t.id !== activeIdStr));
      const targetCol = overContainer as KanbanColumnId;
      setColumns((prev) => {
        if (prev[targetCol]?.some((t) => t.id === activeIdStr)) return prev;
        const to = [...(prev[targetCol] ?? [])];
        if (curOrder.includes(overIdStr)) {
          to.push(kanbanTask);
        } else {
          const idx = to.findIndex((t) => t.id === overIdStr);
          to.splice(idx >= 0 ? idx : to.length, 0, kanbanTask);
        }
        return { ...prev, [targetCol]: to };
      });
      return;
    }

    if (overContainer === "inbox") {
      const inboxTask: InboxTask = {
        id: dragTask.id,
        title: dragTask.title,
        description: dragTask.description,
        label: dragTask.label,
        comments: dragTask.comments,
      };
      const srcCol = activeContainer as KanbanColumnId;
      setColumns((prev) => ({
        ...prev,
        [srcCol]: (prev[srcCol] ?? []).filter((t) => t.id !== activeIdStr),
      }));
      setInboxTasks((prev) => {
        if (prev.some((t) => t.id === activeIdStr)) return prev;
        if (overIdStr === WORKSPACE_INBOX_ZONE_ID) return [...prev, inboxTask];
        const idx = prev.findIndex((t) => t.id === overIdStr);
        if (idx >= 0) {
          const next = [...prev];
          next.splice(idx, 0, inboxTask);
          return next;
        }
        return [...prev, inboxTask];
      });
      return;
    }

    const fromCol = activeContainer as KanbanColumnId;
    const toCol = overContainer as KanbanColumnId;
    setColumns((prev) => {
      const task = (prev[fromCol] ?? []).find((t) => t.id === activeIdStr);
      if (!task) return prev;
      if ((prev[toCol] ?? []).some((t) => t.id === activeIdStr)) return prev;
      const from = (prev[fromCol] ?? []).filter((t) => t.id !== activeIdStr);
      const to = [...(prev[toCol] ?? [])];
      if (curOrder.includes(overIdStr)) {
        to.push(task);
      } else {
        const idx = to.findIndex((t) => t.id === overIdStr);
        to.splice(idx >= 0 ? idx : to.length, 0, task);
      }
      return { ...prev, [fromCol]: from, [toCol]: to };
    });
  }, []);

  const handleDragCancel = useCallback(() => {
    if (dragSnapshotRef.current) {
      setInboxTasks(dragSnapshotRef.current.inboxTasks);
      setColumns(dragSnapshotRef.current.columns);
      setColumnOrder(dragSnapshotRef.current.columnOrder);
    }
    dragSnapshotRef.current = null;
    activeContainerRef.current = null;
    activeDragTaskRef.current = null;
    dragTypeRef.current = null;
    setDragSurfaceKind(null);
    setDragSlotMinHeightPx(null);
    setDndPointer({ activeId: null, overId: null });
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    const wasColumnDrag = dragTypeRef.current === "column";
    const savedContainer = activeContainerRef.current;

    dragSnapshotRef.current = null;
    activeContainerRef.current = null;
    activeDragTaskRef.current = null;
    dragTypeRef.current = null;
    setDragSurfaceKind(null);
    setDragSlotMinHeightPx(null);
    setDndPointer({ activeId: null, overId: null });

    if (!over) return;

    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);
    if (activeIdStr === overIdStr) return;

    if (wasColumnDrag) return;

    if (!savedContainer) return;

    if (savedContainer === "inbox") {
      setInboxTasks((prev) => {
        const oldIdx = prev.findIndex((t) => t.id === activeIdStr);
        const newIdx = prev.findIndex((t) => t.id === overIdStr);
        if (oldIdx === -1 || newIdx === -1 || oldIdx === newIdx) return prev;
        return arrayMove(prev, oldIdx, newIdx);
      });
    } else {
      const col = savedContainer;
      setColumns((prev) => {
        const list = prev[col];
        if (!list) return prev;
        const oldIdx = list.findIndex((t) => t.id === activeIdStr);
        const newIdx = list.findIndex((t) => t.id === overIdStr);
        if (oldIdx === -1 || newIdx === -1 || oldIdx === newIdx) return prev;
        return { ...prev, [col]: arrayMove(list, oldIdx, newIdx) };
      });
    }
  }, []);

  const handleAddKanbanCard = useCallback(
    (columnId: KanbanColumnId, task: KanbanTask) => {
      const dc = defaultCardCreatorRef.current;
      const enriched: KanbanTask = {
        ...task,
        createdAt: task.createdAt ?? new Date().toISOString(),
        creatorImageUrl: task.creatorImageUrl ?? dc.creatorImageUrl,
        creatorName: task.creatorName ?? dc.creatorName,
      };
      setColumns((prev) => ({
        ...prev,
        [columnId]: [...(prev[columnId] ?? []), enriched],
      }));
    },
    [],
  );

  const handleRenameColumn = useCallback(
    (columnId: KanbanColumnId, title: string) => {
      setColumnMeta((prev) => {
        const existing = prev[columnId];
        if (!existing) return prev;
        return { ...prev, [columnId]: { ...existing, title } };
      });
    },
    [],
  );

  const handleAddColumn = useCallback(
    (title: string, accent: { accentBarClass: string; columnShellClass: string }) => {
      const id = crypto.randomUUID();
      setColumnOrder((prev) => [...prev, id]);
      setColumnMeta((prev) => ({
        ...prev,
        [id]: { title, ...accent },
      }));
      setColumns((prev) => ({ ...prev, [id]: [] }));
    },
    [],
  );

  const handleRenameKanbanCard = useCallback(
    (columnId: KanbanColumnId, taskId: string, title: string) => {
      setColumns((prev) => {
        const list = prev[columnId];
        if (!list) return prev;
        return { ...prev, [columnId]: list.map((t) => (t.id === taskId ? { ...t, title } : t)) };
      });
    },
    [],
  );

  const handleUpdateKanbanCard = useCallback(
    (columnId: KanbanColumnId, task: KanbanTask) => {
      setColumns((prev) => {
        const list = prev[columnId];
        if (!list) return prev;
        return { ...prev, [columnId]: list.map((t) => (t.id === task.id ? task : t)) };
      });
    },
    [],
  );

  const handleDeleteKanbanCard = useCallback(
    (columnId: KanbanColumnId, taskId: string) => {
      setColumns((prev) => {
        const list = prev[columnId];
        if (!list) return prev;
        return { ...prev, [columnId]: list.filter((t) => t.id !== taskId) };
      });
    },
    [],
  );

  const handleDuplicateKanbanCard = useCallback(
    (columnId: KanbanColumnId, task: KanbanTask) => {
      const copy: KanbanTask = {
        ...task,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      setColumns((prev) => ({
        ...prev,
        [columnId]: [...(prev[columnId] ?? []), copy],
      }));
    },
    [],
  );

  const handleAddInboxTask = useCallback((task: InboxTask) => {
    setInboxTasks((prev) => [...prev, task]);
  }, []);

  const handleUpdateInboxTask = useCallback((updated: InboxTask) => {
    setInboxTasks((prev) =>
      prev.map((t) => (t.id === updated.id ? updated : t)),
    );
  }, []);

  const handleDeleteInboxTask = useCallback((id: string) => {
    setInboxTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleDuplicateInboxTask = useCallback((task: InboxTask) => {
    if (selectedKanbanColumnId) {
      const dc = defaultCardCreatorRef.current;
      const kanbanTask: KanbanTask = {
        id: crypto.randomUUID(),
        title: task.title,
        description: task.description,
        tags: [],
        label: task.label,
        dueAt: undefined,
        createdAt: task.createdAt ?? new Date().toISOString(),
        creatorImageUrl: dc.creatorImageUrl,
        creatorName: dc.creatorName,
      };
      setColumns((prev) => ({
        ...prev,
        [selectedKanbanColumnId]: [
          ...(prev[selectedKanbanColumnId] ?? []),
          kanbanTask,
        ],
      }));
      return;
    }
    const copy: InboxTask = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      comments: task.comments?.length ? [...task.comments] : undefined,
    };
    setInboxTasks((prev) => [...prev, copy]);
  }, [selectedKanbanColumnId]);

  const handleSelectKanbanColumn = useCallback((columnId: KanbanColumnId) => {
    setSelectedKanbanColumnId((prev) =>
      prev === columnId ? null : columnId,
    );
  }, []);

  const handleAddWorkspaceCustomLabel = useCallback(
    (entry: WorkspaceCustomLabel) => {
      setWorkspaceCustomLabels((prev) => {
        if (prev.some((p) => p.id === entry.id)) {
          return prev;
        }
        return [...prev, entry];
      });
    },
    [],
  );

  const columnDropIndicators = useMemo(() => {
    const out: Record<string, number | null> = {};
    for (const col of columnOrder) {
      out[col] = dropIndicators[col] ?? null;
    }
    return out;
  }, [columnOrder, dropIndicators]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={columnAwareCollision}
      modifiers={dndContextModifiers}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragOver={handleDragOver}
      onDragCancel={handleDragCancel}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col gap-6 transition-colors duration-300 lg:flex-row lg:items-start">
        <BoardInboxSection
          tasks={inboxTasks}
          onAddInboxTask={handleAddInboxTask}
          onUpdateInboxTask={handleUpdateInboxTask}
          onDeleteInboxTask={handleDeleteInboxTask}
          onDuplicateInboxTask={handleDuplicateInboxTask}
          workspaceCustomLabels={workspaceCustomLabels}
          onAddWorkspaceCustomLabel={handleAddWorkspaceCustomLabel}
          dropIndicatorIndex={dropIndicators.inbox}
          dropSlotMinHeightPx={dragSlotMinHeightPx}
        />
        <div className="min-w-0 flex-1">
          <KanbanBoardSection
            columns={columns}
            columnOrder={columnOrder}
            columnMeta={columnMeta}
            onAddCard={handleAddKanbanCard}
            selectedColumnId={selectedKanbanColumnId}
            onSelectColumn={handleSelectKanbanColumn}
            onRenameColumn={handleRenameColumn}
            onAddColumn={handleAddColumn}
            onRenameCard={handleRenameKanbanCard}
            onUpdateCard={handleUpdateKanbanCard}
            onDeleteCard={handleDeleteKanbanCard}
            onDuplicateCard={handleDuplicateKanbanCard}
            workspaceCustomLabels={workspaceCustomLabels}
            onAddWorkspaceCustomLabel={handleAddWorkspaceCustomLabel}
            columnDropIndicators={columnDropIndicators}
            dropSlotMinHeightPx={dragSlotMinHeightPx}
          />
        </div>
      </div>
      <DragOverlay dropAnimation={null} modifiers={overlayModifiers}>
        {activeColumnForDrag && columnMeta[activeColumnForDrag] ? (
          <ColumnDragPreview
            title={columnMeta[activeColumnForDrag].title}
            taskCount={(columns[activeColumnForDrag] ?? []).length}
          />
        ) : activeInboxTask ? (
          <InboxCardPreview task={activeInboxTask} />
        ) : activeKanbanTask ? (
          <CardPreview task={activeKanbanTask} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
