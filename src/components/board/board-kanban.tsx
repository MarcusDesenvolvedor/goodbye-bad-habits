"use client";

import {
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Fragment, memo, useEffect, useRef, useState } from "react";

import { BoardCardDropSlot } from "./board-card-drop-slot";
import { CardLabelBadge } from "./board-label-badge";
import {
  type ColumnMeta,
  type ColumnTasks,
  type KanbanColumnId,
  type KanbanTask,
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
          : `group/card relative z-0 hover:z-10 ${kanbanCardInteractiveClass}`
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

      {!isDragging ? (
        <div className="absolute right-2 top-2 flex opacity-0 transition-opacity duration-150 group-hover/card:opacity-100">
          <button
            type="button"
            className="rounded-md border border-white/10 bg-zinc-800/90 px-1.5 py-0.5 text-xs text-zinc-400 backdrop-blur-sm transition hover:bg-zinc-700 hover:text-zinc-200"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            ···
          </button>
        </div>
      ) : null}
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

export function ColumnDragPreview({
  title,
  meta,
  taskCount,
}: {
  title: string;
  meta: ColumnMeta;
  taskCount: number;
}) {
  return (
    <div
      className={`pointer-events-none w-[min(100vw-3rem,280px)] opacity-[0.7] ${meta.columnShellClass}`}
    >
      <div className={`h-1 w-full shrink-0 ${meta.accentBarClass}`} aria-hidden />
      <div className="border-b border-white/10 px-3 py-2">
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-100">
          {title}
        </h2>
        <p className="text-[0.65rem] uppercase tracking-wide text-zinc-500">
          {taskCount} {taskCount === 1 ? "card" : "cards"}
        </p>
      </div>
      <div className="flex min-h-[60px] items-center justify-center p-3 text-[0.65rem] font-bold uppercase tracking-wide text-zinc-500">
        {taskCount} {taskCount === 1 ? "card" : "cards"}
      </div>
    </div>
  );
}

const COLUMN_SORTABLE_TRANSITION = {
  duration: 150,
  easing: "cubic-bezier(0.25, 1, 0.45, 1)",
} as const;

const KanbanColumn = memo(function KanbanColumn({
  columnId,
  tasks,
  meta,
  onAddCard,
  isSelected,
  onSelectColumn,
  onRenameColumn,
  dropIndicatorIndex,
  dropSlotMinHeightPx,
  isColumnDragActive,
}: {
  columnId: KanbanColumnId;
  tasks: KanbanTask[];
  meta: ColumnMeta;
  onAddCard: (columnId: KanbanColumnId, task: KanbanTask) => void;
  isSelected: boolean;
  onSelectColumn: (columnId: KanbanColumnId) => void;
  onRenameColumn: (columnId: KanbanColumnId, title: string) => void;
  dropIndicatorIndex: number | null;
  dropSlotMinHeightPx?: number | null;
  isColumnDragActive?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isColumnDragging,
  } = useSortable({
    id: columnId,
    data: { type: "column" },
    transition: COLUMN_SORTABLE_TRANSITION,
  });

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(meta.title);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

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

  function handleTitleSave() {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== meta.title) {
      onRenameColumn(columnId, trimmed);
    } else {
      setEditTitle(meta.title);
    }
    setIsEditingTitle(false);
  }

  const columnStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={columnStyle}
      className={`flex w-[min(100%,280px)] shrink-0 flex-col overflow-hidden ${
        isColumnDragging
          ? "animate-card-drop-slot rounded-2xl border-2 border-dashed border-cyan-400/30 bg-zinc-900/15 backdrop-blur-sm"
          : `${meta.columnShellClass} ${
              isSelected
                ? "ring-2 ring-violet-400/40 ring-offset-2 ring-offset-[var(--stitch-bg)]"
                : ""
            }`
      }`}
    >
      <div className={`h-1 w-full shrink-0 ${meta.accentBarClass} ${isColumnDragging ? "opacity-30" : ""}`} aria-hidden />

      <div
        className={`flex items-center gap-1 px-3 py-2 ${
          isColumnDragging
            ? "invisible border-b border-transparent"
            : "cursor-grab touch-none border-b border-white/10 active:cursor-grabbing"
        }`}
        {...attributes}
        {...listeners}
      >
        <svg
          className="h-4 w-4 shrink-0 text-zinc-500"
          viewBox="0 0 16 16"
          fill="currentColor"
          aria-hidden
        >
          <circle cx="5" cy="3" r="1.2" />
          <circle cx="11" cy="3" r="1.2" />
          <circle cx="5" cy="8" r="1.2" />
          <circle cx="11" cy="8" r="1.2" />
          <circle cx="5" cy="13" r="1.2" />
          <circle cx="11" cy="13" r="1.2" />
        </svg>

        <div
          role="button"
          tabIndex={0}
          aria-pressed={isSelected}
          aria-label={`${meta.title} column. ${isSelected ? "Selected for inbox copy." : "Select for inbox copy."}`}
          className="min-w-0 flex-1 cursor-pointer outline-none transition hover:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-cyan-400/50"
          onClick={() => {
            if (!isEditingTitle) onSelectColumn(columnId);
          }}
          onPointerDown={(e) => {
            if (isEditingTitle) e.stopPropagation();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              if (!isEditingTitle) onSelectColumn(columnId);
            }
          }}
        >
          {isEditingTitle ? (
            <input
              ref={titleInputRef}
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onPointerDown={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleTitleSave();
                }
                if (e.key === "Escape") {
                  setEditTitle(meta.title);
                  setIsEditingTitle(false);
                }
              }}
              onBlur={() => {
                setEditTitle(meta.title);
                setIsEditingTitle(false);
              }}
              className="w-full bg-transparent text-xs font-bold uppercase tracking-widest text-zinc-100 outline-none"
              maxLength={60}
              aria-label="Edit column title"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <h2
              className="cursor-text text-xs font-bold uppercase tracking-widest text-zinc-100"
              onClick={(e) => {
                e.stopPropagation();
                setEditTitle(meta.title);
                setIsEditingTitle(true);
              }}
            >
              {meta.title}
            </h2>
          )}
          <p className="text-[0.65rem] uppercase tracking-wide text-zinc-500">
            {tasks.length} {tasks.length === 1 ? "card" : "cards"}
          </p>
        </div>
      </div>

      <div className={`flex flex-col gap-3 overflow-y-auto p-3 pb-6 ${isColumnDragging ? "invisible" : ""}`}>
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

        <div className="pt-3">
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

function AddListButton({
  onAddColumn,
}: {
  onAddColumn: (title: string) => void;
}) {
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
    onAddColumn(trimmed);
    resetForm();
  }

  if (!showForm) {
    return (
      <button
        type="button"
        onClick={() => setShowForm(true)}
        className="flex w-[min(100%,280px)] shrink-0 cursor-pointer items-center justify-center rounded-2xl border border-dashed border-white/15 bg-zinc-900/30 px-6 py-4 text-sm font-bold uppercase tracking-widest text-zinc-500 backdrop-blur-md transition-all duration-200 hover:border-cyan-400/40 hover:bg-zinc-900/45 hover:text-zinc-300 hover:shadow-[0_0_30px_rgba(34,211,238,0.1)]"
      >
        + Add list
      </button>
    );
  }

  return (
    <div className="flex w-[min(100%,280px)] shrink-0 flex-col rounded-2xl border border-cyan-400/35 bg-zinc-900/45 p-4 shadow-[0_0_36px_rgba(34,211,238,0.12)] backdrop-blur-md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="List title…"
          className="w-full rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2 text-sm font-bold tracking-wide text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-cyan-400/50"
          maxLength={60}
          aria-label="New list title"
          onKeyDown={(e) => {
            if (e.key === "Escape") resetForm();
          }}
          onBlur={() => {
            if (!title.trim()) resetForm();
          }}
        />
        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded-lg border border-cyan-400/45 bg-cyan-600/80 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-white shadow-[0_0_14px_rgba(34,211,238,0.3)] transition hover:bg-cyan-500/90"
          >
            Add
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-zinc-400 transition hover:text-zinc-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export function KanbanBoardSection({
  columns,
  columnOrder,
  columnMeta,
  onAddCard,
  selectedColumnId,
  onSelectColumn,
  onRenameColumn,
  onAddColumn,
  columnDropIndicators,
  dropSlotMinHeightPx,
  isColumnDragActive,
}: {
  columns: ColumnTasks;
  columnOrder: string[];
  columnMeta: Record<string, ColumnMeta>;
  onAddCard: (columnId: KanbanColumnId, task: KanbanTask) => void;
  selectedColumnId: KanbanColumnId | null;
  onSelectColumn: (columnId: KanbanColumnId) => void;
  onRenameColumn: (columnId: KanbanColumnId, title: string) => void;
  onAddColumn: (title: string) => void;
  columnDropIndicators: Record<string, number | null>;
  dropSlotMinHeightPx?: number | null;
  isColumnDragActive?: boolean;
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
          Drag from Inbox or between columns · reorder within a column · drag
          the header to reorder lists
        </p>
      </div>

      <div className="-mx-1 flex items-start gap-4 overflow-x-auto overflow-y-visible pb-2 pt-1">
        <SortableContext
          items={columnOrder}
          strategy={horizontalListSortingStrategy}
        >
          {columnOrder.map((columnId) => (
            <KanbanColumn
              key={columnId}
              columnId={columnId}
              tasks={columns[columnId] ?? []}
              meta={columnMeta[columnId] ?? { title: columnId, accentBarClass: "", columnShellClass: "rounded-2xl border border-white/20 bg-zinc-900/45 backdrop-blur-md" }}
              onAddCard={onAddCard}
              isSelected={selectedColumnId === columnId}
              onSelectColumn={onSelectColumn}
              onRenameColumn={onRenameColumn}
              dropIndicatorIndex={columnDropIndicators[columnId] ?? null}
              dropSlotMinHeightPx={dropSlotMinHeightPx}
              isColumnDragActive={isColumnDragActive}
            />
          ))}
        </SortableContext>

        <AddListButton onAddColumn={onAddColumn} />
      </div>
    </section>
  );
}
