"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Fragment,
  memo,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";

import { BoardCardDropSlot } from "./board-card-drop-slot";
import { CardLabelBadge } from "./board-label-badge";
import { BOARD_SORTABLE_TRANSITION } from "./board-sortable-transition";
import {
  LABEL_COLOR_META,
  LABEL_COLOR_ORDER,
  labelsMatch,
  type CardLabel,
  type LabelColor,
  type WorkspaceCustomLabel,
} from "./board-labels";

export type { CardLabel, LabelColor, WorkspaceCustomLabel } from "./board-labels";

export type InboxTask = {
  id: string;
  title: string;
  description: string;
  label?: CardLabel;
  comments?: string[];
};

/** Droppable id for the inbox list (shared with board-workspace drag logic). */
export const WORKSPACE_INBOX_ZONE_ID = "workspace-inbox-zone";

const inboxCardSurfaceClass =
  "touch-none rounded-xl border border-white/10 bg-zinc-900/80 p-3 shadow-[0_0_20px_rgba(0,0,0,0.35)] backdrop-blur-sm";

const inboxCardInteractiveClass = `${inboxCardSurfaceClass} transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_12px_36px_rgba(0,0,0,0.5)]`;

const inboxInputClass =
  "w-full rounded-lg border border-white/15 bg-zinc-950/80 px-2 py-1.5 text-xs text-zinc-100 outline-none placeholder:text-zinc-500 focus:ring-2 focus:ring-blue-500/50";

const modalOverlayClass =
  "fixed inset-0 z-[100] flex items-center justify-center bg-black/65 p-4 backdrop-blur-[2px] transition-opacity duration-200 ease-out";

const modalPanelClass =
  "max-h-[min(85vh,640px)] w-full max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-zinc-900/95 p-5 shadow-[0_0_48px_rgba(0,0,0,0.55)] backdrop-blur-md transition-[opacity,transform] duration-200 ease-out";

const modalBtnPrimary =
  "rounded-lg border border-blue-400/50 bg-blue-600/80 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white shadow-[0_0_18px_rgba(59,130,246,0.35)] transition hover:bg-blue-500";

const modalBtnSecondary =
  "rounded-lg border border-zinc-600 bg-zinc-900 px-4 py-2 text-xs font-bold uppercase tracking-widest text-zinc-200 transition hover:bg-zinc-800";

/** Below modals (z-100), above board columns and overflow containers */
const INBOX_CARD_MENU_Z = 95;

const inboxCardMenuPanelClass =
  "min-w-[10.5rem] origin-top-right rounded-xl border border-white/10 bg-zinc-950/95 py-1 shadow-[0_8px_32px_rgba(0,0,0,0.55)] backdrop-blur-md transition-[opacity,transform] duration-150 ease-out";

function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

function MoreIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm0 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm0 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z" />
    </svg>
  );
}

export const InboxSortableCard = memo(function InboxSortableCard({
  task,
  disabled,
  onUpdateTask,
  onDeleteTask,
  onDuplicateTask,
  workspaceCustomLabels,
  onAddWorkspaceCustomLabel,
}: {
  task: InboxTask;
  disabled: boolean;
  onUpdateTask: (task: InboxTask) => void;
  onDeleteTask: (id: string) => void;
  onDuplicateTask: (task: InboxTask) => void;
  workspaceCustomLabels: WorkspaceCustomLabel[];
  onAddWorkspaceCustomLabel: (label: WorkspaceCustomLabel) => void;
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

  const [menuOpen, setMenuOpen] = useState(false);
  const [openCardVisible, setOpenCardVisible] = useState(false);
  const [labelsVisible, setLabelsVisible] = useState(false);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);
  const [menuCoords, setMenuCoords] = useState<{
    top: number;
    right: number;
  } | null>(null);
  const commentInputId = useId();

  const [labelCreateOpen, setLabelCreateOpen] = useState(false);
  const [createLabelName, setCreateLabelName] = useState("");
  const [createLabelColor, setCreateLabelColor] =
    useState<LabelColor>("blue");
  const [commentDraft, setCommentDraft] = useState("");
  const hydrated = useHydrated();

  const updateMenuCoords = useCallback(() => {
    const el = menuTriggerRef.current;
    if (!el) {
      return;
    }
    const r = el.getBoundingClientRect();
    setMenuCoords({
      top: r.bottom + 4,
      right: window.innerWidth - r.right,
    });
  }, []);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    setMenuCoords(null);
  }, []);

  useLayoutEffect(() => {
    if (!menuOpen) {
      return;
    }
    updateMenuCoords();
    window.addEventListener("scroll", updateMenuCoords, true);
    window.addEventListener("resize", updateMenuCoords);
    return () => {
      window.removeEventListener("scroll", updateMenuCoords, true);
      window.removeEventListener("resize", updateMenuCoords);
    };
  }, [menuOpen, updateMenuCoords]);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }
    function handlePointerDown(e: PointerEvent) {
      const t = e.target as Node;
      if (
        menuTriggerRef.current?.contains(t) ||
        menuPanelRef.current?.contains(t)
      ) {
        return;
      }
      closeMenu();
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [menuOpen, closeMenu]);

  useEffect(() => {
    if (!openCardVisible && !labelsVisible && !menuOpen) {
      return;
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpenCardVisible(false);
        setLabelsVisible(false);
        closeMenu();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openCardVisible, labelsVisible, menuOpen, closeMenu]);

  function applyPreset(color: LabelColor) {
    const next: InboxTask =
      labelsMatch(task.label, { kind: "preset", color })
        ? { ...task, label: undefined }
        : { ...task, label: { kind: "preset", color } };
    onUpdateTask(next);
    setLabelsVisible(false);
    setLabelCreateOpen(false);
    closeMenu();
  }

  function applyWorkspaceLabel(entry: WorkspaceCustomLabel) {
    onUpdateTask({
      ...task,
      label: {
        kind: "custom",
        id: entry.id,
        name: entry.name,
        color: entry.color,
      },
    });
    setLabelsVisible(false);
    setLabelCreateOpen(false);
    closeMenu();
  }

  function clearLabel() {
    onUpdateTask({ ...task, label: undefined });
    setLabelsVisible(false);
    setLabelCreateOpen(false);
    closeMenu();
  }

  function handleCreateCustomLabel() {
    const trimmed = createLabelName.trim();
    if (!trimmed) {
      return;
    }
    const entry: WorkspaceCustomLabel = {
      id: `lbl-${crypto.randomUUID()}`,
      name: trimmed,
      color: createLabelColor,
    };
    onAddWorkspaceCustomLabel(entry);
    onUpdateTask({
      ...task,
      label: {
        kind: "custom",
        id: entry.id,
        name: entry.name,
        color: entry.color,
      },
    });
    setCreateLabelName("");
    setCreateLabelColor("blue");
    setLabelCreateOpen(false);
    setLabelsVisible(false);
    closeMenu();
  }

  function handleAddComment() {
    const text = commentDraft.trim();
    if (!text) {
      return;
    }
    onUpdateTask({
      ...task,
      comments: [...(task.comments ?? []), text],
    });
    setCommentDraft("");
  }

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={
        isDragging
          ? "animate-card-drop-slot pointer-events-none touch-none rounded-xl border border-dashed border-cyan-400/50 bg-zinc-900/40 p-3 shadow-[0_0_20px_rgba(0,0,0,0.35)] backdrop-blur-sm"
          : `group/card relative z-0 cursor-grab text-left hover:z-10 active:cursor-grabbing ${inboxCardInteractiveClass}`
      }
      {...attributes}
      {...listeners}
    >
      <div className={isDragging ? "invisible" : "w-full pr-9"}>
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
            <CardLabelBadge
              label={task.label}
              onRemove={() =>
                onUpdateTask({ ...task, label: undefined })
              }
            />
          </div>
        ) : null}
      </div>

      {!isDragging && (
        <div className="absolute right-2 top-2 z-10 opacity-0 transition-opacity group-hover/card:opacity-100">
          <button
            ref={menuTriggerRef}
            type="button"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            aria-label="Card actions"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-zinc-950/90 text-zinc-400 transition hover:border-white/20 hover:text-zinc-100"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              if (menuOpen) {
                setMenuCoords(null);
              }
              setMenuOpen((open) => !open);
            }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <MoreIcon />
          </button>
        </div>
      )}

      {hydrated && menuOpen && menuCoords
        ? createPortal(
            <div
              ref={menuPanelRef}
              role="menu"
              style={{
                position: "fixed",
                top: menuCoords.top,
                right: menuCoords.right,
                zIndex: INBOX_CARD_MENU_Z,
              }}
              className={`${inboxCardMenuPanelClass} pointer-events-auto scale-100 opacity-100`}
            >
              <button
                type="button"
                role="menuitem"
                className="block w-full px-3 py-2 text-left text-xs font-semibold text-zinc-200 transition hover:bg-white/5"
                onClick={() => {
                  closeMenu();
                  setOpenCardVisible(true);
                }}
              >
                Open Card
              </button>
              <button
                type="button"
                role="menuitem"
                className="block w-full px-3 py-2 text-left text-xs font-semibold text-zinc-200 transition hover:bg-white/5"
                onClick={() => {
                  closeMenu();
                  setLabelCreateOpen(false);
                  setCreateLabelName("");
                  setCreateLabelColor("blue");
                  setLabelsVisible(true);
                }}
              >
                Edit Labels
              </button>
              <button
                type="button"
                role="menuitem"
                className="block w-full px-3 py-2 text-left text-xs font-semibold text-zinc-200 transition hover:bg-white/5"
                onClick={() => {
                  onDuplicateTask(task);
                  closeMenu();
                }}
              >
                Copy Card
              </button>
              <button
                type="button"
                role="menuitem"
                className="block w-full px-3 py-2 text-left text-xs font-semibold text-red-300/90 transition hover:bg-red-500/10"
                onClick={() => {
                  onDeleteTask(task.id);
                  closeMenu();
                }}
              >
                Delete Card
              </button>
            </div>,
            document.body,
          )
        : null}

      {hydrated && openCardVisible
        ? createPortal(
            <div
              className={modalOverlayClass}
              role="presentation"
              onClick={() => setOpenCardVisible(false)}
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={`inbox-open-${task.id}-title`}
                className={modalPanelClass}
                onClick={(e) => e.stopPropagation()}
              >
                <h2
                  id={`inbox-open-${task.id}-title`}
                  className="text-base font-bold tracking-wide text-zinc-100"
                >
                  {task.title}
                </h2>
                <div className="mt-3 border-t border-white/10 pt-3">
                  <p className="text-[0.65rem] font-bold uppercase tracking-widest text-zinc-500">
                    Description
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-zinc-300">
                    {task.description.trim()
                      ? task.description
                      : "No description."}
                  </p>
                </div>
                <div className="mt-4 border-t border-white/10 pt-3">
                  <p className="text-[0.65rem] font-bold uppercase tracking-widest text-zinc-500">
                    Comments
                  </p>
                  {task.comments && task.comments.length > 0 ? (
                    <ul className="mt-2 max-h-40 space-y-2 overflow-y-auto pr-1">
                      {task.comments.map((c, i) => (
                        <li
                          key={`${task.id}-c-${i}`}
                          className="rounded-lg border border-white/10 bg-zinc-950/60 px-2.5 py-2 text-xs text-zinc-300"
                        >
                          {c}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-xs text-zinc-500">
                      No comments yet.
                    </p>
                  )}
                  <div className="mt-3 flex gap-2">
                    <input
                      id={commentInputId}
                      value={commentDraft}
                      onChange={(e) => setCommentDraft(e.target.value)}
                      placeholder="Write a comment…"
                      className={inboxInputClass}
                      maxLength={500}
                      aria-label="New comment"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleAddComment();
                        }
                      }}
                    />
                    <button
                      type="button"
                      className={`shrink-0 ${modalBtnPrimary} px-3`}
                      onClick={handleAddComment}
                    >
                      Add
                    </button>
                  </div>
                </div>
                <div className="mt-5 flex justify-end border-t border-white/10 pt-4">
                  <button
                    type="button"
                    className={modalBtnSecondary}
                    onClick={() => setOpenCardVisible(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}

      {hydrated && labelsVisible
        ? createPortal(
            <div
              className={modalOverlayClass}
              role="presentation"
              onClick={() => setLabelsVisible(false)}
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={`inbox-labels-${task.id}-title`}
                className={modalPanelClass}
                onClick={(e) => e.stopPropagation()}
              >
                <h2
                  id={`inbox-labels-${task.id}-title`}
                  className="text-base font-bold tracking-wide text-zinc-100"
                >
                  Edit Labels
                </h2>
                <p className="mt-1 text-xs text-zinc-500">
                  Default colors show as a slim bar above the title — tap the
                  same color again to remove. Custom labels include a title and
                  stay in this board&apos;s list.
                </p>
                {task.label ? (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-[0.65rem] font-bold uppercase tracking-widest text-zinc-500">
                      On card
                    </span>
                    <CardLabelBadge label={task.label} />
                    <button
                      type="button"
                      className="rounded-lg border border-zinc-600 px-2 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-zinc-400 transition hover:border-red-400/40 hover:text-red-300"
                      onClick={clearLabel}
                    >
                      Remove
                    </button>
                  </div>
                ) : null}
                <p className="mt-4 text-[0.65rem] font-bold uppercase tracking-widest text-zinc-500">
                  Default labels
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {LABEL_COLOR_ORDER.map((c) => {
                    const selected = labelsMatch(task.label, {
                      kind: "preset",
                      color: c,
                    });
                    return (
                      <button
                        key={c}
                        type="button"
                        title={LABEL_COLOR_META[c].title}
                        aria-pressed={selected}
                        className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition ${
                          selected
                            ? "border-white/80 ring-2 ring-cyan-400/50"
                            : "border-transparent hover:border-white/25"
                        }`}
                        onClick={() => applyPreset(c)}
                      >
                        <span
                          className={`h-6 w-6 rounded-full ${LABEL_COLOR_META[c].dotClass}`}
                        />
                      </button>
                    );
                  })}
                </div>
                {workspaceCustomLabels.length > 0 ? (
                  <>
                    <p className="mt-4 text-[0.65rem] font-bold uppercase tracking-widest text-zinc-500">
                      Your labels
                    </p>
                    <ul className="mt-2 flex max-h-32 flex-col gap-1.5 overflow-y-auto pr-1">
                      {workspaceCustomLabels.map((entry) => {
                        const selected =
                          task.label?.kind === "custom" &&
                          task.label.id === entry.id;
                        return (
                          <li key={entry.id}>
                            <button
                              type="button"
                              aria-pressed={selected}
                              className={`flex w-full items-center gap-2 rounded-lg border px-2 py-2 text-left text-xs font-semibold transition ${
                                selected
                                  ? "border-cyan-400/50 bg-cyan-500/10 text-zinc-100"
                                  : "border-white/10 text-zinc-300 hover:border-white/20 hover:bg-white/[0.04]"
                              }`}
                              onClick={() => applyWorkspaceLabel(entry)}
                            >
                              <span
                                className={`h-3 w-3 shrink-0 rounded-full ${LABEL_COLOR_META[entry.color].dotClass}`}
                              />
                              <span className="truncate">{entry.name}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </>
                ) : null}
                {!labelCreateOpen ? (
                  <button
                    type="button"
                    className={`${modalBtnSecondary} mt-4 w-full border-dashed border-blue-400/35 text-[0.65rem]`}
                    onClick={() => setLabelCreateOpen(true)}
                  >
                    Create Label
                  </button>
                ) : (
                  <div className="mt-4 rounded-xl border border-white/10 bg-zinc-950/50 p-3">
                    <p className="text-[0.65rem] font-bold uppercase tracking-widest text-zinc-500">
                      New custom label
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {LABEL_COLOR_ORDER.map((c) => {
                        const selected = createLabelColor === c;
                        return (
                          <button
                            key={c}
                            type="button"
                            title={LABEL_COLOR_META[c].title}
                            className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition ${
                              selected
                                ? "border-white/80 ring-2 ring-cyan-400/50"
                                : "border-transparent hover:border-white/25"
                            }`}
                            onClick={() => setCreateLabelColor(c)}
                          >
                            <span
                              className={`h-5 w-5 rounded-full ${LABEL_COLOR_META[c].dotClass}`}
                            />
                          </button>
                        );
                      })}
                    </div>
                    <input
                      value={createLabelName}
                      onChange={(e) => setCreateLabelName(e.target.value)}
                      placeholder="Label title"
                      className={`${inboxInputClass} mt-2`}
                      maxLength={40}
                      aria-label="New label title"
                    />
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        className={`flex-1 ${modalBtnPrimary}`}
                        onClick={handleCreateCustomLabel}
                      >
                        Add &amp; apply
                      </button>
                      <button
                        type="button"
                        className={`flex-1 ${modalBtnSecondary}`}
                        onClick={() => {
                          setLabelCreateOpen(false);
                          setCreateLabelName("");
                          setCreateLabelColor("blue");
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                <div className="mt-5 flex justify-end border-t border-white/10 pt-4">
                  <button
                    type="button"
                    className={modalBtnSecondary}
                    onClick={() => {
                      setLabelsVisible(false);
                      setLabelCreateOpen(false);
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </article>
  );
});

export function InboxCardPreview({ task }: { task: InboxTask }) {
  return (
    <article
      className={`relative w-[min(100vw-3rem,254px)] cursor-grab pointer-events-none text-left opacity-[0.65] ${inboxCardSurfaceClass}`}
    >
      <div className="w-full">
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
      </div>
    </article>
  );
}

export function BoardInboxSection({
  tasks,
  onAddInboxTask,
  onUpdateInboxTask,
  onDeleteInboxTask,
  onDuplicateInboxTask,
  workspaceCustomLabels,
  onAddWorkspaceCustomLabel,
  dropIndicatorIndex,
  dropSlotMinHeightPx,
}: {
  tasks: InboxTask[];
  onAddInboxTask: (task: InboxTask) => void;
  onUpdateInboxTask: (task: InboxTask) => void;
  onDeleteInboxTask: (id: string) => void;
  onDuplicateInboxTask: (task: InboxTask) => void;
  workspaceCustomLabels: WorkspaceCustomLabel[];
  onAddWorkspaceCustomLabel: (label: WorkspaceCustomLabel) => void;
  /** Show a card-shaped slot before the card at this index (or after the last card when `tasks.length`). */
  dropIndicatorIndex: number | null;
  /** Dragged card height for slot sizing (`active.rect.initial`); optional. */
  dropSlotMinHeightPx?: number | null;
}) {
  const { setNodeRef: setInboxDropRef, isOver: isInboxDropOver } = useDroppable({
    id: WORKSPACE_INBOX_ZONE_ID,
  });

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");

  function resetForm() {
    setTitle("");
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
      description: "",
    });
    resetForm();
  }

  return (
    <aside
      className="w-full shrink-0 lg:w-[min(100%,300px)]"
      aria-label="Inbox"
    >
      <section className="rounded-2xl border border-white/10 bg-[var(--stitch-surface)] p-4 shadow-[0_0_40px_rgba(0,0,0,0.45)] backdrop-blur-md lg:p-5">
        <div className="relative z-0 mb-3 border-b border-white/10 pb-2">
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
            <div className="flex min-h-[min(70vh,720px)] max-h-[min(70vh,720px)] flex-col gap-2 overflow-y-auto pb-4 pr-1">
              {tasks.length === 0 ? (
                <>
                  {dropIndicatorIndex === 0 ? (
                    <BoardCardDropSlot minHeightPx={dropSlotMinHeightPx} />
                  ) : null}
                  <p className="py-6 text-center text-[0.65rem] text-zinc-500">
                    No tasks yet — drop cards here or add below.
                  </p>
                </>
              ) : (
                tasks.map((task, index) => (
                  <Fragment key={task.id}>
                    {dropIndicatorIndex === index ? (
                      <BoardCardDropSlot minHeightPx={dropSlotMinHeightPx} />
                    ) : null}
                    <InboxSortableCard
                      task={task}
                      disabled={false}
                      onUpdateTask={onUpdateInboxTask}
                      onDeleteTask={onDeleteInboxTask}
                      onDuplicateTask={onDuplicateInboxTask}
                      workspaceCustomLabels={workspaceCustomLabels}
                      onAddWorkspaceCustomLabel={onAddWorkspaceCustomLabel}
                    />
                  </Fragment>
                ))
              )}
              {dropIndicatorIndex === tasks.length && tasks.length > 0 ? (
                <BoardCardDropSlot minHeightPx={dropSlotMinHeightPx} />
              ) : null}

              <div className="mt-1">
                {!showForm ? (
                  <button
                    type="button"
                    onClick={() => setShowForm(true)}
                    className={`w-full cursor-pointer text-left ${inboxCardSurfaceClass} text-sm font-bold tracking-wide text-zinc-500 transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:text-zinc-300 hover:shadow-[0_12px_36px_rgba(0,0,0,0.5)]`}
                  >
                    + Add card
                  </button>
                ) : (
                  <form onSubmit={handleSubmit} className={inboxCardSurfaceClass}>
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
          </SortableContext>
        </div>
      </section>
    </aside>
  );
}
