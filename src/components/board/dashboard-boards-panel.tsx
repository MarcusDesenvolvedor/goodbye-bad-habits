"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { BoardJson } from "@/features/board/board.types";
import {
  createBoard,
  deleteBoard,
  fetchBoards,
} from "@/lib/api/boards";

export function DashboardBoardsPanel() {
  const [boards, setBoards] = useState<BoardJson[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setLoadError(null);
      try {
        const data = await fetchBoards();
        if (!cancelled) {
          setBoards(data);
        }
      } catch {
        if (!cancelled) {
          setLoadError("Could not load boards.");
          setBoards([]);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      return;
    }
    setCreating(true);
    setCreateError(null);
    try {
      const created = await createBoard(trimmed);
      setTitle("");
      setBoards((prev) => (prev ? [created, ...prev] : [created]));
    } catch {
      setCreateError("Could not create board.");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(boardId: string) {
    if (
      !globalThis.confirm(
        "Delete this board? Lists and cards will be removed.",
      )
    ) {
      return;
    }
    try {
      await deleteBoard(boardId);
      try {
        const data = await fetchBoards();
        setBoards(data);
      } catch {
        setBoards((prev) => (prev ? prev.filter((b) => b.id !== boardId) : prev));
      }
    } catch {
      setLoadError("Could not delete board.");
    }
  }

  return (
    <section
      id="all-boards"
      className="scroll-mt-24 rounded-2xl bg-ds-surface-container-lowest p-6 shadow-[0_1px_3px_rgba(26,28,28,0.06)] transition-colors duration-300 md:p-8 dark:border dark:border-slate-700/45 dark:shadow-[0_1px_0_rgba(0,0,0,0.4)]"
    >
      <div className="mb-8 flex flex-col gap-6 border-b border-ds-outline-variant/15 pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-ds-on-surface">Your boards</h2>
          <p className="mt-1 text-sm text-ds-on-surface-variant">
            Open a board to work in the Kanban workspace.
          </p>
        </div>
        <form
          id="create-board"
          onSubmit={(e) => void handleCreate(e)}
          className="scroll-mt-28 flex w-full max-w-lg flex-col gap-2 sm:flex-row sm:items-stretch"
        >
          <input
            type="text"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="New board title"
            className="min-w-0 flex-1 rounded-xl border-0 bg-ds-surface-container-high px-4 py-3 text-sm text-ds-on-surface outline-none ring-0 transition placeholder:text-ds-on-surface-variant/70 focus:bg-ds-surface-container-lowest focus:ring-2 focus:ring-ds-primary/20"
            maxLength={200}
            aria-label="New board title"
          />
          <button
            type="submit"
            disabled={creating || !title.trim()}
            className="stitch-btn-primary shrink-0 rounded-xl px-5 py-3 text-sm font-bold uppercase tracking-wide disabled:opacity-50"
          >
            Create
          </button>
        </form>
      </div>
      {createError ? (
        <p className="mb-4 text-sm text-ds-error" role="alert">
          {createError}
        </p>
      ) : null}
      {loadError ? (
        <p className="mb-4 text-sm text-ds-error" role="alert">
          {loadError}
        </p>
      ) : null}
      {boards === null ? (
        <p className="text-sm text-ds-on-surface-variant">Loading boards…</p>
      ) : boards.length === 0 ? (
        <p className="text-sm text-ds-on-surface-variant">No boards yet — create one above.</p>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => (
            <li
              key={board.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-ds-outline-variant/10 bg-ds-surface-container-lowest shadow-[0_4px_24px_rgba(103,80,164,0.06)] transition-[transform,box-shadow,border-color] duration-300 hover:scale-[1.01] hover:shadow-[0_8px_28px_rgba(103,80,164,0.1)] dark:border-slate-700/50 dark:shadow-[0_4px_20px_rgba(0,0,0,0.35)] dark:hover:shadow-[0_8px_28px_rgba(167,139,250,0.12)]"
            >
              <Link
                href={`/board/${board.id}`}
                className="flex flex-1 flex-col px-5 py-5 transition-colors hover:bg-ds-surface-container-low/50"
              >
                <span className="text-base font-bold tracking-tight text-ds-on-surface">{board.title}</span>
                <span className="mt-2 text-xs text-ds-on-surface-variant">
                  Updated {new Date(board.updatedAt).toLocaleString()}
                </span>
              </Link>
              <div className="flex border-t border-ds-outline-variant/10">
                <button
                  type="button"
                  onClick={() => void handleDelete(board.id)}
                  className="flex-1 border-r border-ds-outline-variant/10 py-3 text-xs font-bold uppercase tracking-widest text-ds-on-surface-variant transition hover:bg-ds-error/5 hover:text-ds-error active:scale-[0.99]"
                >
                  Delete
                </button>
                <Link
                  href={`/board/${board.id}`}
                  className="stitch-btn-primary flex flex-1 items-center justify-center py-3 text-center text-xs font-bold uppercase tracking-widest"
                >
                  Open
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
