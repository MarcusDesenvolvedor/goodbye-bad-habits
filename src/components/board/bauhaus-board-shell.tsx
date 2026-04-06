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
      <header className="flex flex-wrap items-center justify-between gap-4 border-b-4 border-black bg-black px-6 py-4 text-white">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-[0.2em]">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-1 text-xs uppercase tracking-[0.25em] text-zinc-400">
              {subtitle}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex flex-wrap items-center gap-3">{actions}</div>
        ) : null}
      </header>
      <div className="flex-1 p-6">{children}</div>
    </div>
  );
}
