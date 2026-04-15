import Link from "next/link";

export function BauhausBoardShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col transition-colors duration-300">
      <header className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-4 border-b border-transparent bg-[color-mix(in_srgb,var(--ds-surface-container-lowest)_78%,transparent)] px-6 py-3 shadow-[0_1px_0_rgba(103,80,164,0.06)] backdrop-blur-xl transition-colors duration-300 dark:border-slate-700/30 dark:shadow-[0_1px_0_rgba(0,0,0,0.35)]">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-ds-primary">
            Board
          </p>
          <h1 className="mt-0.5 text-xl font-black tracking-tighter text-ds-on-surface">{title}</h1>
          {subtitle ? (
            <p className="mt-1 text-xs font-medium uppercase tracking-widest text-ds-on-surface-variant">
              {subtitle}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-widest text-ds-on-surface-variant transition-colors duration-300 hover:bg-purple-100 hover:text-ds-primary active:scale-95 dark:hover:bg-slate-800/90 dark:hover:text-ds-primary"
          >
            Tasks
          </Link>
          {actions}
        </div>
      </header>
      <div className="flex-1 bg-ds-surface-container-low p-6 transition-colors duration-300 md:p-8">
        {children}
      </div>
    </div>
  );
}
