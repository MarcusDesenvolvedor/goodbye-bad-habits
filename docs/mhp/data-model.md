# 🗂️ Data Model

**Goodbye Bad Habits — Web task board & agenda**

This document defines the **domain data model**: entities, attributes, relationships, aggregates, and invariants. It is **technology-agnostic** but maps to **PostgreSQL + Prisma**.

**Reference:** **Trello-like** concepts (board, list, card). Naming in code may differ slightly but meanings align.

---

## 🎯 1. Purpose

The data model aims to:

- Represent users, boards, lists, cards, and notifications
- Support **ordering** for drag-and-drop (lists on a board; cards in a list)
- Support **agenda** fields (`dueAt`, `remindAt`) and **notifications**
- Guide `schema.prisma` and API design

---

## 🧩 2. Core Aggregates

- **User** — identity linked to **Clerk**
- **Board** — owned by a user; container for lists
- **List** — column on a board; ordered among siblings
- **Card** — item on a list; ordered among siblings
- **Notification** — user-scoped alerts (e.g. reminders)

---

## 👤 3. User Aggregate

### Root: User

Represents an application user linked to Clerk.

**Attributes:**

- `id` (UUID, internal primary key)
- `clerkId` (unique, from Clerk)
- `email`
- `createdAt`

**Relationships:**

- User **has many** Boards
- User **has many** Notifications

**Rules:**

- `clerkId` must be unique and stable for the Clerk user
- Authentication is delegated to Clerk; this table stores app-specific data and relations

---

## 📌 4. Board Aggregate

### Root: Board

A board is a Trello-like **workspace** (one horizontal canvas of lists).

**Attributes:**

- `id` (UUID)
- `userId` (owner)
- `title`
- `createdAt`, `updatedAt`
- Optional: `archivedAt`, `description`, theme fields

**Relationships:**

- Board **belongs to** User
- Board **has many** Lists

**Rules:**

- Every board has exactly one owner (`userId`)
- Deleting a board cascades or archives lists and cards per business rules

---

## 📋 5. List Aggregate

### Root: List

A **list** is a column on a board.

**Attributes:**

- `id` (UUID)
- `boardId`
- `title`
- `position` (integer or comparable ordering key for drag-and-drop sort order)
- `createdAt`, `updatedAt`

**Relationships:**

- List **belongs to** Board
- List **has many** Cards

**Rules:**

- Lists cannot exist without a board
- `position` must allow stable reordering of lists on the same board

---

## 🗂️ 6. Card Aggregate

### Root: Card

A **card** is a task or note on a list.

**Attributes:**

- `id` (UUID)
- `listId`
- `title`
- `description` (optional)
- `position` (order within the list)
- `dueAt` (optional)
- `remindAt` (optional)
- `createdAt`, `updatedAt`
- Optional: `archivedAt`, labels (if modeled)

**Relationships:**

- Card **belongs to** List

**Rules:**

- A card belongs to exactly one list at a time
- Moving to another list updates `listId` and `position` in the target list
- `position` must support reordering and cross-list moves

---

## 🔔 7. Notification

Represents a notification for a user.

**Attributes:**

- `id` (UUID)
- `userId`
- `type` (e.g. REMINDER, SYSTEM)
- `body` or structured payload
- `cardId` (optional, link to source card)
- `readAt` (optional)
- `createdAt`

**Relationships:**

- Notification **belongs to** User

**Rules:**

- Scoped to the recipient only
- Creation and read rules in `business-logic.md`

---

## 🧭 8. Key Relationships Overview

- User → Board → List → Card (hierarchy)
- User → Notification

---

## 🧾 9. Invariants (CRITICAL)

These must always hold:

- No Board without User
- No List without Board
- No Card without List
- No cross-user access: a user’s boards/lists/cards are only accessible through ownership checks
- Ordering fields remain consistent after reorder operations (transactions or batch updates as implemented)

---

## 🚫 10. Forbidden Structures

- Card referencing a list on another user’s board
- Orphan lists or cards
- Notifications without a valid `userId`

---

## ✅ 11. Final Note

> This model must stay consistent with **Business Logic**.

---

**Status:** Active  
**Type:** Domain Data Model  
**Version:** 0.0
