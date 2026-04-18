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
  /** ISO 8601 from server or set when the task is created client-side */
  createdAt?: string;
};

/** Droppable id for the inbox list (shared with board-workspace drag logic). */
export const WORKSPACE_INBOX_ZONE_ID = "workspace-inbox-zone";

const inboxCardSurfaceClass = "stitch-kanban-card-surface touch-none p-3";

const inboxCardInteractiveClass = `${inboxCardSurfaceClass} transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_12px_36px_rgba(103,80,164,0.12)] dark:hover:shadow-[0_8px_24px_rgba(167,139,250,0.1)]`;

const inboxInputClass =
  "w-full rounded-xl border-0 bg-ds-surface-container-high px-2 py-1.5 text-xs text-ds-on-surface outline-none ring-0 placeholder:text-ds-on-surface-variant focus:bg-ds-surface-container-lowest focus:ring-2 focus:ring-ds-primary-container/25";

const modalOverlayClass =
  "stitch-modal-overlay fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-200 ease-out";

const modalPanelClass =
  "max-h-[min(85vh,720px)] w-full max-w-lg overflow-y-auto rounded-[28px] bg-ds-surface-container-lowest p-6 shadow-[0_24px_64px_rgba(26,28,28,0.12)] ring-1 ring-ds-on-surface/[0.06] transition-[opacity,transform,box-shadow,border-color] duration-200 ease-out dark:border dark:border-slate-700/50 dark:shadow-[0_12px_40px_rgba(0,0,0,0.45)] dark:ring-slate-600/30";

const modalBtnPrimary =
  "stitch-btn-primary px-4 py-2 text-xs font-bold uppercase tracking-widest";

const modalBtnSecondary =
  "stitch-btn-secondary px-4 py-2 text-xs font-bold uppercase tracking-widest";

/** Below modals (z-100), above board columns and overflow containers */
const INBOX_CARD_MENU_Z = 95;

const inboxCardMenuPanelClass =
  "stitch-glass-panel-dense min-w-[10.5rem] origin-top-right py-1 transition-[opacity,transform] duration-150 ease-out";

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
          ? "animate-card-drop-slot pointer-events-none touch-none rounded-xl border border-dashed border-ds-primary-container/45 bg-ds-surface-container-lowest/90 p-3 shadow-[0_1px_3px_rgba(26,28,28,0.08)] transition-colors duration-300 dark:border-slate-600/50 dark:shadow-[0_1px_0_rgba(0,0,0,0.45)]"
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
        <h3 className="text-sm font-bold tracking-wide text-ds-on-surface">
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
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-ds-outline-variant/25 bg-ds-surface-container-high text-ds-on-surface-variant transition hover:border-ds-outline-variant/40 hover:text-ds-on-surface"
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
                className="block w-full px-3 py-2 text-left text-xs font-semibold text-ds-on-surface transition hover:bg-white/5"
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
                className="block w-full px-3 py-2 text-left text-xs font-semibold text-ds-on-surface transition hover:bg-white/5"
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
                className="block w-full px-3 py-2 text-left text-xs font-semibold text-ds-on-surface transition hover:bg-white/5"
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
                className="block w-full px-3 py-2 text-left text-xs font-semibold text-red-300/90 transition-colors duration-200 hover:bg-red-500/10 dark:hover:bg-red-950/40"
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
                  className="text-base font-bold tracking-wide text-ds-on-surface"
                >
                  {task.title}
                </h2>
                <div className="mt-3 border-t border-ds-outline-variant/25 pt-3">
                  <p className="text-[0.65rem] font-bold uppercase tracking-widest text-ds-on-surface-variant">
                    Description
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-ds-on-surface-variant">
                    {task.description.trim()
                      ? task.description
                      : "No description."}
                  </p>
                </div>
                <div className="mt-4 border-t border-ds-outline-variant/25 pt-3">
                  <p className="text-[0.65rem] font-bold uppercase tracking-widest text-ds-on-surface-variant">
                    Comments
                  </p>
                  {task.comments && task.comments.length > 0 ? (
                    <ul className="mt-2 max-h-40 space-y-2 overflow-y-auto pr-1">
                      {task.comments.map((c, i) => (
                        <li
                          key={`${task.id}-c-${i}`}
                          className="rounded-lg border border-ds-outline-variant/25 bg-ds-surface-container-high px-2.5 py-2 text-xs text-ds-on-surface-variant"
                        >
                          {c}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-xs text-ds-on-surface-variant">
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
                <div className="mt-5 flex justify-end border-t border-ds-outline-variant/25 pt-4">
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
                  className="text-base font-bold tracking-wide text-ds-on-surface"
                >
                  Edit Labels
                </h2>
                <p className="mt-1 text-xs text-ds-on-surface-variant">
                  Default colors show as a slim bar above the title — tap the
                  same color again to remove. Custom labels include a title and
                  stay in this board&apos;s list.
                </p>
                {task.label ? (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-[0.65rem] font-bold uppercase tracking-widest text-ds-on-surface-variant">
                      On card
                    </span>
                    <CardLabelBadge label={task.label} />
                    <button
                      type="button"
                      className="rounded-lg border border-ds-outline-variant/40 px-2 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-ds-on-surface-variant transition hover:border-ds-error/35 hover:text-ds-error"
                      onClick={clearLabel}
                    >
                      Remove
                    </button>
                  </div>
                ) : null}
                <p className="mt-4 text-[0.65rem] font-bold uppercase tracking-widest text-ds-on-surface-variant">
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
                            ? "border-white/80 ring-2 ring-ds-primary-container/35"
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
                    <p className="mt-4 text-[0.65rem] font-bold uppercase tracking-widest text-ds-on-surface-variant">
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
                                  ? "border-ds-primary-container/40 bg-ds-primary-fixed/50 text-ds-on-surface"
                                  : "border-ds-outline-variant/25 text-ds-on-surface-variant hover:border-white/20 hover:bg-white/[0.04]"
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
                    className={`${modalBtnSecondary} mt-4 w-full border-dashed border-ds-primary-container/30 text-[0.65rem]`}
                    onClick={() => setLabelCreateOpen(true)}
                  >
                    Create Label
                  </button>
                ) : (
                  <div className="mt-4 rounded-xl border border-ds-outline-variant/25 bg-ds-surface-container-low p-3">
                    <p className="text-[0.65rem] font-bold uppercase tracking-widest text-ds-on-surface-variant">
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
                                ? "border-white/80 ring-2 ring-ds-primary-container/35"
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
                <div className="mt-5 flex justify-end border-t border-ds-outline-variant/25 pt-4">
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
        <h3 className="text-sm font-bold tracking-wide text-ds-on-surface">
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
      id: crypto.randomUUID(),
      title: trimmed,
      description: "",
      createdAt: new Date().toISOString(),
    });
    resetForm();
  }

  return (
    <aside
      className="w-full shrink-0 lg:w-[min(100%,300px)]"
      aria-label="Inbox"
    >
      <section className="stitch-glass-panel rounded-2xl p-4 transition-colors duration-300 lg:p-5">
        <div className="relative z-0 mb-3 border-b border-ds-outline-variant/25 pb-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-ds-on-surface-variant">
            Inbox
          </h2>
        </div>

        <div
          ref={setInboxDropRef}
          className={`rounded-xl transition-[box-shadow,ring] duration-200 ease-out ${
            isInboxDropOver
              ? "ring-2 ring-ds-primary-container/35 ring-offset-2 ring-offset-ds-surface-container-low"
              : ""
          }`}
        >
          <SortableContext
            items={tasks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="ds-scroll-thin flex min-h-[min(70vh,720px)] max-h-[min(70vh,720px)] flex-col gap-2 overflow-x-hidden overflow-y-auto pb-4 pr-1">
              {tasks.length === 0 ? (
                <>
                  {dropIndicatorIndex === 0 ? (
                    <BoardCardDropSlot minHeightPx={dropSlotMinHeightPx} />
                  ) : null}
                  <p className="py-6 text-center text-[0.65rem] text-ds-on-surface-variant">
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
                    className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ds-outline-variant/35 py-6 text-[10px] font-bold uppercase tracking-widest text-ds-on-surface-variant transition-all hover:border-ds-primary-container/35 hover:text-ds-primary"
                  >
                    + Add card
                  </button>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    className="rounded-xl border-0 bg-ds-surface-container-high p-4 shadow-sm ring-1 ring-ds-on-surface/[0.04] transition-colors duration-300 dark:border dark:border-slate-700/40 dark:shadow-[0_1px_0_rgba(0,0,0,0.35)] dark:ring-slate-600/20"
                  >
                    <input
                      autoFocus
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Card title…"
                      className="w-full rounded-xl border-0 bg-ds-surface-container-lowest px-3 py-2 text-sm font-semibold tracking-tight text-ds-on-surface outline-none ring-0 placeholder:text-ds-on-surface-variant focus:ring-2 focus:ring-ds-primary-container/25"
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
