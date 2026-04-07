"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";

export type InboxTask = {
  id: string;
  title: string;
  description: string;
};

/** Droppable id for the inbox list (shared with board-workspace drag logic). */
export const WORKSPACE_INBOX_ZONE_ID = "workspace-inbox-zone";

const inboxCardClass =
  "touch-none rounded-xl border border-white/10 bg-zinc-900/80 p-3 shadow-[0_0_20px_rgba(0,0,0,0.35)] backdrop-blur-sm transition-shadow duration-200 ease-out";

const inboxInputClass =
  "w-full rounded-lg border border-white/15 bg-zinc-950/80 px-2 py-1.5 text-xs text-zinc-100 outline-none placeholder:text-zinc-500 focus:ring-2 focus:ring-blue-500/50";

export function InboxSortableCard({
  task,
  disabled,
}: {
  task: InboxTask;
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
      className={`${inboxCardClass} ${isDragging ? "pointer-events-none" : ""}`}
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
      </button>
    </article>
  );
}

export function InboxCardPreview({ task }: { task: InboxTask }) {
  return (
    <article
      className={`pointer-events-none w-[min(100vw-3rem,254px)] ${inboxCardClass} border-blue-400/50 shadow-[0_0_32px_rgba(59,130,246,0.3)]`}
    >
      <h3 className="text-sm font-bold tracking-wide text-zinc-100">
        {task.title}
      </h3>
      {task.description ? (
        <p className="mt-1 text-xs leading-snug text-zinc-400">
          {task.description}
        </p>
      ) : null}
    </article>
  );
}

export function BoardInboxSection({
  tasks,
  onAddInboxTask,
}: {
  tasks: InboxTask[];
  onAddInboxTask: (task: InboxTask) => void;
}) {
  const { setNodeRef: setInboxDropRef, isOver: isInboxDropOver } = useDroppable({
    id: WORKSPACE_INBOX_ZONE_ID,
  });

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  function resetForm() {
    setTitle("");
    setDescription("");
    setShowForm(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      return;
    }
    onAddInboxTask({
      id: `inbox-${crypto.randomUUID()}`,
      title: trimmed,
      description: description.trim(),
    });
    resetForm();
  }

  return (
    <aside
      className="w-full shrink-0 lg:w-[min(100%,300px)]"
      aria-label="Inbox"
    >
      <section className="rounded-2xl border border-white/10 bg-[var(--stitch-surface)] p-4 shadow-[0_0_40px_rgba(0,0,0,0.45)] backdrop-blur-md lg:p-5">
        <div className="mb-3 border-b border-white/10 pb-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Inbox
          </h2>
        </div>

        <div
          ref={setInboxDropRef}
          className={`rounded-xl transition-[box-shadow,ring] duration-200 ease-out ${
            isInboxDropOver
              ? "ring-2 ring-cyan-400/50 ring-offset-2 ring-offset-[var(--stitch-bg)]"
              : ""
          }`}
        >
          <SortableContext
            items={tasks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex max-h-[min(70vh,720px)] flex-col gap-2 overflow-y-auto pr-1">
              {tasks.length === 0 ? (
                <p className="py-6 text-center text-[0.65rem] text-zinc-500">
                  No tasks yet — drop cards here or add below.
                </p>
              ) : null}
              {tasks.map((task) => (
                <InboxSortableCard key={task.id} task={task} disabled={false} />
              ))}
            </div>
          </SortableContext>
        </div>

        <div className="mt-3 border-t border-white/10 pt-3">
          {!showForm ? (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="w-full rounded-lg border border-dashed border-blue-400/45 bg-transparent py-2 text-xs font-bold uppercase tracking-widest text-zinc-300 shadow-[0_0_16px_rgba(59,130,246,0.12)] transition hover:border-cyan-400/60 hover:text-white"
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
                className={inboxInputClass}
                maxLength={120}
                aria-label="Card title"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description (optional)"
                rows={2}
                className={`${inboxInputClass} resize-none`}
                maxLength={500}
                aria-label="Card description"
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
      </section>
    </aside>
  );
}
