import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

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
    <main className="mx-auto max-w-lg space-y-4 p-8">
      <p className="text-sm text-zinc-600">Dashboard (placeholder)</p>
      <p className="text-base">Signed in as {user.email}</p>
      <p className="font-mono text-xs text-zinc-500">App user id: {user.id}</p>
      <Link className="text-sm underline" href="/">
        Home
      </Link>
    </main>
  );
}
