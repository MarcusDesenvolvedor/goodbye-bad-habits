import type { User } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export async function upsertUserByClerkId(input: {
  clerkId: string;
  email: string;
}): Promise<User> {
  return prisma.user.upsert({
    where: { clerkId: input.clerkId },
    create: {
      clerkId: input.clerkId,
      email: input.email,
    },
    update: {
      email: input.email,
    },
  });
}
