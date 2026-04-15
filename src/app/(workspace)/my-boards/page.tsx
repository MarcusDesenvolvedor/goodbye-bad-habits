import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { DashboardBoardsPanel } from "@/components/board/dashboard-boards-panel";
import * as userService from "@/features/authentication/user.service";

export default async function MyBoardsPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    redirect("/sign-in");
  }

  await userService.syncUserFromClerk({
    id: clerkUser.id,
    primaryEmailAddress: clerkUser.primaryEmailAddress
      ? { emailAddress: clerkUser.primaryEmailAddress.emailAddress }
      : null,
    emailAddresses: clerkUser.emailAddresses.map((entry) => ({
      emailAddress: entry.emailAddress,
    })),
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-ds-on-surface md:text-4xl">
          All boards
        </h1>
        <p className="max-w-2xl text-base font-medium text-ds-on-surface-variant">
          Each project is an independent board. Create a board, then open it to manage tasks in the Kanban
          workspace.
        </p>
      </div>
      <DashboardBoardsPanel />
    </div>
  );
}
