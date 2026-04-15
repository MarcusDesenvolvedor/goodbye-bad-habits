"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import type { WorkspaceSaveBody } from "@/features/board/board.schema";
import type { BoardWorkspaceJson } from "@/features/board/board.types";
import {
  fetchBoardWorkspace,
  patchBoardTitle,
  saveBoardWorkspace,
} from "@/lib/api/boards";

import { BauhausBoardShell } from "./bauhaus-board-shell";
import { BoardWorkspace } from "./board-workspace";

type Props = { boardId: string };

export function BoardViewClient({ boardId }: Props) {
  const [workspace, setWorkspace] = useState<BoardWorkspaceJson | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [titleDraft, setTitleDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [persistError, setPersistError] = useState<string | null>(null);
  const [workspaceEpoch, setWorkspaceEpoch] = useState(0);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setLoading(true);
      setNotFound(false);
      setSaveError(null);
      setPersistError(null);
      try {
        const data = await fetchBoardWorkspace(boardId);
        if (cancelled) {
          return;
        }
        setWorkspace(data);
        setTitleDraft(data.board.title);
      } catch (e) {
        if (cancelled) {
          return;
        }
        if (e instanceof Error && e.message === "NOT_FOUND") {
          setWorkspace(null);
          setNotFound(true);
        } else {
          setWorkspace(null);
          setNotFound(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [boardId]);

  const onPersist = useCallback(
    async (body: WorkspaceSaveBody) => {
      try {
        setPersistError(null);
        await saveBoardWorkspace(boardId, body);
      } catch {
        setPersistError("Could not save board.");
        try {
          const data = await fetchBoardWorkspace(boardId);
          setWorkspace(data);
          setTitleDraft(data.board.title);
          setWorkspaceEpoch((n) => n + 1);
        } catch {
          /* ignore refetch errors */
        }
      }
    },
    [boardId],
  );

  const saveTitle = useCallback(async () => {
    if (!workspace) {
      return;
    }
    const trimmed = titleDraft.trim();
    if (!trimmed || trimmed === workspace.board.title) {
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const updated = await patchBoardTitle(boardId, trimmed);
      setWorkspace((w) => (w ? { ...w, board: updated } : w));
      setTitleDraft(updated.title);
    } catch {
      setSaveError("Could not update title.");
    } finally {
      setSaving(false);
    }
  }, [boardId, titleDraft, workspace]);

  if (loading) {
    return (
      <BauhausBoardShell title="Board" subtitle="Loading">
        <p className="text-sm text-ds-on-surface-variant">Loading board…</p>
      </BauhausBoardShell>
    );
  }

  if (notFound || !workspace) {
    return (
      <BauhausBoardShell title="Board" subtitle="Not found">
        <div className="mx-auto max-w-lg space-y-4 rounded-2xl bg-ds-surface-container-lowest p-6 shadow-[0_8px_32px_rgba(26,28,28,0.1)] ring-1 ring-ds-on-surface/[0.06] transition-colors duration-300 dark:border dark:border-slate-700/50 dark:shadow-[0_12px_40px_rgba(0,0,0,0.45)] dark:ring-slate-600/25">
          <p className="text-sm uppercase tracking-wide text-ds-on-surface-variant">
            This board does not exist or you do not have access.
          </p>
          <Link
            href="/my-boards"
            className="stitch-btn-primary inline-block px-4 py-2 text-sm font-bold uppercase tracking-wide"
          >
            Back to all boards
          </Link>
        </div>
      </BauhausBoardShell>
    );
  }

  const board = workspace.board;

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
        </>
      }
    >
      {saveError ? (
        <p className="mb-4 text-sm text-ds-error" role="alert">
          {saveError}
        </p>
      ) : null}
      {persistError ? (
        <p className="mb-4 text-sm text-ds-error" role="alert">
          {persistError}
        </p>
      ) : null}
      <BoardWorkspace
        key={`${boardId}-${workspaceEpoch}`}
        workspace={workspace}
        onPersist={onPersist}
      />
    </BauhausBoardShell>
  );
}
