"use client";

import {
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Fragment,
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";

import { BoardCardDropSlot } from "./board-card-drop-slot";
import { CardLabelBadge } from "./board-label-badge";
import {
  LABEL_COLOR_META,
  LABEL_COLOR_ORDER,
  labelsMatch,
  type LabelColor,
  type WorkspaceCustomLabel,
} from "./board-labels";
import {
  type ColumnMeta,
  type ColumnTasks,
  type KanbanColumnId,
  type KanbanTask,
  LIST_COLOR_PRESETS,
  TAG_PILL_CLASSES,
} from "./board-kanban-model";
import { BOARD_SORTABLE_TRANSITION } from "./board-sortable-transition";

/* ─── Stitch Kanban card / column (HTML refs in docs/design/stitch-export/) ─── */

const kanbanCardSurfaceClass =
  "rounded-xl bg-ds-surface-container-lowest p-5 shadow-[0_1px_2px_rgba(26,28,28,0.06)] flex flex-col gap-4 transition-colors duration-300 dark:border dark:border-slate-700/50 dark:shadow-[0_1px_0_rgba(0,0,0,0.45)]";

const kanbanCardInteractiveClass = `${kanbanCardSurfaceClass} stitch-ambient-glow`;

/* ─── card-menu / modal UI classes ─── */

const CARD_MENU_Z = 95;

const cardMenuPanelClass =
  "stitch-glass-panel-dense min-w-[10.5rem] origin-top-right py-1 transition-[opacity,transform] duration-150 ease-out";

const modalOverlayClass =
  "stitch-modal-overlay fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-200 ease-out";

const modalPanelClass =
  "max-h-[min(85vh,720px)] w-full max-w-lg overflow-y-auto rounded-[28px] bg-ds-surface-container-lowest p-6 shadow-[0_24px_64px_rgba(26,28,28,0.12)] ring-1 ring-ds-on-surface/[0.06] transition-[opacity,transform,box-shadow,border-color] duration-200 ease-out dark:border dark:border-slate-700/50 dark:shadow-[0_12px_40px_rgba(0,0,0,0.45)] dark:ring-slate-600/30";

const taskDetailRootClass =
  "fixed inset-0 z-[100] flex justify-end";

const taskDetailBackdropClass =
  "absolute inset-0 bg-ds-on-surface/10 backdrop-blur-sm transition-colors duration-300 dark:bg-slate-950/55";

const taskDetailPanelClass =
  "relative z-10 flex h-full max-h-[100dvh] w-full max-w-2xl flex-col overflow-hidden bg-ds-surface-container-lowest shadow-2xl transition-colors duration-300 dark:border-l dark:border-slate-700/50 dark:shadow-[0_0_48px_rgba(0,0,0,0.5)]";

const modalBtnPrimary =
  "stitch-btn-primary px-4 py-2 text-xs font-bold uppercase tracking-widest";

const modalBtnSecondary =
  "stitch-btn-secondary px-4 py-2 text-xs font-bold uppercase tracking-widest";

/* ─── helpers ─── */

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

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

function AddCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" strokeLinecap="round" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════
   SortableCard — title edit · card menu · modals
   ═══════════════════════════════════════════════════════════ */

const SortableCard = memo(function SortableCard({
  task,
  columnTitle,
  disabled,
  onRenameCard,
  onUpdateCard,
  onDeleteCard,
  onDuplicateCard,
  workspaceCustomLabels,
  onAddWorkspaceCustomLabel,
}: {
  task: KanbanTask;
  columnTitle: string;
  disabled: boolean;
  onRenameCard: (id: string, title: string) => void;
  onUpdateCard: (task: KanbanTask) => void;
  onDeleteCard: (id: string) => void;
  onDuplicateCard: (task: KanbanTask) => void;
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

  /* ── inline title editing ── */
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  function handleTitleSave() {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== task.title) {
      onRenameCard(task.id, trimmed);
    } else {
      setEditTitle(task.title);
    }
    setIsEditingTitle(false);
  }

  /* ── card actions menu ── */
  const [menuOpen, setMenuOpen] = useState(false);
  const [openCardVisible, setOpenCardVisible] = useState(false);
  const [labelsVisible, setLabelsVisible] = useState(false);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);
  const [menuCoords, setMenuCoords] = useState<{ top: number; right: number } | null>(null);

  const [labelCreateOpen, setLabelCreateOpen] = useState(false);
  const [createLabelName, setCreateLabelName] = useState("");
  const [createLabelColor, setCreateLabelColor] = useState<LabelColor>("blue");
  const hydrated = useHydrated();

  const updateMenuCoords = useCallback(() => {
    const el = menuTriggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setMenuCoords({ top: r.bottom + 4, right: window.innerWidth - r.right });
  }, []);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    setMenuCoords(null);
  }, []);

  useLayoutEffect(() => {
    if (!menuOpen) return;
    updateMenuCoords();
    window.addEventListener("scroll", updateMenuCoords, true);
    window.addEventListener("resize", updateMenuCoords);
    return () => {
      window.removeEventListener("scroll", updateMenuCoords, true);
      window.removeEventListener("resize", updateMenuCoords);
    };
  }, [menuOpen, updateMenuCoords]);

  useEffect(() => {
    if (!menuOpen) return;
    function handlePointerDown(e: PointerEvent) {
      const t = e.target as Node;
      if (menuTriggerRef.current?.contains(t) || menuPanelRef.current?.contains(t)) return;
      closeMenu();
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [menuOpen, closeMenu]);

  useEffect(() => {
    if (!openCardVisible && !labelsVisible && !menuOpen) return;
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

  /* ── label actions ── */

  function applyPreset(color: LabelColor) {
    const next: KanbanTask = labelsMatch(task.label, { kind: "preset", color })
      ? { ...task, label: undefined }
      : { ...task, label: { kind: "preset", color } };
    onUpdateCard(next);
    setLabelsVisible(false);
    setLabelCreateOpen(false);
    closeMenu();
  }

  function applyWorkspaceLabel(entry: WorkspaceCustomLabel) {
    onUpdateCard({
      ...task,
      label: { kind: "custom", id: entry.id, name: entry.name, color: entry.color },
    });
    setLabelsVisible(false);
    setLabelCreateOpen(false);
    closeMenu();
  }

  function clearLabel() {
    onUpdateCard({ ...task, label: undefined });
    setLabelsVisible(false);
    setLabelCreateOpen(false);
    closeMenu();
  }

  function handleCreateCustomLabel() {
    const trimmed = createLabelName.trim();
    if (!trimmed) return;
    const entry: WorkspaceCustomLabel = {
      id: `lbl-${crypto.randomUUID()}`,
      name: trimmed,
      color: createLabelColor,
    };
    onAddWorkspaceCustomLabel(entry);
    onUpdateCard({
      ...task,
      label: { kind: "custom", id: entry.id, name: entry.name, color: entry.color },
    });
    setCreateLabelName("");
    setCreateLabelColor("blue");
    setLabelCreateOpen(false);
    setLabelsVisible(false);
    closeMenu();
  }

  /* ── card content shared between drag-handle and editing mode ── */

  const presetLabel =
    task.label?.kind === "preset" ? (
      <div className="mb-2">
        <CardLabelBadge label={task.label} />
      </div>
    ) : null;

  const customLabelAfterTitle =
    task.label?.kind === "custom" ? (
      <div className="mt-1.5">
        <CardLabelBadge label={task.label} />
      </div>
    ) : null;

  const tagsList = task.tags.length > 0 ? (
    <ul className="flex flex-wrap gap-1.5">
      {task.tags.map((tag, i) => (
        <li
          key={tag}
          className={`rounded-full px-2.5 py-0.5 ${TAG_PILL_CLASSES[i % TAG_PILL_CLASSES.length]}`}
        >
          {tag}
        </li>
      ))}
    </ul>
  ) : null;

  const dueLine = task.dueAt ? (
    <div className="flex items-center gap-1.5 text-ds-on-surface-variant/80">
      <span className="text-[10px] font-medium">
        {new Date(`${task.dueAt}T12:00:00`).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        })}
      </span>
    </div>
  ) : null;

  /* ── render ── */

  return (
    <article
      ref={setNodeRef}
      data-kanban-card
      style={style}
      className={
        isDragging
          ? "animate-card-drop-slot pointer-events-none flex min-h-[5rem] touch-none flex-col gap-4 rounded-xl border border-dashed border-ds-primary-container/50 bg-ds-surface-container-lowest/90 p-5 shadow-[0_1px_3px_rgba(26,28,28,0.08)] transition-colors duration-300 dark:border-slate-600/50 dark:shadow-[0_1px_0_rgba(0,0,0,0.45)]"
          : `group/card relative z-0 hover:z-[5] ${kanbanCardInteractiveClass}`
      }
      onClick={(e) => {
        if (isDragging || isEditingTitle) return;
        const el = e.target as HTMLElement | null;
        if (!el) return;
        if (
          el.closest("[data-kanban-card-menu]") ||
          el.closest("[data-kanban-card-title-edit]")
        ) {
          return;
        }
        setOpenCardVisible(true);
      }}
    >
      {isEditingTitle && !isDragging ? (
        <div className="flex w-full flex-col gap-4">
          {presetLabel}
          <input
            ref={titleInputRef}
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === "Enter") {
                e.preventDefault();
                handleTitleSave();
              }
              if (e.key === "Escape") {
                setEditTitle(task.title);
                setIsEditingTitle(false);
              }
            }}
            onBlur={() => {
              setEditTitle(task.title);
              setIsEditingTitle(false);
            }}
            className="w-full bg-transparent text-base font-semibold tracking-tighter text-ds-on-surface outline-none"
            maxLength={120}
            aria-label="Edit card title"
          />
          {customLabelAfterTitle}
          {tagsList}
          {dueLine}
        </div>
      ) : (
        <div
          className={
            isDragging
              ? "invisible w-full"
              : "flex w-full flex-col gap-4 text-left active:cursor-grabbing"
          }
          {...attributes}
          {...listeners}
        >
          {presetLabel}
          <h3 className="m-0 inline min-w-0 text-base font-semibold leading-snug tracking-tighter text-ds-on-surface">
            <button
              type="button"
              data-kanban-card-title-edit
              className="inline-block w-fit max-w-full cursor-text rounded-sm border-0 bg-transparent p-0 text-left font-semibold tracking-tighter text-ds-on-surface outline-none transition hover:text-ds-primary focus-visible:ring-2 focus-visible:ring-ds-primary-container/35 focus-visible:ring-offset-2 focus-visible:ring-offset-ds-surface-container-lowest"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setEditTitle(task.title);
                setIsEditingTitle(true);
              }}
            >
              {task.title}
            </button>
          </h3>
          {customLabelAfterTitle}
          {tagsList}
          {dueLine ? <div className="mt-2 min-h-[1rem] min-w-0">{dueLine}</div> : null}
        </div>
      )}

      {/* card actions trigger */}
      {!isDragging ? (
        <div
          data-kanban-card-menu
          className="absolute right-2 top-2 flex opacity-0 transition-opacity duration-150 group-hover/card:opacity-100"
        >
          <button
            ref={menuTriggerRef}
            type="button"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            aria-label="Card options"
            className="flex h-7 w-7 items-center justify-center rounded-md border border-ds-outline-variant/20 bg-ds-surface-container-high text-ds-on-surface-variant transition hover:border-ds-primary/25 hover:bg-ds-secondary-container/40 hover:text-ds-primary active:scale-95"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              if (menuOpen) setMenuCoords(null);
              setMenuOpen((o) => !o);
            }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <PencilIcon />
          </button>
        </div>
      ) : null}

      {/* ──── dropdown menu (portal) ──── */}
      {hydrated && menuOpen && menuCoords
        ? createPortal(
            <div
              ref={menuPanelRef}
              role="menu"
              style={{ position: "fixed", top: menuCoords.top, right: menuCoords.right, zIndex: CARD_MENU_Z }}
              className={`${cardMenuPanelClass} pointer-events-auto scale-100 opacity-100`}
            >
              <button
                type="button"
                role="menuitem"
                className="block w-full px-3 py-2 text-left text-xs font-semibold text-ds-on-surface transition hover:bg-ds-surface-container-high/70"
                onClick={() => { closeMenu(); setOpenCardVisible(true); }}
              >
                Open Card
              </button>
              <button
                type="button"
                role="menuitem"
                className="block w-full px-3 py-2 text-left text-xs font-semibold text-ds-on-surface transition hover:bg-ds-surface-container-high/70"
                onClick={() => { closeMenu(); setLabelCreateOpen(false); setCreateLabelName(""); setCreateLabelColor("blue"); setLabelsVisible(true); }}
              >
                Edit Labels
              </button>
              <button
                type="button"
                role="menuitem"
                className="block w-full px-3 py-2 text-left text-xs font-semibold text-ds-on-surface transition hover:bg-ds-surface-container-high/70"
                onClick={() => { onDuplicateCard(task); closeMenu(); }}
              >
                Copy Card
              </button>
              <button
                type="button"
                role="menuitem"
                className="block w-full px-3 py-2 text-left text-xs font-semibold text-ds-error transition-colors duration-200 hover:bg-red-50 dark:hover:bg-red-950/35"
                onClick={() => { onDeleteCard(task.id); closeMenu(); }}
              >
                Delete Card
              </button>
            </div>,
            document.body,
          )
        : null}

      {/* ──── Task detail — Stitch slide-over (screen 4adda96c…) ──── */}
      {hydrated && openCardVisible
        ? createPortal(
            <div className={taskDetailRootClass} role="presentation">
              <div
                className={taskDetailBackdropClass}
                aria-hidden
                onClick={() => setOpenCardVisible(false)}
              />
              <div
                role="dialog"
                aria-modal="true"
                aria-label="Task details"
                className={taskDetailPanelClass}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-6 py-5 md:px-8">
                  <div className="flex min-w-0 items-center gap-3">
                    <button
                      type="button"
                      className="rounded-full p-2 text-ds-on-surface-variant transition hover:bg-ds-surface-container-low hover:text-ds-primary active:scale-95"
                      aria-label="Close task details"
                      onClick={() => setOpenCardVisible(false)}
                    >
                      <span className="sr-only">Close</span>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                        <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                      </svg>
                    </button>
                    <span className="truncate text-xs font-bold uppercase tracking-widest text-ds-on-surface-variant">
                      {columnTitle}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {/* TODO: Re-implement logic — archive / complete task */}
                    <button
                      type="button"
                      className="rounded-xl px-3 py-2 text-sm font-bold text-ds-on-surface-variant transition hover:bg-ds-surface-container-low hover:text-ds-primary active:scale-95"
                    >
                      Archive
                    </button>
                    <button
                      type="button"
                      className="stitch-btn-primary rounded-xl px-4 py-2 text-sm font-bold shadow-md"
                    >
                      Complete
                    </button>
                  </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-8 py-6 md:px-12 md:py-8">
                  <div className="mb-10">
                    <h2 className="text-3xl font-black leading-tight tracking-tight text-ds-on-surface md:text-4xl">
                      {task.title}
                    </h2>
                  </div>

                  <div className="mb-12 grid grid-cols-1 gap-y-8 gap-x-10 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-bold uppercase tracking-widest text-ds-on-surface-variant">
                        Assignee
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ds-primary-fixed text-[10px] font-black text-ds-on-primary-fixed">
                          ?
                        </span>
                        <span className="text-sm font-semibold text-ds-on-surface-variant">Unassigned</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-bold uppercase tracking-widest text-ds-on-surface-variant">
                        Due date
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-ds-primary" aria-hidden>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="4" y="5" width="16" height="15" rx="2" />
                            <path d="M8 3v4M16 3v4M4 11h16" strokeLinecap="round" />
                          </svg>
                        </span>
                        <span className="text-sm font-semibold text-ds-on-surface">
                          {task.dueAt
                            ? new Date(`${task.dueAt}T12:00:00`).toLocaleDateString(undefined, {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "No due date"}
                        </span>
                      </div>
                    </div>
                    {task.label ? (
                      <div className="flex flex-col gap-2 sm:col-span-2">
                        <span className="text-xs font-bold uppercase tracking-widest text-ds-on-surface-variant">
                          Label
                        </span>
                        <div className="flex flex-wrap gap-2">
                          <CardLabelBadge label={task.label} />
                        </div>
                      </div>
                    ) : null}
                    {task.tags.length > 0 ? (
                      <div className="flex flex-col gap-2 sm:col-span-2">
                        <span className="text-xs font-bold uppercase tracking-widest text-ds-on-surface-variant">
                          Tags
                        </span>
                        <ul className="flex flex-wrap gap-2">
                          {task.tags.map((tag, i) => (
                            <li
                              key={tag}
                              className={`rounded-lg px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${TAG_PILL_CLASSES[i % TAG_PILL_CLASSES.length]}`}
                            >
                              {tag}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>

                  <div className="mb-12">
                    <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-ds-on-surface-variant">
                      Description
                    </h3>
                    <div className="rounded-2xl bg-ds-surface-container-low p-5 md:p-6">
                      <p className="font-medium leading-relaxed text-ds-on-surface">
                        {task.description.trim() ? task.description : "No description yet."}
                      </p>
                    </div>
                  </div>

                  {/* TODO: Re-implement logic — subtasks from API / card model (Stitch checklist) */}
                  <div className="mb-12 opacity-60">
                    <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-ds-on-surface-variant">
                      Subtasks
                    </h3>
                    <p className="text-sm text-ds-on-surface-variant">Not wired to data in this build.</p>
                  </div>

                  {/* TODO: Re-implement logic — comments & activity feed */}
                  <div className="mb-8 opacity-60">
                    <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-ds-on-surface-variant">
                      Activity
                    </h3>
                    <p className="text-sm text-ds-on-surface-variant">Activity stream not connected.</p>
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}

      {/* ──── Edit Labels modal ──── */}
      {hydrated && labelsVisible
        ? createPortal(
            <div className={modalOverlayClass} role="presentation" onClick={() => setLabelsVisible(false)}>
              <div role="dialog" aria-modal="true" className={modalPanelClass} onClick={(e) => e.stopPropagation()}>
                <h2 className="text-base font-bold tracking-wide text-ds-on-surface">Edit Labels</h2>
                <p className="mt-1 text-xs text-ds-on-surface-variant">
                  Default colors show as a slim bar above the title — tap the same color again to remove.
                </p>

                {task.label ? (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-[0.65rem] font-bold uppercase tracking-widest text-ds-on-surface-variant">On card</span>
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

                <p className="mt-4 text-[0.65rem] font-bold uppercase tracking-widest text-ds-on-surface-variant">Default labels</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {LABEL_COLOR_ORDER.map((c) => {
                    const selected = labelsMatch(task.label, { kind: "preset", color: c });
                    return (
                      <button
                        key={c}
                        type="button"
                        title={LABEL_COLOR_META[c].title}
                        aria-pressed={selected}
                        className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition ${
                          selected ? "border-ds-primary-container/40 ring-2 ring-[color:var(--stitch-focus-ring)]" : "border-transparent hover:border-ds-outline-variant/40"
                        }`}
                        onClick={() => applyPreset(c)}
                      >
                        <span className={`h-6 w-6 rounded-full ${LABEL_COLOR_META[c].dotClass}`} />
                      </button>
                    );
                  })}
                </div>

                {workspaceCustomLabels.length > 0 ? (
                  <>
                    <p className="mt-4 text-[0.65rem] font-bold uppercase tracking-widest text-ds-on-surface-variant">Your labels</p>
                    <ul className="mt-2 flex max-h-32 flex-col gap-1.5 overflow-y-auto pr-1">
                      {workspaceCustomLabels.map((entry) => {
                        const selected = task.label?.kind === "custom" && task.label.id === entry.id;
                        return (
                          <li key={entry.id}>
                            <button
                              type="button"
                              aria-pressed={selected}
                              className={`flex w-full items-center gap-2 rounded-lg border px-2 py-2 text-left text-xs font-semibold transition ${
                                selected
                                  ? "border-[color:var(--stitch-drag-slot)] bg-[color-mix(in_srgb,var(--stitch-m3-primary)_14%,transparent)] text-ds-on-surface"
                                  : "border-ds-outline-variant/25 text-ds-on-surface-variant hover:border-white/20 hover:bg-ds-surface-container-high/50"
                              }`}
                              onClick={() => applyWorkspaceLabel(entry)}
                            >
                              <span className={`h-3 w-3 shrink-0 rounded-full ${LABEL_COLOR_META[entry.color].dotClass}`} />
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
                    className={`${modalBtnSecondary} mt-4 w-full border-dashed border-[color:color-mix(in_srgb,var(--stitch-m3-primary)_38%,transparent)] text-[0.65rem]`}
                    onClick={() => setLabelCreateOpen(true)}
                  >
                    Create Label
                  </button>
                ) : (
                  <div className="mt-4 rounded-xl border border-ds-outline-variant/25 bg-ds-surface-container-low p-3">
                    <p className="text-[0.65rem] font-bold uppercase tracking-widest text-ds-on-surface-variant">New custom label</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {LABEL_COLOR_ORDER.map((c) => {
                        const sel = createLabelColor === c;
                        return (
                          <button
                            key={c}
                            type="button"
                            title={LABEL_COLOR_META[c].title}
                            className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition ${
                              sel ? "border-ds-primary-container/40 ring-2 ring-[color:var(--stitch-focus-ring)]" : "border-transparent hover:border-ds-outline-variant/40"
                            }`}
                            onClick={() => setCreateLabelColor(c)}
                          >
                            <span className={`h-5 w-5 rounded-full ${LABEL_COLOR_META[c].dotClass}`} />
                          </button>
                        );
                      })}
                    </div>
                    <input
                      value={createLabelName}
                      onChange={(e) => setCreateLabelName(e.target.value)}
                      placeholder="Label title"
                      className="mt-2 w-full rounded-xl border-0 bg-ds-surface-container-high px-2 py-1.5 text-xs text-ds-on-surface outline-none ring-0 placeholder:text-ds-on-surface-variant focus:bg-ds-surface-container-lowest focus:ring-2 focus:ring-ds-primary-container/25"
                      maxLength={40}
                      aria-label="New label title"
                    />
                    <div className="mt-2 flex gap-2">
                      <button type="button" className={`flex-1 ${modalBtnPrimary}`} onClick={handleCreateCustomLabel}>
                        Add &amp; apply
                      </button>
                      <button
                        type="button"
                        className={`flex-1 ${modalBtnSecondary}`}
                        onClick={() => { setLabelCreateOpen(false); setCreateLabelName(""); setCreateLabelColor("blue"); }}
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
                    onClick={() => { setLabelsVisible(false); setLabelCreateOpen(false); }}
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

/* ═══════════════════════════════════════════════════════════
   Drag previews (unchanged)
   ═══════════════════════════════════════════════════════════ */

export function CardPreview({ task }: { task: KanbanTask }) {
  const preset =
    task.label?.kind === "preset" ? (
      <div className="mb-2">
        <CardLabelBadge label={task.label} />
      </div>
    ) : null;
  const custom =
    task.label?.kind === "custom" ? (
      <div className="mt-1.5">
        <CardLabelBadge label={task.label} />
      </div>
    ) : null;
  const due =
    task.dueAt != null ? (
      <div className="flex items-center gap-1.5 text-ds-on-surface-variant/80">
        <span className="text-[10px] font-medium">
          {new Date(`${task.dueAt}T12:00:00`).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>
    ) : null;
  return (
    <article
      className={`pointer-events-none w-[min(100vw-3rem,280px)] opacity-[0.72] ${kanbanCardSurfaceClass}`}
    >
      <div className="flex w-full flex-col gap-4 text-left">
        {preset}
        <h3 className="text-base font-semibold leading-snug tracking-tighter text-ds-on-surface">{task.title}</h3>
        {custom}
        {task.tags.length > 0 ? (
          <ul className="flex flex-wrap gap-1.5">
            {task.tags.map((tag, i) => (
              <li
                key={tag}
                className={`rounded-full px-2.5 py-0.5 ${TAG_PILL_CLASSES[i % TAG_PILL_CLASSES.length]}`}
              >
                {tag}
              </li>
            ))}
          </ul>
        ) : null}
        {due ? <div className="mt-2 min-h-[1rem] min-w-0">{due}</div> : null}
      </div>
    </article>
  );
}

export function ColumnDragPreview({
  title,
  taskCount,
}: {
  title: string;
  taskCount: number;
}) {
  return (
    <div
      className="pointer-events-none flex w-[min(100vw-3rem,280px)] flex-col gap-2 rounded-xl bg-ds-primary-fixed/50 px-2 py-3 opacity-[0.85] ring-2 ring-ds-primary-container/35"
    >
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-ds-primary">
          <span>{title}</span>
          <span className="rounded-full bg-ds-primary-fixed px-2 py-0.5 text-[10px] font-bold text-ds-on-primary-fixed-variant tabular-nums">
            {taskCount}
          </span>
        </h2>
        <MoreIcon className="text-ds-on-surface-variant/70" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   KanbanColumn
   ═══════════════════════════════════════════════════════════ */

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
  onRenameCard,
  onUpdateCard,
  onDeleteCard,
  onDuplicateCard,
  workspaceCustomLabels,
  onAddWorkspaceCustomLabel,
  dropIndicatorIndex,
  dropSlotMinHeightPx,
}: {
  columnId: KanbanColumnId;
  tasks: KanbanTask[];
  meta: ColumnMeta;
  onAddCard: (columnId: KanbanColumnId, task: KanbanTask) => void;
  isSelected: boolean;
  onSelectColumn: (columnId: KanbanColumnId) => void;
  onRenameColumn: (columnId: KanbanColumnId, title: string) => void;
  onRenameCard: (columnId: KanbanColumnId, taskId: string, title: string) => void;
  onUpdateCard: (columnId: KanbanColumnId, task: KanbanTask) => void;
  onDeleteCard: (columnId: KanbanColumnId, taskId: string) => void;
  onDuplicateCard: (columnId: KanbanColumnId, task: KanbanTask) => void;
  workspaceCustomLabels: WorkspaceCustomLabel[];
  onAddWorkspaceCustomLabel: (label: WorkspaceCustomLabel) => void;
  dropIndicatorIndex: number | null;
  dropSlotMinHeightPx?: number | null;
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
      id: crypto.randomUUID(),
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
      className={
        isColumnDragging
          ? "flex w-[min(100%,280px)] shrink-0 animate-card-drop-slot flex-col overflow-hidden rounded-xl border-2 border-dashed border-ds-primary-container/45 bg-ds-primary-fixed/40 backdrop-blur-sm transition-colors duration-300 dark:border-slate-600/55"
          : `${meta.columnShellClass} relative z-0 overflow-visible transition-colors duration-300 has-[[data-kanban-card]:hover]:z-20 ${
              isSelected
                ? "rounded-xl ring-2 ring-ds-primary-container/30 ring-offset-2 ring-offset-ds-surface-container-low dark:ring-offset-slate-950"
                : ""
            }`
      }
    >
      <div
        className={`flex items-center justify-between px-2 ${
          isColumnDragging ? "invisible" : "cursor-grab touch-none active:cursor-grabbing"
        }`}
        {...attributes}
        {...listeners}
      >
        <div
          role="button"
          tabIndex={0}
          aria-pressed={isSelected}
          aria-label={`${meta.title} column. ${isSelected ? "Selected for inbox copy." : "Select for inbox copy."}`}
          className="min-w-0 flex-1 cursor-pointer outline-none transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[color:var(--stitch-focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-ds-surface-container-low"
          onClick={() => {
            if (!isEditingTitle) onSelectColumn(columnId);
          }}
          onPointerDown={(e) => {
            if (isEditingTitle) e.stopPropagation();
          }}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && !isEditingTitle) {
              e.preventDefault();
              onSelectColumn(columnId);
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
                e.stopPropagation();
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
              className="w-full bg-transparent text-sm font-black uppercase tracking-widest text-ds-primary outline-none"
              maxLength={60}
              aria-label="Edit column title"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <h2
              className="flex cursor-text flex-wrap items-center gap-2 text-sm font-black uppercase tracking-widest text-ds-primary"
              onClick={(e) => {
                e.stopPropagation();
                setEditTitle(meta.title);
                setIsEditingTitle(true);
              }}
            >
              <span>{meta.title}</span>
              <span className="rounded-full bg-ds-primary-fixed px-2 py-0.5 text-[10px] font-bold text-ds-on-primary-fixed-variant tabular-nums">
                {tasks.length}
              </span>
              <span className="sr-only">
                {tasks.length} {tasks.length === 1 ? "card" : "cards"}
              </span>
            </h2>
          )}
          {isEditingTitle ? (
            <span className="sr-only">
              {tasks.length} {tasks.length === 1 ? "card" : "cards"}
            </span>
          ) : null}
        </div>
        <button
          type="button"
          className="shrink-0 rounded-lg p-1 text-ds-on-surface-variant/70 transition hover:bg-ds-surface-container-low hover:text-ds-primary active:scale-95"
          aria-label="Column menu"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          <MoreIcon />
        </button>
      </div>

      <div
        className={`ds-scroll-thin flex max-h-[min(70vh,720px)] min-h-0 flex-col gap-4 overflow-x-hidden overflow-y-auto pr-0.5 ${isColumnDragging ? "invisible" : ""}`}
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className={columnId === "done" ? "flex flex-col gap-4 opacity-70" : "flex flex-col gap-4"}>
          {tasks.length === 0 ? (
            <>
              {dropIndicatorIndex === 0 ? (
                <BoardCardDropSlot minHeightPx={dropSlotMinHeightPx} />
              ) : null}
            </>
          ) : (
            <>
              {tasks.map((task, index) => (
                <Fragment key={task.id}>
                  {dropIndicatorIndex === index ? (
                    <BoardCardDropSlot minHeightPx={dropSlotMinHeightPx} />
                  ) : null}
                  <SortableCard
                    columnTitle={meta.title}
                    task={task}
                    disabled={false}
                    onRenameCard={(id, newTitle) => onRenameCard(columnId, id, newTitle)}
                    onUpdateCard={(updated) => onUpdateCard(columnId, updated)}
                    onDeleteCard={(id) => onDeleteCard(columnId, id)}
                    onDuplicateCard={(t) => onDuplicateCard(columnId, t)}
                    workspaceCustomLabels={workspaceCustomLabels}
                    onAddWorkspaceCustomLabel={onAddWorkspaceCustomLabel}
                  />
                </Fragment>
              ))}
              {dropIndicatorIndex === tasks.length ? (
                <BoardCardDropSlot minHeightPx={dropSlotMinHeightPx} />
              ) : null}
            </>
          )}
          </div>
        </SortableContext>

        <div className="pt-1">
          {!showForm ? (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="group flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ds-outline-variant/40 py-6 text-ds-on-surface-variant transition-all hover:border-ds-primary/30 hover:text-ds-primary active:scale-[0.99]"
            >
              <AddCircleIcon className="transition-transform group-hover:scale-110" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Add another task</span>
            </button>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="rounded-xl bg-ds-surface-container-high p-4 shadow-[0_1px_2px_rgba(26,28,28,0.06)] transition-colors duration-300 dark:border dark:border-slate-700/45 dark:shadow-[0_1px_0_rgba(0,0,0,0.35)]"
            >
              <input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Card title…"
                className="w-full rounded-xl border-0 bg-ds-surface-container-lowest px-4 py-3 text-sm font-semibold tracking-tight text-ds-on-surface outline-none ring-0 transition-all placeholder:text-ds-on-surface-variant/60 focus:bg-ds-surface-container-lowest focus:ring-2 focus:ring-ds-primary/20"
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

/* ═══════════════════════════════════════════════════════════
   AddListButton — with color selector
   ═══════════════════════════════════════════════════════════ */

function AddListButton({
  onAddColumn,
}: {
  onAddColumn: (title: string, accent: { accentBarClass: string; columnShellClass: string }) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [selectedColor, setSelectedColor] = useState(0);

  function resetForm() {
    setTitle("");
    setSelectedColor(0);
    setShowForm(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    const p = LIST_COLOR_PRESETS[selectedColor];
    onAddColumn(trimmed, {
      accentBarClass: p.accentBarClass,
      columnShellClass: p.columnShellClass,
    });
    resetForm();
  }

  if (!showForm) {
    return (
      <button
        type="button"
        onClick={() => setShowForm(true)}
        className="group flex w-[min(100%,280px)] shrink-0 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ds-outline-variant/40 py-8 text-ds-on-surface-variant transition-all hover:border-ds-primary/30 hover:text-ds-primary active:scale-[0.99]"
      >
        <AddCircleIcon className="transition-transform group-hover:scale-110" />
        <span className="text-[10px] font-bold uppercase tracking-widest">Add list</span>
      </button>
    );
  }

  return (
    <div className="flex w-[min(100%,280px)] shrink-0 flex-col rounded-[28px] bg-ds-surface-container-lowest p-4 shadow-[0_16px_48px_rgba(26,28,28,0.08)] ring-1 ring-ds-on-surface/[0.06] backdrop-blur-md transition-colors duration-300 dark:border dark:border-slate-700/50 dark:shadow-[0_12px_36px_rgba(0,0,0,0.45)] dark:ring-slate-600/25">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="List title…"
          className="w-full rounded-xl border-0 bg-ds-surface-container-high px-3 py-2 text-sm font-bold tracking-wide text-ds-on-surface outline-none ring-0 placeholder:text-ds-on-surface-variant focus:bg-ds-surface-container-lowest focus:ring-2 focus:ring-ds-primary-container/25"
          maxLength={60}
          aria-label="New list title"
          onKeyDown={(e) => {
            if (e.key === "Escape") resetForm();
          }}
          onBlur={() => {
            if (!title.trim()) resetForm();
          }}
        />

        <div>
          <p className="mb-1.5 text-[0.65rem] font-bold uppercase tracking-widest text-ds-on-surface-variant">
            Color
          </p>
          <div className="flex flex-wrap gap-1.5">
            {LIST_COLOR_PRESETS.map((preset, i) => (
              <button
                key={preset.name}
                type="button"
                title={preset.name}
                className={`flex h-7 w-7 items-center justify-center rounded-full border-2 transition ${
                  selectedColor === i
                    ? "border-ds-primary-container/40 ring-2 ring-[color:var(--stitch-focus-ring)]"
                    : "border-transparent hover:border-ds-outline-variant/40"
                }`}
                onClick={() => setSelectedColor(i)}
              >
                <span className={`h-4 w-4 rounded-full ${preset.dotClass}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="stitch-btn-primary px-3 py-1.5 text-xs font-bold uppercase tracking-widest"
          >
            Add
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="rounded-lg border border-ds-outline-variant/25 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-ds-on-surface-variant transition hover:text-ds-on-surface"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   KanbanBoardSection
   ═══════════════════════════════════════════════════════════ */

export function KanbanBoardSection({
  columns,
  columnOrder,
  columnMeta,
  onAddCard,
  selectedColumnId,
  onSelectColumn,
  onRenameColumn,
  onAddColumn,
  onRenameCard,
  onUpdateCard,
  onDeleteCard,
  onDuplicateCard,
  workspaceCustomLabels,
  onAddWorkspaceCustomLabel,
  columnDropIndicators,
  dropSlotMinHeightPx,
}: {
  columns: ColumnTasks;
  columnOrder: string[];
  columnMeta: Record<string, ColumnMeta>;
  onAddCard: (columnId: KanbanColumnId, task: KanbanTask) => void;
  selectedColumnId: KanbanColumnId | null;
  onSelectColumn: (columnId: KanbanColumnId) => void;
  onRenameColumn: (columnId: KanbanColumnId, title: string) => void;
  onAddColumn: (title: string, accent: { accentBarClass: string; columnShellClass: string }) => void;
  onRenameCard: (columnId: KanbanColumnId, taskId: string, title: string) => void;
  onUpdateCard: (columnId: KanbanColumnId, task: KanbanTask) => void;
  onDeleteCard: (columnId: KanbanColumnId, taskId: string) => void;
  onDuplicateCard: (columnId: KanbanColumnId, task: KanbanTask) => void;
  workspaceCustomLabels: WorkspaceCustomLabel[];
  onAddWorkspaceCustomLabel: (label: WorkspaceCustomLabel) => void;
  columnDropIndicators: Record<string, number | null>;
  dropSlotMinHeightPx?: number | null;
}) {
  return (
    <section className="min-w-0 transition-colors duration-300">
      <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-ds-on-surface-variant/80 dark:text-slate-400">
        Drag from Inbox or between columns · reorder within a column · drag the column header to
        reorder lists
      </p>

      <div className="-mx-1 flex items-start gap-8 overflow-x-auto overflow-y-visible pb-2 pt-1 ds-scroll-thin">
        <SortableContext
          items={columnOrder}
          strategy={horizontalListSortingStrategy}
        >
          {columnOrder.map((columnId) => (
            <KanbanColumn
              key={columnId}
              columnId={columnId}
              tasks={columns[columnId] ?? []}
              meta={
                columnMeta[columnId] ?? {
                  title: columnId,
                  accentBarClass: "",
                  columnShellClass:
                    "flex w-[min(100%,280px)] shrink-0 min-h-0 flex-col gap-6",
                }
              }
              onAddCard={onAddCard}
              isSelected={selectedColumnId === columnId}
              onSelectColumn={onSelectColumn}
              onRenameColumn={onRenameColumn}
              onRenameCard={onRenameCard}
              onUpdateCard={onUpdateCard}
              onDeleteCard={onDeleteCard}
              onDuplicateCard={onDuplicateCard}
              workspaceCustomLabels={workspaceCustomLabels}
              onAddWorkspaceCustomLabel={onAddWorkspaceCustomLabel}
              dropIndicatorIndex={columnDropIndicators[columnId] ?? null}
              dropSlotMinHeightPx={dropSlotMinHeightPx}
            />
          ))}
        </SortableContext>

        <AddListButton onAddColumn={onAddColumn} />
      </div>
    </section>
  );
}
