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
    <div className="flex min-h-screen flex-col">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-[var(--stitch-header)] px-6 py-4 text-white shadow-[0_0_32px_rgba(59,130,246,0.08)]">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-blue-400/90">
            Kanban
          </p>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-zinc-50">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-1 text-xs uppercase tracking-widest text-zinc-500">
              {subtitle}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex flex-wrap items-center gap-3">{actions}</div>
        ) : null}
      </header>
      <div
        className="h-0.5 w-full bg-gradient-to-r from-blue-500 via-cyan-400 to-violet-500 shadow-[0_0_16px_rgba(59,130,246,0.4)]"
        aria-hidden
      />
      <div className="flex-1 bg-[var(--stitch-bg)] p-6">{children}</div>
    </div>
  );
}
