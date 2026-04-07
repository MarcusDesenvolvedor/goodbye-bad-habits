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
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { useMemo, useState } from "react";

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

  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedKanbanColumnId, setSelectedKanbanColumnId] =
    useState<KanbanColumnId | null>(null);
  const [workspaceCustomLabels, setWorkspaceCustomLabels] = useState<
    WorkspaceCustomLabel[]
  >([]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const activeInboxTask = useMemo(
    () => (activeId ? inboxTasks.find((t) => t.id === activeId) : undefined),
    [activeId, inboxTasks],
  );

  const activeKanbanTask = useMemo(
    () => (activeId ? findKanbanTask(columns, activeId) : undefined),
    [activeId, columns],
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) {
      return;
    }

    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);

    const activeContainer = findWorkspaceContainer(
      inboxTasks,
      columns,
      activeIdStr,
    );
    const overContainer = findWorkspaceContainer(
      inboxTasks,
      columns,
      overIdStr,
    );

    if (!activeContainer || !overContainer) {
      return;
    }

    if (activeContainer === overContainer) {
      if (activeContainer === "inbox") {
        if (activeIdStr === overIdStr) {
          return;
        }
        const oldIndex = inboxTasks.findIndex((t) => t.id === activeIdStr);
        const newIndex = inboxTasks.findIndex((t) => t.id === overIdStr);
        if (oldIndex === -1 || newIndex === -1) {
          return;
        }
        setInboxTasks((prev) => arrayMove(prev, oldIndex, newIndex));
        return;
      }

      const col = activeContainer;
      const list = columns[col];
      const oldIndex = list.findIndex((t) => t.id === activeIdStr);
      const newIndex = list.findIndex((t) => t.id === overIdStr);
      if (
        oldIndex === -1 ||
        newIndex === -1 ||
        oldIndex === newIndex
      ) {
        return;
      }
      setColumns((prev) => ({
        ...prev,
        [col]: arrayMove(prev[col], oldIndex, newIndex),
      }));
      return;
    }

    if (activeContainer === "inbox" && overContainer !== "inbox") {
      const task = inboxTasks.find((t) => t.id === activeIdStr);
      if (!task) {
        return;
      }
      const kanbanTask: KanbanTask = {
        id: `mock-${crypto.randomUUID()}`,
        title: task.title,
        description: task.description,
        tags: [],
        label: task.label,
        dueAt: undefined,
      };
      setInboxTasks((prev) => prev.filter((t) => t.id !== activeIdStr));
      setColumns((prev) => {
        const next: ColumnTasks = {
          todo: [...prev.todo],
          "in-progress": [...prev["in-progress"]],
          done: [...prev.done],
        };
        const targetCol = overContainer as KanbanColumnId;
        const to = next[targetCol];
        if (KANBAN_COLUMN_ORDER.includes(overIdStr as KanbanColumnId)) {
          to.push(kanbanTask);
        } else {
          const newIndex = to.findIndex((t) => t.id === overIdStr);
          if (newIndex === -1) {
            to.push(kanbanTask);
          } else {
            to.splice(newIndex, 0, kanbanTask);
          }
        }
        return next;
      });
      return;
    }

    if (activeContainer !== "inbox" && overContainer === "inbox") {
      const task = findKanbanTask(columns, activeIdStr);
      if (!task) {
        return;
      }
      const inboxTask: InboxTask = {
        id: `inbox-${crypto.randomUUID()}`,
        title: task.title,
        description: task.description,
        label: task.label,
      };
      setColumns((prev) => {
        const next: ColumnTasks = {
          todo: [...prev.todo],
          "in-progress": [...prev["in-progress"]],
          done: [...prev.done],
        };
        const fromCol = activeContainer as KanbanColumnId;
        const fromList = next[fromCol];
        const oldIndex = fromList.findIndex((t) => t.id === activeIdStr);
        if (oldIndex === -1) {
          return prev;
        }
        fromList.splice(oldIndex, 1);
        return next;
      });
      setInboxTasks((prev) => {
        if (overIdStr === WORKSPACE_INBOX_ZONE_ID) {
          return [...prev, inboxTask];
        }
        const newIndex = prev.findIndex((t) => t.id === overIdStr);
        if (newIndex === -1) {
          return [...prev, inboxTask];
        }
        const next = [...prev];
        next.splice(newIndex, 0, inboxTask);
        return next;
      });
      return;
    }

    setColumns((prev) => {
      const next: ColumnTasks = {
        todo: [...prev.todo],
        "in-progress": [...prev["in-progress"]],
        done: [...prev.done],
      };
      const from = next[activeContainer as KanbanColumnId];
      const to = next[overContainer as KanbanColumnId];
      const oldIndex = from.findIndex((t) => t.id === activeIdStr);
      if (oldIndex === -1) {
        return prev;
      }
      const [moved] = from.splice(oldIndex, 1);

      if (KANBAN_COLUMN_ORDER.includes(overIdStr as KanbanColumnId)) {
        to.push(moved);
      } else {
        const newIndex = to.findIndex((t) => t.id === overIdStr);
        if (newIndex === -1) {
          to.push(moved);
        } else {
          to.splice(newIndex, 0, moved);
        }
      }
      return next;
    });
  }

  function handleAddKanbanCard(columnId: KanbanColumnId, task: KanbanTask) {
    setColumns((prev) => ({
      ...prev,
      [columnId]: [...prev[columnId], task],
    }));
  }

  function handleAddInboxTask(task: InboxTask) {
    setInboxTasks((prev) => [...prev, task]);
  }

  function handleUpdateInboxTask(updated: InboxTask) {
    setInboxTasks((prev) =>
      prev.map((t) => (t.id === updated.id ? updated : t)),
    );
  }

  function handleDeleteInboxTask(id: string) {
    setInboxTasks((prev) => prev.filter((t) => t.id !== id));
  }

  function handleDuplicateInboxTask(task: InboxTask) {
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
  }

  function handleSelectKanbanColumn(columnId: KanbanColumnId) {
    setSelectedKanbanColumnId((prev) =>
      prev === columnId ? null : columnId,
    );
  }

  function handleAddWorkspaceCustomLabel(entry: WorkspaceCustomLabel) {
    setWorkspaceCustomLabels((prev) => {
      if (prev.some((p) => p.id === entry.id)) {
        return prev;
      }
      return [...prev, entry];
    });
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
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
        />
        <div className="min-w-0 flex-1">
          <KanbanBoardSection
            columns={columns}
            onAddCard={handleAddKanbanCard}
            selectedColumnId={selectedKanbanColumnId}
            onSelectColumn={handleSelectKanbanColumn}
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
