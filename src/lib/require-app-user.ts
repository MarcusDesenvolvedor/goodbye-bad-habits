import { auth, currentUser } from "@clerk/nextjs/server";
import type { User } from "@prisma/client";

import * as userService from "@/features/authentication/user.service";

export async function requireAppUser(): Promise<User | null> {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }

  const clerkUser = await currentUser();
  if (!clerkUser) {
    return null;
  }

  return userService.syncUserFromClerk({
    id: clerkUser.id,
    primaryEmailAddress: clerkUser.primaryEmailAddress
      ? { emailAddress: clerkUser.primaryEmailAddress.emailAddress }
      : null,
    emailAddresses: clerkUser.emailAddresses.map((entry) => ({
      emailAddress: entry.emailAddress,
    })),
  });
}
