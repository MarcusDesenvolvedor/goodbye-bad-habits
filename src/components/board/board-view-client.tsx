"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import type { BoardJson } from "@/features/board/board.types";

import { BauhausBoardShell } from "./bauhaus-board-shell";
import { BoardWorkspace } from "./board-workspace";

type Props = { boardId: string };

export function BoardViewClient({ boardId }: Props) {
  const [board, setBoard] = useState<BoardJson | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [titleDraft, setTitleDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      await Promise.resolve();
      if (cancelled) {
        return;
      }
      setLoading(true);
      setNotFound(false);
      setSaveError(null);
      const res = await fetch(`/api/boards/${boardId}`, {
        credentials: "include",
      });
      if (cancelled) {
        return;
      }
      if (res.status === 404) {
        setBoard(null);
        setNotFound(true);
        setLoading(false);
        return;
      }
      if (!res.ok) {
        setBoard(null);
        setNotFound(true);
        setLoading(false);
        return;
      }
      const data = (await res.json()) as BoardJson;
      setBoard(data);
      setTitleDraft(data.title);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [boardId]);

  const saveTitle = useCallback(async () => {
    const trimmed = titleDraft.trim();
    if (!trimmed || !board || trimmed === board.title) {
      return;
    }
    setSaving(true);
    setSaveError(null);
    const res = await fetch(`/api/boards/${boardId}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: trimmed }),
    });
    setSaving(false);
    if (!res.ok) {
      setSaveError("Could not update title.");
      return;
    }
    const updated = (await res.json()) as BoardJson;
    setBoard(updated);
    setTitleDraft(updated.title);
  }, [board, boardId, titleDraft]);

  if (loading) {
    return (
      <BauhausBoardShell title="Board" subtitle="Loading">
        <p className="text-sm text-zinc-400">Loading board…</p>
      </BauhausBoardShell>
    );
  }

  if (notFound || !board) {
    return (
      <BauhausBoardShell title="Board" subtitle="Not found">
        <div className="mx-auto max-w-lg space-y-4 rounded-2xl border border-white/10 bg-zinc-900/50 p-6 shadow-[0_0_40px_rgba(0,0,0,0.4)] backdrop-blur-md">
          <p className="text-sm uppercase tracking-wide text-zinc-400">
            This board does not exist or you do not have access.
          </p>
          <Link
            href="/my-boards"
            className="inline-block rounded-lg border border-blue-400/50 bg-blue-600/90 px-4 py-2 text-sm font-bold uppercase tracking-wide text-white shadow-[0_0_20px_rgba(59,130,246,0.35)]"
          >
            Back to my boards
          </Link>
        </div>
      </BauhausBoardShell>
    );
  }

  return (
    <BauhausBoardShell
      title={titleDraft.trim() ? titleDraft : board.title}
      subtitle="Active · Kanban"
      actions={
        <>
          <label className="flex flex-col gap-1 text-xs uppercase tracking-widest text-zinc-500">
            <span className="sr-only">Board title</span>
            <input
              type="text"
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={() => void saveTitle()}
              className="min-w-[12rem] rounded-lg border border-white/15 bg-zinc-950/90 px-2 py-1.5 text-sm font-medium normal-case tracking-normal text-zinc-100 outline-none focus:border-blue-400/50 focus:ring-2 focus:ring-blue-500/30"
              maxLength={200}
              aria-label="Board title"
            />
          </label>
          <button
            type="button"
            disabled={saving || titleDraft.trim() === board.title}
            onClick={() => void saveTitle()}
            className="rounded-lg border border-violet-400/45 bg-violet-600/85 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-white shadow-[0_0_18px_rgba(139,92,246,0.35)] disabled:opacity-50"
          >
            Save
          </button>
          <Link
            href="/my-boards"
            className="rounded-lg border border-blue-400/45 bg-transparent px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-zinc-200 shadow-[0_0_14px_rgba(59,130,246,0.12)] transition hover:border-cyan-400/50 hover:text-white"
          >
            My boards
          </Link>
        </>
      }
    >
      {saveError ? (
        <p className="mb-4 text-sm text-rose-400" role="alert">
          {saveError}
        </p>
      ) : null}
      <BoardWorkspace />
    </BauhausBoardShell>
  );
}
