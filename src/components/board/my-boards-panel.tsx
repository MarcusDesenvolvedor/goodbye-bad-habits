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
    setBoards((prev) => (prev ? prev.filter((b) => b.id !== boardId) : prev));
  }

  return (
    <section className="border-4 border-black bg-white p-6 shadow-[8px_8px_0_0_rgb(0,0,0)]">
      <div className="mb-6 flex flex-col gap-2 border-b-4 border-black pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-bold uppercase tracking-widest">
            Your workspaces
          </h2>
          <p className="text-xs uppercase tracking-wide text-zinc-500">
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
            className="min-w-0 flex-1 border-4 border-black bg-[#f4f1ea] px-3 py-2 text-sm outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-[#2563eb] focus:ring-offset-2"
            maxLength={200}
            aria-label="New board title"
          />
          <button
            type="submit"
            disabled={creating || !title.trim()}
            className="border-4 border-black bg-[#e11d48] px-4 py-2 text-sm font-bold uppercase tracking-wide text-white transition enabled:hover:bg-[#be123c] disabled:opacity-50"
          >
            Create
          </button>
        </form>
      </div>
      {createError ? (
        <p className="mb-4 text-sm text-[#b91c1c]" role="alert">
          {createError}
        </p>
      ) : null}
      {loadError ? (
        <p className="mb-4 text-sm text-[#b91c1c]" role="alert">
          {loadError}
        </p>
      ) : null}
      {boards === null ? (
        <p className="text-sm text-zinc-500">Loading boards…</p>
      ) : boards.length === 0 ? (
        <p className="text-sm uppercase tracking-wide text-zinc-500">
          No boards yet — create one above.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {boards.map((board) => (
            <li
              key={board.id}
              className="flex flex-col border-4 border-black bg-[#f4f1ea] shadow-[4px_4px_0_0_rgb(0,0,0)]"
            >
              <Link
                href={`/board/${board.id}`}
                className="flex-1 px-4 py-4 transition hover:bg-white"
              >
                <span className="block text-base font-bold uppercase tracking-wide">
                  {board.title}
                </span>
                <span className="mt-1 block text-xs text-zinc-500">
                  Updated {new Date(board.updatedAt).toLocaleString()}
                </span>
              </Link>
              <div className="flex border-t-4 border-black">
                <button
                  type="button"
                  onClick={() => void handleDelete(board.id)}
                  className="flex-1 border-r-4 border-black bg-black py-2 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-zinc-800"
                >
                  Delete
                </button>
                <Link
                  href={`/board/${board.id}`}
                  className="flex-1 bg-[#2563eb] py-2 text-center text-xs font-bold uppercase tracking-widest text-white transition hover:bg-blue-700"
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
