// Official domain mirror for Prisma — keep in sync with `schema.prisma` at the project root.
// PostgreSQL + Prisma. Goodbye Bad Habits: boards, lists, cards, notifications.

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

//////////////////////
// USER (linked to Clerk)
//////////////////////

model User {
  id        String   @id @default(uuid())
  clerkId   String   @unique
  email     String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  boards        Board[]
  notifications Notification[]
}

//////////////////////
// BOARD
//////////////////////

model Board {
  id        String   @id @default(uuid())
  userId    String
  title     String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user  User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  lists List[]
}

//////////////////////
// LIST (column)
//////////////////////

model List {
  id        String   @id @default(uuid())
  boardId   String
  title     String
  position  Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  board Board  @relation(fields: [boardId], references: [id], onDelete: Cascade)
  cards Card[]
}

//////////////////////
// CARD
//////////////////////

model Card {
  id          String    @id @default(uuid())
  listId      String
  title       String
  description String?
  position    Int
  dueAt       DateTime?
  remindAt    DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  list List @relation(fields: [listId], references: [id], onDelete: Cascade)
}

//////////////////////
// NOTIFICATION
//////////////////////

model Notification {
  id        String    @id @default(uuid())
  userId    String
  type      String
  body      String
  cardId    String?
  readAt    DateTime?
  createdAt DateTime  @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
