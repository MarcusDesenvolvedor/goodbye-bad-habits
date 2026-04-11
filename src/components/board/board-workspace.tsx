"use client";

import { snapCenterToCursor } from "@dnd-kit/modifiers";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type Active,
  type DragEndEvent,
  type DragMoveEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { useCallback, useMemo, useRef, useState } from "react";

import { computeBoardDropIndicators } from "./board-dnd-preview";
import {
  type ColumnTasks,
  type KanbanColumnId,
  type KanbanTask,
  KANBAN_COLUMN_ORDER,
  createMockKanbanColumns,
} from "./board-kanban-mock";
import {
  BoardInboxSection,
  InboxCardPreview,
  WORKSPACE_INBOX_ZONE_ID,
  type InboxTask,
} from "./board-inbox";
import type { WorkspaceCustomLabel } from "./board-labels";
import { CardPreview, KanbanBoardSection } from "./board-kanban";

function readActiveCardHeightPx(active: Active): number | null {
  const initial = active.rect.current.initial;
  const h = initial?.height;
  if (h == null || !Number.isFinite(h) || h <= 0) {
    return null;
  }
  return Math.round(h);
}

function findKanbanContainer(
  columns: ColumnTasks,
  id: string,
): KanbanColumnId | undefined {
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

function findKanbanTask(
  columns: ColumnTasks,
  taskId: string,
): KanbanTask | undefined {
  for (const col of KANBAN_COLUMN_ORDER) {
    const t = columns[col].find((c) => c.id === taskId);
    if (t) {
      return t;
    }
  }
  return undefined;
}

function findWorkspaceContainer(
  inboxTasks: InboxTask[],
  columns: ColumnTasks,
  id: string,
): "inbox" | KanbanColumnId | undefined {
  if (id === WORKSPACE_INBOX_ZONE_ID) {
    return "inbox";
  }
  if (inboxTasks.some((t) => t.id === id)) {
    return "inbox";
  }
  return findKanbanContainer(columns, id);
}

export function BoardWorkspace() {
  const [inboxTasks, setInboxTasks] = useState<InboxTask[]>(() => [
    {
      id: "inbox-task-1",
      title: "Review notes",
      description: "From the last planning session.",
    },
    {
      id: "inbox-task-2",
      title: "Follow up email",
      description: "",
    },
    {
      id: "inbox-task-3",
      title: "Habit streak widget",
      description: "Sketch states for empty vs active streak.",
    },
  ]);

  const [columns, setColumns] = useState<ColumnTasks>(() =>
    createMockKanbanColumns(),
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

  const stateRef = useRef({ inboxTasks, columns });
  stateRef.current = { inboxTasks, columns };

  const dragSnapshotRef = useRef<{
    inboxTasks: InboxTask[];
    columns: ColumnTasks;
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
  } | null>(null);

  const activeId = dndPointer.activeId;

  const activeInboxTask = useMemo(
    () => (activeId ? inboxTasks.find((t) => t.id === activeId) : undefined),
    [activeId, inboxTasks],
  );

  const activeKanbanTask = useMemo(
    () => (activeId ? findKanbanTask(columns, activeId) : undefined),
    [activeId, columns],
  );

  const dropIndicators = useMemo(
    () =>
      computeBoardDropIndicators(
        inboxTasks.map((t) => t.id),
        columns,
        dndPointer.activeId,
        dndPointer.overId,
      ),
    [inboxTasks, columns, dndPointer.activeId, dndPointer.overId],
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const id = String(event.active.id);

      dragSnapshotRef.current = {
        inboxTasks: inboxTasks.map((t) => ({ ...t })),
        columns: {
          todo: columns.todo.map((t) => ({ ...t })),
          "in-progress": columns["in-progress"].map((t) => ({ ...t })),
          done: columns.done.map((t) => ({ ...t })),
        },
      };

      activeContainerRef.current =
        findWorkspaceContainer(inboxTasks, columns, id) ?? null;

      const inboxT = inboxTasks.find((t) => t.id === id);
      const kanbanT = findKanbanTask(columns, id);
      activeDragTaskRef.current = {
        id,
        title: inboxT?.title ?? kanbanT?.title ?? "",
        description: inboxT?.description ?? kanbanT?.description ?? "",
        label: inboxT?.label ?? kanbanT?.label,
        comments: inboxT?.comments,
        tags: kanbanT?.tags ?? [],
        dueAt: kanbanT?.dueAt,
      };

      setDragSlotMinHeightPx(readActiveCardHeightPx(event.active));
      setDndPointer({ activeId: id, overId: null });
    },
    [inboxTasks, columns],
  );

  const handleDragMove = useCallback((event: DragMoveEvent) => {
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

    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);
    if (activeIdStr === overIdStr) return;

    const activeContainer = activeContainerRef.current;
    if (!activeContainer) return;

    const dragTask = activeDragTaskRef.current;
    if (!dragTask) return;

    const { inboxTasks: curInbox, columns: curColumns } = stateRef.current;
    const overContainer = findWorkspaceContainer(curInbox, curColumns, overIdStr);
    if (!overContainer || activeContainer === overContainer) return;

    activeContainerRef.current = overContainer;

    if (activeContainer === "inbox") {
      const kanbanTask: KanbanTask = {
        id: dragTask.id,
        title: dragTask.title,
        description: dragTask.description,
        tags: dragTask.tags,
        label: dragTask.label,
        dueAt: dragTask.dueAt,
      };
      setInboxTasks((prev) => prev.filter((t) => t.id !== activeIdStr));
      const targetCol = overContainer as KanbanColumnId;
      setColumns((prev) => {
        if (prev[targetCol].some((t) => t.id === activeIdStr)) return prev;
        const to = [...prev[targetCol]];
        if (KANBAN_COLUMN_ORDER.includes(overIdStr as KanbanColumnId)) {
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
        [srcCol]: prev[srcCol].filter((t) => t.id !== activeIdStr),
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
      const task = prev[fromCol].find((t) => t.id === activeIdStr);
      if (!task) return prev;
      if (prev[toCol].some((t) => t.id === activeIdStr)) return prev;
      const from = prev[fromCol].filter((t) => t.id !== activeIdStr);
      const to = [...prev[toCol]];
      if (KANBAN_COLUMN_ORDER.includes(overIdStr as KanbanColumnId)) {
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
    }
    dragSnapshotRef.current = null;
    activeContainerRef.current = null;
    activeDragTaskRef.current = null;
    setDragSlotMinHeightPx(null);
    setDndPointer({ activeId: null, overId: null });
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    const savedContainer = activeContainerRef.current;

    dragSnapshotRef.current = null;
    activeContainerRef.current = null;
    activeDragTaskRef.current = null;
    setDragSlotMinHeightPx(null);
    setDndPointer({ activeId: null, overId: null });

    if (!over || !savedContainer) return;

    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);
    if (activeIdStr === overIdStr) return;

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
      setColumns((prev) => ({
        ...prev,
        [columnId]: [...prev[columnId], task],
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
      const kanbanTask: KanbanTask = {
        id: `mock-${crypto.randomUUID()}`,
        title: task.title,
        description: task.description,
        tags: [],
        label: task.label,
        dueAt: undefined,
      };
      setColumns((prev) => ({
        ...prev,
        [selectedKanbanColumnId]: [
          ...prev[selectedKanbanColumnId],
          kanbanTask,
        ],
      }));
      return;
    }
    const copy: InboxTask = {
      ...task,
      id: `inbox-${crypto.randomUUID()}`,
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

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragOver={handleDragOver}
      onDragCancel={handleDragCancel}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
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
            onAddCard={handleAddKanbanCard}
            selectedColumnId={selectedKanbanColumnId}
            onSelectColumn={handleSelectKanbanColumn}
            columnDropIndicators={{
              todo: dropIndicators.todo,
              "in-progress": dropIndicators["in-progress"],
              done: dropIndicators.done,
            }}
            dropSlotMinHeightPx={dragSlotMinHeightPx}
          />
        </div>
      </div>
      <DragOverlay dropAnimation={null} modifiers={[snapCenterToCursor]}>
        {activeInboxTask ? (
          <InboxCardPreview task={activeInboxTask} />
        ) : activeKanbanTask ? (
          <CardPreview task={activeKanbanTask} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
