# 🧠 Business Logic

**Goodbye Bad Habits — Web task board & agenda**

This document defines **business rules, constraints, and behaviors**. It is the **single source of truth**. Any implementation that contradicts it is incorrect.

**Reference:** Flows align with **Trello-like** boards (lists as columns, draggable cards). Product-specific rules below take precedence.

---

## 🎯 1. System Purpose

The system enables authenticated users to:

- Own **boards** containing **lists** and **cards**
- **Reorder** lists and cards and **move** cards between lists using **drag-and-drop**, with **persistent** order on the server
- Use **due** and **reminder** times for an agenda experience
- Receive **notifications** (e.g. when a reminder fires)

The application is **web-only**; authorization is always enforced on the server.

---

## 👤 2. Actors

### 2.1 Authenticated user (via Clerk)

- Creates and manages boards, lists, and cards that they own
- Receives notifications intended for them

### 2.2 Visitor (unauthenticated)

- May access public pages only (e.g. landing)
- Cannot read or modify private board data

### 2.3 System

- Creates notifications when rules say so (e.g. scheduled reminder)
- Must not expose one user’s data to another

---

## 🔐 3. Identity & User Rules

- Each **User** record is linked to exactly one **Clerk** identity (`clerkId`)
- On first login, the app may upsert the User row from Clerk profile data
- All board operations are scoped to the authenticated user resolved from the session

---

## 📌 4. Board Rules

- A board **belongs to exactly one user** (owner)
- Users may create, rename, and delete (or archive) their own boards
- Deleting a board **must** delete or archive all dependent lists and cards according to a single consistent policy (cascade or soft-delete — implement one approach and document in migrations)

---

## 📋 5. List Rules

- A list **belongs to exactly one board**
- Only the **owner of the board** may create, rename, reorder, or delete lists
- **Reorder**: updating list `position` values must keep ordering unambiguous within the board

---

## 🗂️ 6. Card Rules

- A card **belongs to exactly one list**
- Only the **owner of the parent board** may create, edit, move, reorder, or delete cards
- **Title** is required unless the UI explicitly allows empty drafts — if allowed, define one normalization rule in the service layer
- **Move between lists**: card `listId` and `position` must both be updated consistently; target list must belong to the **same board** as the source (unless product later allows otherwise)

### Agenda fields

- `dueAt` and `remindAt` are optional
- If `remindAt` is set, the system should enqueue or schedule a **notification** at that time (implementation: cron, queue, or serverless scheduler)

---

## 🖱️ 7. Drag-and-Drop & Ordering Rules

- **Client** may update UI optimistically during drag; **server** must validate ownership and IDs
- **Reorder within list**: only `position` (and possibly minimal sibling updates) change
- **Move between lists**: `listId` changes; `position` is set within the target list; sibling positions in source and/or target lists must be updated so there are no duplicates or gaps per chosen strategy (normalized integers, fractional indexing, or batch renumber — pick one and apply in transactions when needed)
- On API failure, the client should **rollback** optimistic state or **refetch** the board

---

## 🔔 8. Notification Rules

- Notifications are always for a **single recipient** `userId`
- At minimum, a **reminder** on a card generates a notification to the board owner when `remindAt` elapses
- Users may mark notifications as read; `readAt` is set accordingly
- Browser push or email may be added later; rules stay consistent with recipient scoping

---

## 🔐 9. Access Control Rules

- Every API that reads or mutates a board, list, or card must:

  1. Resolve the current user from **Clerk**
  2. Verify the user **owns** the board (directly or via `board.userId`)

- Users must **never** read or modify another user’s boards, lists, cards, or notifications

---

## 🌐 10. Routing Rules (illustrative)

- Board view may live at `/board/[boardId]` (or under a dashboard prefix)
- Board IDs in URLs must still pass ownership checks on every request

---

## 🚫 11. Forbidden Behaviors

- Accessing or modifying another user’s board data
- Persisting card order without validating list and board ownership
- Skipping authentication on private endpoints
- Creating notifications for the wrong user

---

## 🧾 12. Data Consistency Rules

- Every list has a board; every card has a list
- No orphan lists or cards after deletes
- Transactions should be used when multiple rows must update together (e.g. reorder)

---

## 🔄 13. System Evolution Rules

- Future features (sharing, comments) must not weaken existing ownership checks for private data

---

## ✅ 14. Final Principle

> If the code contradicts this document, the code is wrong.

---

**Status:** Active  
**Type:** Business Source of Truth  
**Version:** 0.0
