"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import type { BoardJson } from "@/features/board/board.types";

import { BoardKanban } from "./board-kanban";
import { BauhausBoardShell } from "./bauhaus-board-shell";

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
        <p className="text-sm text-zinc-600">Loading board…</p>
      </BauhausBoardShell>
    );
  }

  if (notFound || !board) {
    return (
      <BauhausBoardShell title="Board" subtitle="Not found">
        <div className="mx-auto max-w-lg space-y-4 border-4 border-black bg-white p-6 shadow-[8px_8px_0_0_rgb(0,0,0)]">
          <p className="text-sm uppercase tracking-wide text-zinc-600">
            This board does not exist or you do not have access.
          </p>
          <Link
            href="/my-boards"
            className="inline-block border-4 border-black bg-[#2563eb] px-4 py-2 text-sm font-bold uppercase tracking-wide text-white"
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
      subtitle="Kanban · Bauhaus"
      actions={
        <>
          <label className="flex flex-col gap-1 text-xs uppercase tracking-widest text-zinc-300">
            <span className="sr-only">Board title</span>
            <input
              type="text"
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={() => void saveTitle()}
              className="min-w-[12rem] border-2 border-zinc-600 bg-zinc-900 px-2 py-1 text-sm font-medium normal-case tracking-normal text-white outline-none focus:border-white"
              maxLength={200}
              aria-label="Board title"
            />
          </label>
          <button
            type="button"
            disabled={saving || titleDraft.trim() === board.title}
            onClick={() => void saveTitle()}
            className="border-2 border-white bg-[#ca8a04] px-3 py-1 text-xs font-bold uppercase tracking-widest text-black disabled:opacity-50"
          >
            Save
          </button>
          <Link
            href="/my-boards"
            className="border-2 border-white px-3 py-1 text-xs font-bold uppercase tracking-widest text-white hover:bg-white hover:text-black"
          >
            My boards
          </Link>
        </>
      }
    >
      {saveError ? (
        <p className="mb-4 text-sm text-[#fecaca]" role="alert">
          {saveError}
        </p>
      ) : null}
      <BoardKanban />
    </BauhausBoardShell>
  );
}
