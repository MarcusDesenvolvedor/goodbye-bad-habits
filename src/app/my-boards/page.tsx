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
      <header className="mb-10 flex flex-wrap items-center justify-between gap-4 border-4 border-black bg-black p-5 text-white shadow-[10px_10px_0_0_#e11d48]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-400">
            Goodbye Bad Habits
          </p>
          <h1 className="mt-1 text-2xl font-bold uppercase tracking-widest">
            My boards
          </h1>
          <p className="mt-2 text-sm text-zinc-300">{user.email}</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <UserButton />
          <Link
            href="/"
            className="border-2 border-white px-3 py-2 text-xs font-bold uppercase tracking-widest text-white hover:bg-white hover:text-black"
          >
            Home
          </Link>
        </div>
      </header>

      <MyBoardsPanel />

      <p className="mt-8 text-xs uppercase tracking-widest text-zinc-500">
        App user id ·{" "}
        <span className="font-mono text-[0.65rem] text-neutral-700">
          {user.id}
        </span>
      </p>
    </div>
  );
}
