"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton, UserButton } from "@clerk/nextjs";

import { AtelierThemeToggle } from "@/components/ui/atelier-theme-toggle";

function Icon({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <svg
      className={`h-[22px] w-[22px] shrink-0 ${className ?? ""}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

function SidebarLink({
  href,
  active,
  icon,
  children,
}: {
  href: string;
  active: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? "flex items-center gap-3 rounded-xl bg-ds-primary-fixed px-4 py-2.5 text-sm font-semibold tracking-tight text-ds-on-primary-fixed-variant transition-colors duration-300 hover:bg-ds-primary-fixed/85"
          : "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold tracking-tight text-ds-on-surface-variant transition-colors duration-300 hover:bg-purple-100 hover:text-ds-primary active:scale-[0.99] dark:hover:bg-slate-800/90 dark:hover:text-ds-primary"
      }
    >
      {icon}
      {children}
    </Link>
  );
}

export function AtelierAppShell({
  children,
  workspaceLabel = "Creative Studio",
}: {
  children: React.ReactNode;
  workspaceLabel?: string;
}) {
  const pathname = usePathname();
  const boardsActive = pathname === "/my-boards";
  const tasksActive = pathname === "/dashboard";

  return (
    <div className="min-h-screen bg-ds-surface text-ds-on-surface transition-colors duration-300">
      <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col gap-2 border-r border-transparent bg-[#f4f7fe] p-3 pt-4 transition-colors duration-300 dark:border-slate-700/40 dark:bg-ds-surface-container-low">
        <div className="mb-2 px-3">
          <Link href="/my-boards" className="text-lg font-bold tracking-tighter text-ds-primary">
            Atelier Kanban
          </Link>
          <p className="mt-0.5 text-xs font-medium text-ds-on-surface-variant/80">Enterprise Plan</p>
        </div>
        <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-ds-on-surface-variant/70">
          {workspaceLabel}
        </p>
        <nav className="flex flex-1 flex-col gap-1 px-1 pt-2">
          <SidebarLink
            href="/my-boards"
            active={boardsActive}
            icon={
              <Icon>
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </Icon>
            }
          >
            All boards
          </SidebarLink>
          <SidebarLink
            href="/dashboard"
            active={tasksActive}
            icon={
              <Icon>
                <rect x="3" y="3" width="7" height="9" rx="1" />
                <rect x="14" y="3" width="7" height="5" rx="1" />
                <rect x="14" y="12" width="7" height="9" rx="1" />
                <rect x="3" y="16" width="7" height="5" rx="1" />
              </Icon>
            }
          >
            Graphics
          </SidebarLink>
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-semibold tracking-tight text-ds-on-surface-variant opacity-60"
            disabled
          >
            <Icon>
              <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </Icon>
            Teams
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-semibold tracking-tight text-ds-on-surface-variant opacity-60"
            disabled
          >
            <Icon>
              <path d="M21 8v13H3V8M1 3h22v5H1V3zm5 8h4" />
            </Icon>
            Archive
          </button>
        </nav>
        <div className="mt-auto space-y-2 px-1 pb-4 pt-4">
          <Link
            href="/my-boards#create-board"
            className="stitch-btn-primary flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold shadow-md transition-transform hover:scale-[1.02] active:scale-95"
          >
            <Icon className="text-ds-on-primary [&>path]:stroke-[2.5]">
              <path d="M12 5v14M5 12h14" />
            </Icon>
            New Board
          </Link>
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2 text-sm font-semibold text-ds-on-surface-variant opacity-50"
            disabled
          >
            <Icon>
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" />
            </Icon>
            Help
          </button>
          <SignOutButton>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl px-4 py-2 text-left text-sm font-semibold text-ds-on-surface-variant transition-colors duration-300 hover:bg-purple-100 hover:text-ds-primary active:scale-[0.99] dark:hover:bg-slate-800/90 dark:hover:text-ds-primary"
            >
              <Icon>
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
              </Icon>
              Logout
            </button>
          </SignOutButton>
        </div>
      </aside>

      <div className="min-h-screen pl-64 transition-colors duration-300">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-ds-outline-variant/10 bg-[color-mix(in_srgb,var(--ds-surface-container-lowest)_85%,transparent)] px-6 backdrop-blur-xl transition-colors duration-300 dark:border-slate-700/35 dark:bg-[color-mix(in_srgb,var(--ds-surface-container-low)_88%,transparent)]">
          <div className="flex min-w-0 flex-1 items-center gap-6">
            <span className="hidden shrink-0 text-lg font-black tracking-tighter text-ds-primary md:inline">
              Atelier Kanban
            </span>
            <div className="min-w-0 flex-1" aria-hidden />
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <AtelierThemeToggle />
            <button
              type="button"
              className="relative rounded-full p-2 text-ds-on-surface-variant transition hover:bg-ds-surface-container-high hover:text-ds-primary active:scale-95"
              disabled
              aria-label="Notifications"
            >
              <Icon>
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
              </Icon>
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-ds-error" aria-hidden />
            </button>
            <button
              type="button"
              className="rounded-full p-2 text-ds-on-surface-variant transition hover:bg-ds-surface-container-high hover:text-ds-primary active:scale-95"
              disabled
              aria-label="Settings"
            >
              <Icon>
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </Icon>
            </button>
            <div className="ml-2">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-9 w-9 ring-2 ring-ds-primary-fixed",
                  },
                }}
              />
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-6 py-8 transition-colors duration-300 md:px-8 md:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
