"use client";

import Link from "next/link";

const MOCK_STATS = [
  {
    label: "Tasks completed",
    value: "84%",
    hint: "+12%",
    icon: "check",
    accent: "text-ds-primary",
  },
  {
    label: "Pending reviews",
    value: "12",
    hint: null,
    icon: "clock",
    accent: "text-amber-700",
  },
  {
    label: "Active contributors",
    value: "96",
    hint: null,
    icon: "people",
    accent: "text-ds-primary-container",
  },
] as const;

const MOCK_ACTIVITY = [
  {
    who: "Alex Rivera",
    action: "moved UI Design System to Completed",
    when: "2 mins ago",
  },
  {
    who: "Jordan Smith",
    action: "commented on Brand Guidelines",
    when: "45 mins ago",
  },
  {
    who: "Marcus Chen",
    action: "attached 4 files to Q4 Roadmap",
    when: "3 hours ago",
  },
] as const;

const MOCK_PRIORITIES = [
  {
    tag: "Mobile app",
    title: "Finalize checkout flow UX",
    body: "Review micro-interactions for the payment confirmation state with engineering.",
    meta: "Oct 24",
    urgent: false,
  },
  {
    tag: "Marketing",
    title: "Content calendar audit",
    body: "Audit scheduled social posts for the upcoming product launch.",
    meta: "Urgent",
    urgent: true,
  },
] as const;

function StatIcon({ name, className }: { name: string; className?: string }) {
  const cn = `h-7 w-7 ${className ?? ""}`;
  if (name === "check") {
    return (
      <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M9 12l2 2 4-4M7 4h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (name === "clock") {
    return (
      <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M16 11a4 4 0 10-8 0v1H6a2 2 0 00-2 2v3h16v-3a2 2 0 00-2-2h-2v-1z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 11V9a3 3 0 016 0v2" strokeLinecap="round" />
    </svg>
  );
}

export function ProjectDashboardView({ displayName }: { displayName: string }) {
  return (
    <>
      <div className="mb-10">
        <h2 className="mb-2 text-3xl font-extrabold tracking-tight text-ds-on-surface">
          Project overview
        </h2>
        <p className="font-medium text-ds-on-surface-variant">
          Welcome back, {displayName}. Here is a snapshot of your workspace (mock data).
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:col-span-8">
          {MOCK_STATS.map((s) => (
            <div
              key={s.label}
              className="flex h-40 flex-col justify-between rounded-xl bg-ds-surface-container-lowest p-6 shadow-[0_1px_3px_rgba(26,28,28,0.06)] transition-transform hover:scale-[1.02]"
            >
              <div className="flex items-start justify-between">
                <StatIcon name={s.icon} className={s.accent} />
                {s.hint ? (
                  <span className="rounded-full bg-ds-primary-fixed px-2 py-1 text-[10px] font-bold text-ds-on-primary-fixed-variant">
                    {s.hint}
                  </span>
                ) : null}
              </div>
              <div>
                <p className="text-4xl font-black tracking-tighter text-ds-on-surface">{s.value}</p>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-ds-on-surface-variant">
                  {s.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4 lg:col-span-4">
          <h3 className="px-1 text-xl font-bold tracking-tight text-ds-on-surface">Recent activity</h3>
          <div className="rounded-xl bg-ds-surface-container-low p-2">
            <div className="space-y-1">
              {MOCK_ACTIVITY.map((row) => (
                <div
                  key={row.when}
                  className="flex items-start gap-4 rounded-lg bg-ds-surface-container-lowest p-4 transition-colors hover:bg-ds-surface"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ds-primary-fixed text-xs font-bold text-ds-on-primary-fixed-variant">
                    {row.who.slice(0, 1)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold leading-tight text-ds-on-surface">
                      {row.who}{" "}
                      <span className="font-normal text-ds-on-surface-variant">{row.action}</span>
                    </p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-ds-on-surface-variant/60">
                      {row.when}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-8">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xl font-bold tracking-tight text-ds-on-surface">Current priorities</h3>
            <Link href="/my-boards" className="text-sm font-bold text-ds-primary hover:underline">
              View all boards
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {MOCK_PRIORITIES.map((card) => (
              <div
                key={card.title}
                className="group rounded-xl bg-ds-surface-container-lowest p-6 shadow-[0_1px_3px_rgba(26,28,28,0.06)] transition-transform hover:scale-[1.02]"
              >
                <div className="mb-4 flex items-start justify-between">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      card.urgent
                        ? "rounded-md bg-amber-100 px-2 py-1 text-amber-900"
                        : "rounded-md bg-ds-secondary-container px-2 py-1 text-ds-on-secondary-container"
                    }`}
                  >
                    {card.tag}
                  </span>
                  <svg
                    className="h-5 w-5 text-ds-outline-variant transition-colors group-hover:text-ds-primary"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden
                  >
                    <path d="M6 10a2 2 0 112 2 2 2 0 01-2-2zm6 0a2 2 0 112 2 2 2 0 01-2-2zm6 0a2 2 0 112 2 2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h4 className="mb-2 text-base font-bold tracking-tight text-ds-on-surface">{card.title}</h4>
                <p className="mb-6 text-sm leading-relaxed text-ds-on-surface-variant">{card.body}</p>
                <div className="flex items-center justify-between border-t border-transparent pt-4">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-ds-on-surface-variant">
                    {card.urgent ? (
                      <svg className={`h-4 w-4 ${card.urgent ? "text-ds-error" : ""}`} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                        <path d="M4 4h16v2H4V4zm2 4h12l-1 12H7L6 8zm4 2v8h2v-8h-2z" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                        <rect x="4" y="5" width="16" height="15" rx="2" />
                        <path d="M8 3v4M16 3v4M4 11h16" />
                      </svg>
                    )}
                    <span className={card.urgent ? "text-ds-error" : ""}>{card.meta}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
