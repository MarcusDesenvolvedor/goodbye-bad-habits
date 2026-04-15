# Feature: Board

**Goodbye Bad Habits — Web task board & agenda**

**Status:** Active  
**Type:** Feature specification

---

## Purpose

Let authenticated users **create, list, open, rename, and delete** boards they own. Boards are the root aggregate for lists and cards per [business-logic.md](../../business-logic.md) §4 and [data-model.md](../../data-model.md) §4. All board APIs scope data by the app `User` resolved from Clerk.

---

## Visual reference (UI)

The **board view** (`/board/[boardId]`) and related chrome follow the **Google Stitch** screen **«Kanban Board - Bauhaus Style»**:

| Field | Value |
|--------|--------|
| Project ID | `12323884550944750041` |
| Screen ID | `17188e23de0b4a50af64efc4150443c4` |

Reference assets (HTML + screenshot) may be downloaded locally via `scripts/fetch-stitch-board-assets.mjs` using `STITCH_API_KEY` (see `docs/design/stitch-kanban-bauhaus/README.md`). The production app implements the layout in **React + Tailwind**, not the exported HTML iframe.

The **board workspace** (`/board/[boardId]`) includes a left **Inbox** and **Kanban** columns under one **shared** drag-and-drop context (`BoardWorkspace`): tasks can move between Inbox and columns (To do / In progress / Done) and reorder within each area (mock data until List/Card are persisted via the API).

**All boards** (`/my-boards`) lists every board the user owns, supports **create**, and links to **`/board/[boardId]`**. The **global sidebar** (Stitch “Telas KANBAN” / Atelier shell) wraps **`/my-boards`**, **`/dashboard`**, and **`/board/*`** via `app/(workspace)/layout.tsx`. **`/dashboard`** is the workspace **Tasks** overview (stats, priorities, activity — no embedded board list). Each **board** is treated as an independent **project**.

---

## Business rules (reference)

- Each board has exactly one owner (`userId` → `User`).
- Only the owner may read, update, or delete a board.
- Requests for another user’s `boardId` return **404** (no ID enumeration).
- Deleting a board **cascades** to lists and cards per Prisma schema (`onDelete: Cascade`).

Normative text: [business-logic.md](../../business-logic.md), [requirements.md](../../requirements.md) §5.

---

## Entities

| Entity | Notes |
|--------|--------|
| `Board` | `id`, `userId`, `title`, `createdAt`, `updatedAt` — [data-model.md](../../data-model.md) §4 |

---

## Main flows

### List boards

1. Authenticated user opens **All boards** (`/my-boards`) or calls `GET /api/boards`.
2. Server resolves Clerk session → app `User`, returns boards where `userId` matches.

### Create board

1. User submits a non-empty **title** (trimmed).
2. `POST /api/boards` creates a row with `userId` = current user.

### Open board

1. User navigates to `/board/[boardId]`.
2. `GET /api/boards/[boardId]` returns the board if owned; otherwise 404.

### Rename board

1. User edits title; client sends `PATCH /api/boards/[boardId]` with `{ title }`.
2. Server verifies ownership and updates.

### Delete board

1. User confirms delete; `DELETE /api/boards/[boardId]`.
2. Server verifies ownership; cascade removes lists and cards.

---

## API endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/boards` | Required | List current user’s boards |
| `POST` | `/api/boards` | Required | Create board (`title`) |
| `GET` | `/api/boards/[boardId]` | Required | Get one board if owned |
| `PATCH` | `/api/boards/[boardId]` | Required | Rename (`title`) |
| `DELETE` | `/api/boards/[boardId]` | Required | Delete board (cascade) |

---

## UI behavior

- **All boards** (`/my-boards`): Stitch-aligned list + create; anchor `#create-board` for “New board” from the sidebar.
- **Tasks overview** (`/dashboard`): Stitch “Project overview” style metrics and priorities (search bar hidden on this route).
- **Board** (`/board/[boardId]`): per-project shell; board chrome links back to **Tasks** (`/dashboard`) and **All boards** (`/my-boards`). **Kanban** mock preview until List/Card backend ships.
- Routes **`/my-boards`**, **`/dashboard`**, and **`/board`** are **protected** by Clerk middleware.

---

## Dependencies

- Clerk (`@clerk/nextjs`)
- PostgreSQL + Prisma (`Board` in [db-schema.sql](../../db-schema.sql) / `schema.prisma`)
- Authentication feature (synced `User`)

---

## Implementation notes

- **API → Service → Repository**; Prisma only in repositories.
- Zod validates `POST` / `PATCH` bodies.
- Do not expose other users’ boards (404).
