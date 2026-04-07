import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

import { MyBoardsPanel } from "@/components/board/my-boards-panel";
import * as userService from "@/features/authentication/user.service";

export default async function MyBoardsPage() {
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
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-10 overflow-hidden rounded-2xl border border-white/10 shadow-[0_0_48px_rgba(59,130,246,0.12)]">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-[var(--stitch-header)] p-5 text-white">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-blue-400/90">
              Workspace
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-50">
              My boards
            </h1>
            <p className="mt-2 text-sm text-zinc-400">{user.email}</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "border-2 border-blue-400/40 ring-2 ring-blue-500/20",
                },
              }}
            />
            <Link
              href="/"
              className="rounded-lg border border-white/20 px-3 py-2 text-xs font-bold uppercase tracking-widest text-zinc-200 transition hover:border-cyan-400/45 hover:text-white"
            >
              Home
            </Link>
          </div>
        </header>
        <div
          className="h-0.5 w-full bg-gradient-to-r from-blue-500 via-cyan-400 to-violet-500 shadow-[0_0_14px_rgba(59,130,246,0.45)]"
          aria-hidden
        />
      </div>

      <MyBoardsPanel />

      <p className="mt-8 text-xs uppercase tracking-widest text-zinc-500">
        App user id ·{" "}
        <span className="font-mono text-[0.65rem] text-zinc-400">
          {user.id}
        </span>
      </p>
    </div>
  );
}
