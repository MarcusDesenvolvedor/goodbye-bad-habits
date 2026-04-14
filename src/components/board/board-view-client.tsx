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
        <p className="text-sm text-ds-on-surface-variant">Loading board…</p>
      </BauhausBoardShell>
    );
  }

  if (notFound || !board) {
    return (
      <BauhausBoardShell title="Board" subtitle="Not found">
        <div className="mx-auto max-w-lg space-y-4 rounded-2xl bg-ds-surface-container-lowest p-6 shadow-[0_8px_32px_rgba(26,28,28,0.1)] ring-1 ring-ds-on-surface/[0.06]">
          <p className="text-sm uppercase tracking-wide text-ds-on-surface-variant">
            This board does not exist or you do not have access.
          </p>
          <Link
            href="/my-boards"
            className="stitch-btn-primary inline-block px-4 py-2 text-sm font-bold uppercase tracking-wide"
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
          <label className="flex flex-col gap-1 text-xs uppercase tracking-widest text-ds-on-surface-variant">
            <span className="sr-only">Board title</span>
            <input
              type="text"
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={() => void saveTitle()}
              className="min-w-[12rem] rounded-xl border-0 bg-ds-surface-container-high px-3 py-2 text-sm font-medium normal-case tracking-normal text-ds-on-surface outline-none focus:bg-ds-surface-container-lowest focus:ring-2 focus:ring-ds-primary-container/25"
              maxLength={200}
              aria-label="Board title"
            />
          </label>
          <button
            type="button"
            disabled={saving || titleDraft.trim() === board.title}
            onClick={() => void saveTitle()}
            className="stitch-btn-primary px-3 py-1.5 text-xs font-bold uppercase tracking-widest disabled:opacity-50"
          >
            Save
          </button>
          <Link
            href="/my-boards"
            className="rounded-xl border border-ds-outline-variant/35 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-ds-on-surface transition hover:border-ds-primary-container/40 hover:text-ds-primary"
          >
            My boards
          </Link>
        </>
      }
    >
      {saveError ? (
        <p className="mb-4 text-sm text-ds-error" role="alert">
          {saveError}
        </p>
      ) : null}
      <BoardWorkspace />
    </BauhausBoardShell>
  );
}
