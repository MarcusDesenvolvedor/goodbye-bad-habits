"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";

import {
  type ColumnTasks,
  type KanbanColumnId,
  type KanbanTask,
  KANBAN_COLUMN_META,
  KANBAN_COLUMN_ORDER,
  TAG_PILL_CLASSES,
} from "./board-kanban-mock";

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
    opacity: isDragging ? 0 : undefined,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`touch-none rounded-xl border border-white/10 bg-zinc-900/80 p-3 shadow-[0_0_20px_rgba(0,0,0,0.35)] backdrop-blur-sm transition-shadow duration-200 ease-out ${
        isDragging ? "pointer-events-none" : ""
      }`}
    >
      <button
        type="button"
        className="w-full cursor-grab text-left active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <h3 className="text-sm font-bold tracking-wide text-zinc-100">
          {task.title}
        </h3>
        {task.description ? (
          <p className="mt-1 text-xs leading-snug text-zinc-400">
            {task.description}
          </p>
        ) : null}
        {task.tags.length > 0 ? (
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {task.tags.map((tag, i) => (
              <li
                key={tag}
                className={`rounded-md px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide ${TAG_PILL_CLASSES[i % TAG_PILL_CLASSES.length]}`}
              >
                {tag}
              </li>
            ))}
          </ul>
        ) : null}
        {task.dueAt ? (
          <p className="mt-2 text-[0.65rem] font-semibold uppercase tracking-widest text-zinc-500">
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

export function CardPreview({ task }: { task: KanbanTask }) {
  return (
    <article className="pointer-events-none w-[min(100vw-3rem,254px)] rounded-xl border border-blue-400/50 bg-zinc-900/90 p-3 shadow-[0_0_32px_rgba(59,130,246,0.3)]">
      <h3 className="text-sm font-bold tracking-wide text-zinc-100">
        {task.title}
      </h3>
      {task.description ? (
        <p className="mt-1 text-xs leading-snug text-zinc-400">
          {task.description}
        </p>
      ) : null}
      {task.tags.length > 0 ? (
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {task.tags.map((tag, i) => (
            <li
              key={tag}
              className={`rounded-md px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide ${TAG_PILL_CLASSES[i % TAG_PILL_CLASSES.length]}`}
            >
              {tag}
            </li>
          ))}
        </ul>
      ) : null}
      {task.dueAt ? (
        <p className="mt-2 text-[0.65rem] font-semibold uppercase tracking-widest text-zinc-500">
          Due{" "}
          {new Date(`${task.dueAt}T12:00:00`).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}
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
      className={`flex min-h-[min(420px,55vh)] w-[min(100%,280px)] shrink-0 flex-col overflow-hidden transition-[box-shadow] duration-200 ease-out ${meta.columnShellClass} ${
        isOver ? "ring-2 ring-cyan-400/50 ring-offset-2 ring-offset-[var(--stitch-bg)]" : ""
      }`}
    >
      <div className={`h-1 w-full shrink-0 ${meta.accentBarClass}`} aria-hidden />
      <div className="border-b border-white/10 px-3 py-2">
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-100">
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
              className="flex min-h-[120px] items-center justify-center rounded-lg border border-dashed border-zinc-600/80 p-3 text-center text-[0.65rem] font-bold uppercase tracking-wide text-zinc-500"
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

      <div className="mt-auto border-t border-white/10 bg-black/25 p-3 backdrop-blur-sm">
        {!showForm ? (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="w-full rounded-lg border border-dashed border-blue-400/45 bg-transparent py-2.5 text-xs font-bold uppercase tracking-widest text-zinc-300 shadow-[0_0_16px_rgba(59,130,246,0.12)] transition hover:border-cyan-400/60 hover:text-white"
          >
            + Add card
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-2">
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="w-full rounded-lg border border-white/15 bg-zinc-950/80 px-2 py-1.5 text-xs text-zinc-100 outline-none placeholder:text-zinc-500 focus:ring-2 focus:ring-blue-500/50"
              maxLength={120}
              aria-label="Card title"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description"
              rows={2}
              className="w-full resize-none rounded-lg border border-white/15 bg-zinc-950/80 px-2 py-1.5 text-xs text-zinc-100 outline-none placeholder:text-zinc-500 focus:ring-2 focus:ring-blue-500/50"
              maxLength={500}
              aria-label="Card description"
            />
            <input
              value={tagsRaw}
              onChange={(e) => setTagsRaw(e.target.value)}
              placeholder="Tags (comma separated)"
              className="w-full rounded-lg border border-white/15 bg-zinc-950/80 px-2 py-1.5 text-xs text-zinc-100 outline-none placeholder:text-zinc-500 focus:ring-2 focus:ring-blue-500/50"
              aria-label="Tags"
            />
            <input
              type="date"
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
              className="w-full rounded-lg border border-white/15 bg-zinc-950/80 px-2 py-1.5 text-xs text-zinc-100 outline-none focus:ring-2 focus:ring-blue-500/50"
              aria-label="Due date"
            />
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                className="flex-1 rounded-lg border border-blue-400/50 bg-blue-600/80 py-2 text-xs font-bold uppercase tracking-widest text-white shadow-[0_0_18px_rgba(59,130,246,0.35)] transition hover:bg-blue-500"
              >
                Save
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 rounded-lg border border-zinc-600 bg-zinc-900 py-2 text-xs font-bold uppercase tracking-widest text-zinc-200 transition hover:bg-zinc-800"
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

export function KanbanBoardSection({
  columns,
  onAddCard,
}: {
  columns: ColumnTasks;
  onAddCard: (columnId: KanbanColumnId, task: KanbanTask) => void;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[var(--stitch-surface)] p-6 shadow-[0_0_40px_rgba(0,0,0,0.45)] backdrop-blur-md">
      <div className="mb-6 flex flex-col gap-3 border-b border-white/10 pb-4">
        <div
          className="h-1 w-36 rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-violet-500 shadow-[0_0_14px_rgba(59,130,246,0.45)]"
          aria-hidden
        />
        <h2 className="text-lg font-bold uppercase tracking-widest text-zinc-100">
          Kanban
        </h2>
        <p className="text-xs uppercase tracking-wide text-zinc-500">
          Drag from Inbox or between columns · reorder within a column
        </p>
      </div>

      <div className="-mx-1 flex gap-4 overflow-x-auto overflow-y-visible pb-2 pt-1">
        {KANBAN_COLUMN_ORDER.map((columnId) => (
          <KanbanColumn
            key={columnId}
            columnId={columnId}
            tasks={columns[columnId]}
            onAddCard={onAddCard}
          />
        ))}
      </div>
    </section>
  );
}
