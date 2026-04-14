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
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-4 border-b border-ds-outline-variant/20 bg-[color-mix(in_srgb,var(--ds-surface-container-lowest)_82%,transparent)] px-6 py-4 shadow-sm backdrop-blur-xl">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-ds-primary">
            Kanban
          </p>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-ds-on-surface">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-1 text-xs font-medium uppercase tracking-widest text-ds-on-surface-variant">
              {subtitle}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-widest text-ds-on-surface-variant transition hover:bg-ds-surface-container-high hover:text-ds-primary"
          >
            Dashboard
          </Link>
          {actions}
        </div>
      </header>
      <div className="flex-1 bg-ds-surface-container-low p-6">{children}</div>
    </div>
  );
}
