"use client";

const skeletonBar =
  "rounded-[12px] bg-slate-100 animate-pulse dark:bg-slate-800";

function SkeletonColumn({
  index,
  cardRows,
}: {
  index: number;
  cardRows: number[];
}) {
  const isFirst = index === 0;
  return (
    <div
      className="flex w-[min(100%,280px)] shrink-0 flex-col gap-6"
      aria-hidden
    >
      {isFirst ? (
        <div
          className="h-0.5 w-full rounded-full bg-ds-primary/45 animate-pulse"
          aria-hidden
        />
      ) : (
        <div className="h-0.5 w-full rounded-full bg-transparent" aria-hidden />
      )}
      <div className="flex items-center justify-between gap-2 px-0.5">
        <div className={`h-3 w-28 ${skeletonBar}`} />
        <div className={`h-6 w-6 shrink-0 rounded-lg ${skeletonBar}`} />
      </div>
      <div className="flex max-h-[min(70vh,720px)] min-h-0 flex-col gap-4">
        {cardRows.map((w, i) => (
          <div
            key={i}
            className={`flex flex-col gap-3 rounded-[12px] p-5 shadow-[0_1px_2px_rgba(26,28,28,0.04)] dark:border dark:border-slate-700/40 ${skeletonBar}`}
          >
            <div
              className="h-2.5 rounded-[12px] bg-slate-200/90 dark:bg-slate-700/80"
              style={{ width: `${w}%` }}
            />
            <div className="h-2.5 w-4/5 rounded-[12px] bg-slate-200/90 dark:bg-slate-700/80" />
            <div className="flex gap-2 pt-1">
              <div className="h-5 w-14 rounded-full bg-slate-200/80 dark:bg-slate-700/70" />
              <div className="h-5 w-20 rounded-full bg-slate-200/80 dark:bg-slate-700/70" />
            </div>
          </div>
        ))}
        <div className="mt-1 h-16 w-full rounded-[12px] border-2 border-dashed border-slate-200/80 bg-slate-50/80 animate-pulse dark:border-slate-600/50 dark:bg-slate-900/40" />
      </div>
    </div>
  );
}

function SkeletonInbox() {
  return (
    <aside
      className="w-full shrink-0 lg:w-[min(100%,300px)]"
      aria-hidden
    >
      <div className="rounded-2xl border border-ds-outline-variant/10 bg-ds-surface-container-lowest/80 p-4 shadow-[0_1px_3px_rgba(26,28,28,0.06)] backdrop-blur-md transition-colors duration-300 lg:p-5 dark:border-slate-700/40 dark:bg-ds-surface-container-lowest/60">
        <div className="mb-3 border-b border-ds-outline-variant/20 pb-2">
          <div className={`h-2.5 w-16 ${skeletonBar}`} />
        </div>
        <div className="flex min-h-[min(70vh,320px)] max-h-[min(70vh,720px)] flex-col gap-2 overflow-hidden pb-2">
          {[92, 78, 88].map((w, i) => (
            <div
              key={i}
              className={`rounded-[12px] p-3 ${skeletonBar}`}
            >
              <div
                className="h-2 rounded-[12px] bg-slate-200/90 dark:bg-slate-700/80"
                style={{ width: `${w}%` }}
              />
              <div className="mt-2 h-2 w-3/5 rounded-[12px] bg-slate-200/90 dark:bg-slate-700/80" />
            </div>
          ))}
          <div className={`mt-2 h-12 w-full rounded-[12px] ${skeletonBar}`} />
        </div>
      </div>
    </aside>
  );
}

/**
 * Stitch-aligned loading placeholder for the board workspace (inbox + Kanban columns).
 */
export function KanbanSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={[
        "flex flex-col gap-6 lg:flex-row lg:items-start",
        className ?? "",
      ].join(" ")}
      role="status"
      aria-label="Loading board"
    >
      <SkeletonInbox />
      <div className="min-w-0 flex-1">
        <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-ds-on-surface-variant/60 dark:text-slate-500">
          <span className={`inline-block h-2.5 w-72 max-w-full ${skeletonBar}`} />
        </p>
        <div className="-mx-1 flex items-start gap-8 overflow-x-auto pb-2 pt-1">
          <SkeletonColumn index={0} cardRows={[70, 85, 65]} />
          <SkeletonColumn index={1} cardRows={[80, 72]} />
          <SkeletonColumn index={2} cardRows={[90, 68, 75]} />
          <div
            className="flex w-[min(100%,280px)] shrink-0 flex-col items-center justify-center gap-2 rounded-[12px] border-2 border-dashed border-slate-200/90 py-10 animate-pulse dark:border-slate-600/55"
            aria-hidden
          >
            <div className={`h-10 w-10 rounded-full ${skeletonBar}`} />
            <div className={`h-2 w-20 ${skeletonBar}`} />
          </div>
        </div>
      </div>
    </div>
  );
}
