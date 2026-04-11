"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Fragment, memo, useState } from "react";

import { BoardCardDropSlot } from "./board-card-drop-slot";
import { CardLabelBadge } from "./board-label-badge";
import {
  type ColumnTasks,
  type KanbanColumnId,
  type KanbanTask,
  KANBAN_COLUMN_META,
  KANBAN_COLUMN_ORDER,
  TAG_PILL_CLASSES,
} from "./board-kanban-mock";
import { BOARD_SORTABLE_TRANSITION } from "./board-sortable-transition";

const kanbanCardSurfaceClass =
  "touch-none rounded-xl border border-white/10 bg-zinc-900/80 p-3 shadow-[0_0_20px_rgba(0,0,0,0.35)] backdrop-blur-sm";

const kanbanCardInteractiveClass = `${kanbanCardSurfaceClass} transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_12px_36px_rgba(0,0,0,0.5)]`;

const SortableCard = memo(function SortableCard({
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
  } = useSortable({
    id: task.id,
    disabled,
    transition: BOARD_SORTABLE_TRANSITION,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={
        isDragging
          ? "animate-card-drop-slot pointer-events-none touch-none rounded-xl border border-dashed border-cyan-400/50 bg-zinc-900/40 p-3 shadow-[0_0_20px_rgba(0,0,0,0.35)] backdrop-blur-sm"
          : `z-0 hover:z-10 ${kanbanCardInteractiveClass}`
      }
    >
      <button
        type="button"
        className={
          isDragging
            ? "invisible w-full"
            : "w-full cursor-grab text-left active:cursor-grabbing"
        }
        {...attributes}
        {...listeners}
      >
        {task.label?.kind === "preset" ? (
          <div className="mb-2">
            <CardLabelBadge label={task.label} />
          </div>
        ) : null}
        <h3 className="text-sm font-bold tracking-wide text-zinc-100">
          {task.title}
        </h3>
        {task.label?.kind === "custom" ? (
          <div className="mt-1.5">
            <CardLabelBadge label={task.label} />
          </div>
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
});

export function CardPreview({ task }: { task: KanbanTask }) {
  return (
    <article
      className={`pointer-events-none w-[min(100vw-3rem,254px)] opacity-[0.65] ${kanbanCardSurfaceClass}`}
    >
      <div className="w-full cursor-grab text-left active:cursor-grabbing">
        {task.label?.kind === "preset" ? (
          <div className="mb-2">
            <CardLabelBadge label={task.label} />
          </div>
        ) : null}
        <h3 className="text-sm font-bold tracking-wide text-zinc-100">
          {task.title}
        </h3>
        {task.label?.kind === "custom" ? (
          <div className="mt-1.5">
            <CardLabelBadge label={task.label} />
          </div>
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
      </div>
    </article>
  );
}

const KanbanColumn = memo(function KanbanColumn({
  columnId,
  tasks,
  onAddCard,
  isSelected,
  onSelectColumn,
  dropIndicatorIndex,
  dropSlotMinHeightPx,
}: {
  columnId: KanbanColumnId;
  tasks: KanbanTask[];
  onAddCard: (columnId: KanbanColumnId, task: KanbanTask) => void;
  isSelected: boolean;
  onSelectColumn: (columnId: KanbanColumnId) => void;
  dropIndicatorIndex: number | null;
  dropSlotMinHeightPx?: number | null;
}) {
  const meta = KANBAN_COLUMN_META[columnId];
  const { setNodeRef, isOver } = useDroppable({ id: columnId });
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");

  function resetForm() {
    setTitle("");
    setShowForm(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    onAddCard(columnId, {
      id: `mock-${crypto.randomUUID()}`,
      title: trimmed,
      description: "",
      tags: [],
      dueAt: undefined,
    });
    resetForm();
  }

  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[min(420px,55vh)] w-[min(100%,280px)] shrink-0 flex-col overflow-hidden transition-[box-shadow,ring] duration-200 ease-out ${meta.columnShellClass} ${
        isOver
          ? "ring-2 ring-cyan-400/50 ring-offset-2 ring-offset-[var(--stitch-bg)]"
          : isSelected
            ? "ring-2 ring-violet-400/40 ring-offset-2 ring-offset-[var(--stitch-bg)]"
            : ""
      }`}
    >
      <div className={`h-1 w-full shrink-0 ${meta.accentBarClass}`} aria-hidden />
      <div
        role="button"
        tabIndex={0}
        aria-pressed={isSelected}
        aria-label={`${meta.title} column. ${isSelected ? "Selected for inbox copy." : "Select for inbox copy."}`}
        className="cursor-pointer border-b border-white/10 px-3 py-2 outline-none transition hover:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-cyan-400/50"
        onClick={() => onSelectColumn(columnId)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelectColumn(columnId);
          }
        }}
      >
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-100">
          {meta.title}
        </h2>
        <p className="text-[0.65rem] uppercase tracking-wide text-zinc-500">
          {tasks.length} {tasks.length === 1 ? "card" : "cards"}
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-3 pb-6">
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.length === 0 ? (
            <>
              {dropIndicatorIndex === 0 ? (
                <BoardCardDropSlot minHeightPx={dropSlotMinHeightPx} />
              ) : null}
              <div
                className="flex min-h-[120px] items-center justify-center rounded-lg border border-dashed border-zinc-600/80 p-3 text-center text-[0.65rem] font-bold uppercase tracking-wide text-zinc-500"
                aria-hidden
              >
                Drop cards here
              </div>
            </>
          ) : (
            tasks.map((task, index) => (
              <Fragment key={task.id}>
                {dropIndicatorIndex === index ? (
                  <BoardCardDropSlot minHeightPx={dropSlotMinHeightPx} />
                ) : null}
                <SortableCard task={task} disabled={false} />
              </Fragment>
            ))
          )}
          {dropIndicatorIndex === tasks.length && tasks.length > 0 ? (
            <BoardCardDropSlot minHeightPx={dropSlotMinHeightPx} />
          ) : null}
        </SortableContext>

        <div className="mt-auto pt-3">
          {!showForm ? (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className={`w-full cursor-pointer text-left ${kanbanCardSurfaceClass} text-sm font-bold tracking-wide text-zinc-500 transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:text-zinc-300 hover:shadow-[0_12px_36px_rgba(0,0,0,0.5)]`}
            >
              + Add card
            </button>
          ) : (
            <form onSubmit={handleSubmit} className={kanbanCardSurfaceClass}>
              <input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Card title…"
                className="w-full bg-transparent text-sm font-bold tracking-wide text-zinc-100 outline-none placeholder:text-zinc-500"
                maxLength={120}
                aria-label="Card title"
                onKeyDown={(e) => {
                  if (e.key === "Escape") resetForm();
                }}
                onBlur={resetForm}
              />
            </form>
          )}
        </div>
      </div>
    </div>
  );
});

export function KanbanBoardSection({
  columns,
  onAddCard,
  selectedColumnId,
  onSelectColumn,
  columnDropIndicators,
  dropSlotMinHeightPx,
}: {
  columns: ColumnTasks;
  onAddCard: (columnId: KanbanColumnId, task: KanbanTask) => void;
  selectedColumnId: KanbanColumnId | null;
  onSelectColumn: (columnId: KanbanColumnId) => void;
  columnDropIndicators: Record<KanbanColumnId, number | null>;
  dropSlotMinHeightPx?: number | null;
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
          Drag from Inbox or between columns · reorder within a column · click a
          column header to paste Inbox copies there
        </p>
      </div>

      <div className="-mx-1 flex gap-4 overflow-x-auto overflow-y-visible pb-2 pt-1">
        {KANBAN_COLUMN_ORDER.map((columnId) => (
          <KanbanColumn
            key={columnId}
            columnId={columnId}
            tasks={columns[columnId]}
            onAddCard={onAddCard}
            isSelected={selectedColumnId === columnId}
            onSelectColumn={onSelectColumn}
            dropIndicatorIndex={columnDropIndicators[columnId]}
            dropSlotMinHeightPx={dropSlotMinHeightPx}
          />
        ))}
      </div>
    </section>
  );
}
