import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ProjectDashboardView } from "@/components/board/project-dashboard-view";
import * as userService from "@/features/authentication/user.service";

export default async function DashboardPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    redirect("/sign-in");
  }

  const user = await userService.syncUserFromClerk({
    id: clerkUser.id,
    primaryEmailAddress: clerkUser.primaryEmailAddress
      ? { emailAddress: clerkUser.primaryEmailAddress.emailAddress }
      : null,
    emailAddresses: clerkUser.emailAddresses.map((entry) => ({
      emailAddress: entry.emailAddress,
    })),
  });

  return (
    <div className="min-h-screen bg-ds-surface">
      <header className="sticky top-0 z-40 border-b border-ds-outline-variant/20 bg-[color-mix(in_srgb,var(--ds-surface-container-lowest)_82%,transparent)] px-6 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-ds-primary">
              Workspace
            </p>
            <h1 className="mt-1 text-xl font-bold tracking-tight text-ds-on-surface">
              Project dashboard
            </h1>
            <p className="mt-1 text-xs text-ds-on-surface-variant">{user.email}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/my-boards"
              className="rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-widest text-ds-on-surface-variant transition hover:bg-ds-surface-container-high hover:text-ds-primary"
            >
              My boards
            </Link>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "ring-2 ring-ds-primary-fixed",
                },
              }}
            />
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <ProjectDashboardView displayName={user.email?.split("@")[0] ?? "there"} />
      </div>
    </div>
  );
}
