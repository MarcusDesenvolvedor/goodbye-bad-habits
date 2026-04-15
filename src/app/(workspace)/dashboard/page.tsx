import { currentUser } from "@clerk/nextjs/server";
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

  const displayName =
    clerkUser.firstName ?? user.email?.split("@")[0] ?? "there";

  return <ProjectDashboardView displayName={displayName} />;
}
