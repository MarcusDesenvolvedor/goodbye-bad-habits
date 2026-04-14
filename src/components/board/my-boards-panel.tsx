"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { BoardJson } from "@/features/board/board.types";

async function parseJsonResponse(res: Response): Promise<{
  ok: boolean;
  data: unknown;
}> {
  const data: unknown = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

export function MyBoardsPanel() {
  const [boards, setBoards] = useState<BoardJson[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      await Promise.resolve();
      if (cancelled) {
        return;
      }
      setLoadError(null);
      const res = await fetch("/api/boards", { credentials: "include" });
      if (cancelled) {
        return;
      }
      const { ok, data } = await parseJsonResponse(res);
      if (!ok || !Array.isArray(data)) {
        setLoadError("Could not load boards.");
        setBoards([]);
        return;
      }
      setBoards(data as BoardJson[]);
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
    const res = await fetch("/api/boards", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: trimmed }),
    });
    const { ok, data } = await parseJsonResponse(res);
    setCreating(false);
    if (!ok) {
      setCreateError("Could not create board.");
      return;
    }
    setTitle("");
    setBoards((prev) => {
      const next = prev ? [data as BoardJson, ...prev] : [data as BoardJson];
      return next;
    });
  }

  async function handleDelete(boardId: string) {
    if (!globalThis.confirm("Delete this board? Lists and cards will be removed.")) {
      return;
    }
    const res = await fetch(`/api/boards/${boardId}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) {
      setLoadError("Could not delete board.");
      return;
    }
    const listRes = await fetch("/api/boards", { credentials: "include" });
    const listParsed = await parseJsonResponse(listRes);
    if (listParsed.ok && Array.isArray(listParsed.data)) {
      setBoards(listParsed.data as BoardJson[]);
      return;
    }
    setBoards((prev) => (prev ? prev.filter((b) => b.id !== boardId) : prev));
  }

  return (
    <section className="rounded-2xl border border-ds-outline-variant/25 bg-ds-surface-container-lowest p-6 shadow-[0_8px_32px_rgba(26,28,28,0.08)] backdrop-blur-md">
      <div className="mb-6 flex flex-col gap-4 border-b border-ds-outline-variant/20 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="stitch-accent-bar mb-3 h-1 w-44 rounded-full" aria-hidden />
          <h2 className="text-lg font-bold uppercase tracking-widest text-ds-on-surface">
            Your workspaces
          </h2>
          <p className="text-xs uppercase tracking-wide text-ds-on-surface-variant">
            Boards you created · open one to use the Kanban
          </p>
        </div>
        <form
          onSubmit={handleCreate}
          className="flex w-full max-w-md flex-col gap-2 sm:flex-row sm:items-stretch"
        >
          <input
            type="text"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="New board title"
            className="min-w-0 flex-1 rounded-xl border-0 bg-ds-surface-container-high px-3 py-2 text-sm text-ds-on-surface outline-none ring-0 placeholder:text-ds-on-surface-variant focus:bg-ds-surface-container-lowest focus:ring-2 focus:ring-ds-primary-container/25"
            maxLength={200}
            aria-label="New board title"
          />
          <button
            type="submit"
            disabled={creating || !title.trim()}
            className="stitch-btn-primary px-4 py-2 text-sm font-bold uppercase tracking-wide disabled:opacity-50"
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
        <p className="text-sm uppercase tracking-wide text-ds-on-surface-variant">
          No boards yet — create one above.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {boards.map((board) => (
            <li
              key={board.id}
              className="flex flex-col overflow-hidden rounded-xl bg-ds-surface-container-lowest shadow-[0_1px_3px_rgba(26,28,28,0.08)] ring-1 ring-ds-on-surface/[0.06] backdrop-blur-md"
            >
              <Link
                href={`/board/${board.id}`}
                className="flex-1 px-4 py-4 transition hover:bg-ds-surface-container-low"
              >
                <span className="block text-base font-bold tracking-wide text-ds-on-surface">
                  {board.title}
                </span>
                <span className="mt-1 block text-xs text-ds-on-surface-variant">
                  Updated {new Date(board.updatedAt).toLocaleString()}
                </span>
              </Link>
              <div className="flex border-t border-ds-outline-variant/20">
                <button
                  type="button"
                  onClick={() => void handleDelete(board.id)}
                  className="flex-1 border-r border-ds-outline-variant/20 bg-ds-surface-container-low py-2 text-xs font-bold uppercase tracking-widest text-ds-on-surface-variant transition hover:bg-red-50 hover:text-ds-error"
                >
                  Delete
                </button>
                <Link
                  href={`/board/${board.id}`}
                  className="stitch-btn-primary flex-1 py-2 text-center text-xs font-bold uppercase tracking-widest"
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
