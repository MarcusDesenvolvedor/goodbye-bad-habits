import type { User } from "@prisma/client";

import * as userRepository from "./user.repository";

function resolveEmailFromClerkUser(clerkUser: {
  primaryEmailAddress?: { emailAddress: string } | null;
  emailAddresses?: { emailAddress: string }[];
}): string | null {
  const primary = clerkUser.primaryEmailAddress?.emailAddress;
  if (primary) {
    return primary;
  }
  const first = clerkUser.emailAddresses?.[0]?.emailAddress;
  return first ?? null;
}

export async function syncUserFromClerk(clerkUser: {
  id: string;
  primaryEmailAddress?: { emailAddress: string } | null;
  emailAddresses?: { emailAddress: string }[];
}): Promise<User> {
  const email = resolveEmailFromClerkUser(clerkUser);
  if (!email) {
    throw new Error("Clerk user has no email");
  }

  return userRepository.upsertUserByClerkId({
    clerkId: clerkUser.id,
    email,
  });
}
