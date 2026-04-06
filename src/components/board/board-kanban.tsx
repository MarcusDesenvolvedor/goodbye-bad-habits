"use client";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useState } from "react";

import {
  type ColumnTasks,
  type KanbanColumnId,
  type KanbanTask,
  KANBAN_COLUMN_META,
  KANBAN_COLUMN_ORDER,
  createMockKanbanColumns,
} from "./board-kanban-mock";

function findContainer(
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

function findTask(columns: ColumnTasks, taskId: string): KanbanTask | undefined {
  for (const col of KANBAN_COLUMN_ORDER) {
    const t = columns[col].find((c) => c.id === taskId);
    if (t) {
      return t;
    }
  }
  return undefined;
}

function SortableCard({
  task,
  disabled,
}: {
  task: KanbanTask;
  disabled: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`touch-none border-2 border-black bg-[#f4f1ea] p-3 shadow-[3px_3px_0_0_rgb(0,0,0)] transition-shadow duration-200 ease-out ${
        isDragging ? "z-10 opacity-90 shadow-[5px_5px_0_0_rgb(0,0,0)]" : ""
      }`}
    >
      <button
        type="button"
        className="w-full cursor-grab text-left active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <h3 className="text-sm font-bold uppercase tracking-wide text-neutral-900">
          {task.title}
        </h3>
        {task.description ? (
          <p className="mt-1 text-xs leading-snug text-zinc-600">
            {task.description}
          </p>
        ) : null}
        {task.tags.length > 0 ? (
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {task.tags.map((tag) => (
              <li
                key={tag}
                className="border border-black bg-white px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-neutral-800"
              >
                {tag}
              </li>
            ))}
          </ul>
        ) : null}
        {task.dueAt ? (
          <p className="mt-2 text-[0.65rem] font-bold uppercase tracking-widest text-zinc-500">
            Due{" "}
            {new Date(`${task.dueAt}T12:00:00`).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </p>
        ) : null}
      </button>
    </article>
  );
}

function CardPreview({ task }: { task: KanbanTask }) {
  return (
    <article className="pointer-events-none border-2 border-black bg-[#f4f1ea] p-3 shadow-[5px_5px_0_0_rgb(0,0,0)]">
      <h3 className="text-sm font-bold uppercase tracking-wide text-neutral-900">
        {task.title}
      </h3>
      {task.description ? (
        <p className="mt-1 text-xs leading-snug text-zinc-600">
          {task.description}
        </p>
      ) : null}
    </article>
  );
}

function KanbanColumn({
  columnId,
  tasks,
  onAddCard,
}: {
  columnId: KanbanColumnId;
  tasks: KanbanTask[];
  onAddCard: (columnId: KanbanColumnId, task: KanbanTask) => void;
}) {
  const meta = KANBAN_COLUMN_META[columnId];
  const { setNodeRef, isOver } = useDroppable({ id: columnId });
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tagsRaw, setTagsRaw] = useState("");
  const [dueAt, setDueAt] = useState("");

  function resetForm() {
    setTitle("");
    setDescription("");
    setTagsRaw("");
    setDueAt("");
    setShowForm(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      return;
    }
    const tags = tagsRaw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    onAddCard(columnId, {
      id: `mock-${crypto.randomUUID()}`,
      title: trimmed,
      description: description.trim(),
      tags,
      dueAt: dueAt.trim() || undefined,
    });
    resetForm();
  }

  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[min(420px,55vh)] w-[min(100%,280px)] shrink-0 flex-col border-4 border-black bg-white shadow-[4px_4px_0_0_rgb(0,0,0)] transition-[box-shadow,ring] duration-200 ease-out ${
        isOver
          ? "ring-2 ring-[#2563eb] ring-offset-2 ring-offset-[#f4f1ea]"
          : ""
      }`}
    >
      <div
        className={`h-2 border-b-4 border-black ${meta.accentClass}`}
        aria-hidden
      />
      <div className="border-b-4 border-black px-3 py-2">
        <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-900">
          {meta.title}
        </h2>
        <p className="text-[0.65rem] uppercase tracking-wide text-zinc-500">
          {tasks.length} {tasks.length === 1 ? "card" : "cards"}
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-3">
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.length === 0 ? (
            <div
              className="flex min-h-[120px] items-center justify-center border-2 border-dashed border-zinc-400 p-3 text-center text-[0.65rem] font-bold uppercase tracking-wide text-zinc-400"
              aria-hidden
            >
              Drop cards here
            </div>
          ) : null}
          {tasks.map((task) => (
            <SortableCard key={task.id} task={task} disabled={false} />
          ))}
        </SortableContext>
      </div>

      <div className="mt-auto border-t-4 border-black bg-[#f4f1ea] p-3">
        {!showForm ? (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="w-full border-2 border-black border-dashed bg-white py-2 text-xs font-bold uppercase tracking-widest text-neutral-800 transition hover:bg-[#f4f1ea]"
          >
            Add card
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-2">
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="w-full border-4 border-black bg-white px-2 py-1.5 text-xs outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-[#2563eb] focus:ring-offset-1"
              maxLength={120}
              aria-label="Card title"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description"
              rows={2}
              className="w-full resize-none border-4 border-black bg-white px-2 py-1.5 text-xs outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-[#2563eb] focus:ring-offset-1"
              maxLength={500}
              aria-label="Card description"
            />
            <input
              value={tagsRaw}
              onChange={(e) => setTagsRaw(e.target.value)}
              placeholder="Tags (comma separated)"
              className="w-full border-4 border-black bg-white px-2 py-1.5 text-xs outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-[#2563eb] focus:ring-offset-1"
              aria-label="Tags"
            />
            <input
              type="date"
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
              className="w-full border-4 border-black bg-white px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-[#2563eb] focus:ring-offset-1"
              aria-label="Due date"
            />
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                className="flex-1 border-4 border-black bg-[#2563eb] py-2 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-blue-700"
              >
                Save
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 border-4 border-black bg-black py-2 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-zinc-800"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export function BoardKanban() {
  const [columns, setColumns] = useState<ColumnTasks>(() =>
    createMockKanbanColumns(),
  );
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const activeTask = useMemo(
    () => (activeId ? findTask(columns, activeId) : undefined),
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

    const activeContainer = findContainer(columns, activeIdStr);
    if (!activeContainer) {
      return;
    }

    const overContainer = KANBAN_COLUMN_ORDER.includes(overIdStr as KanbanColumnId)
      ? (overIdStr as KanbanColumnId)
      : findContainer(columns, overIdStr);

    if (!overContainer) {
      return;
    }

    if (activeContainer === overContainer) {
      const list = columns[activeContainer];
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
        [activeContainer]: arrayMove(prev[activeContainer], oldIndex, newIndex),
      }));
      return;
    }

    setColumns((prev) => {
      const next: ColumnTasks = {
        todo: [...prev.todo],
        "in-progress": [...prev["in-progress"]],
        done: [...prev.done],
      };
      const from = next[activeContainer];
      const to = next[overContainer];
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

  function handleAddCard(columnId: KanbanColumnId, task: KanbanTask) {
    setColumns((prev) => ({
      ...prev,
      [columnId]: [...prev[columnId], task],
    }));
  }

  return (
    <section className="border-4 border-black bg-white p-6 shadow-[8px_8px_0_0_rgb(0,0,0)]">
      <div className="mb-6 border-b-4 border-black pb-4">
        <h2 className="text-lg font-bold uppercase tracking-widest">
          Kanban
        </h2>
        <p className="text-xs uppercase tracking-wide text-zinc-500">
          Mock preview · drag cards between columns or reorder within a column
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="-mx-1 flex gap-4 overflow-x-auto overflow-y-visible pb-2 pt-1">
          {KANBAN_COLUMN_ORDER.map((columnId) => (
            <KanbanColumn
              key={columnId}
              columnId={columnId}
              tasks={columns[columnId]}
              onAddCard={handleAddCard}
            />
          ))}
        </div>
        <DragOverlay dropAnimation={null}>
          {activeTask ? <CardPreview task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>
    </section>
  );
}
