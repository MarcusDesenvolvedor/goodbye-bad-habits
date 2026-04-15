# Architecture

**Goodbye Bad Habits** is a **web-only** task board and agenda application. Interaction patterns follow a **Trello-like** mental model (**boards** → **lists** / columns → **cards**), including **drag-and-drop** to reorder and move cards. The experience is personal and simple, with **due dates**, **reminders**, and **notifications**.

**Stack:** **React** implements the **UI**; **Next.js** provides **routing**, **server rendering**, and the **HTTP API** (Route Handlers). **Clerk** handles **authentication**.

---

## 🛠️ Tech Stack

### Frontend

* **UI**: **React** (within **Next.js** App Router)
* **Framework**: Next.js (App Router)
* **Language**: TypeScript
* **UI Library**: shadcn/ui
* **Styling**: Tailwind CSS
* **Form management**: React Hook Form
* **Validation**: Zod (shared with API)
* **Drag-and-drop**: `@dnd-kit` (recommended) or equivalent web-first library

---

### Backend

* **Runtime**: Node.js (via Next.js)
* **Database**: PostgreSQL
* **ORM**: Prisma
* **Authentication**: **Clerk**
* **API**: Next.js Route Handlers (`/app/api/**`)

---

### Infrastructure (optional / future)

* **Hosting**: Vercel (or compatible)
* **Database**: PostgreSQL (Neon, Supabase, or local)
* **File storage**: optional (e.g. S3) if attachments are added later
* **Monitoring**: optional (e.g. Sentry)

---

## 📁 Project Structure

The project follows a **feature-oriented and layered structure**.

```bash
/src
  /app
    page.tsx                 # landing (public)
    /(workspace)             # route group — shared authenticated shell (URLs unchanged)
      layout.tsx             # global Stitch sidebar + main offset (pl-64)
      /dashboard
        page.tsx             # workspace “Tasks” overview (stats / priorities)
      /my-boards
        page.tsx             # all boards — list, create, open board
      /board/[boardId]
        page.tsx             # one board = one project; Kanban workspace
    /api
      /boards
        route.ts

  /components
    /ui
    /shared
    /board
    /agenda

  /lib
    prisma.ts
    auth.ts
    utils.ts

  /server
    /services
    /repositories

  /features
    /board
    /card
    /notification
    ...

  /types
  /schemas

/docs
  /mhp
    requirements.md
    data-model.md
    business-logic.md
    db-schema.sql
    /features
      /authentication
        feature.md
      /board
        feature.md
      /card
        feature.md
      /notification
        feature.md
```

---

## Global navigation (release 0.2)

Authenticated flow follows the **Google Stitch “Telas KANBAN”** hierarchy:

1. **Landing** (`/`) → **Sign up / Sign in** (Clerk) → **`/my-boards`** (all projects as boards).
2. User **opens a board** → **`/board/[boardId]`** (that board is the project dashboard; Kanban = task workspace).
3. **`/dashboard`** is the workspace **Tasks** view (overview widgets, priorities, activity) — not the per-board dashboard.

The **sidebar** (`AtelierAppShell`) is mounted once in `app/(workspace)/layout.tsx` so **`/my-boards`**, **`/dashboard`**, and **`/board/*`** share the same fixed `<aside>`; main content uses **left padding** to clear the sidebar. Active nav items use **Stitch / Material tokens** (`bg-ds-primary-fixed`, `text-ds-on-primary-fixed-variant`); inactive rows use a clear **`hover:bg-purple-100`** affordance aligned with the design export.

---

### Structure Rules

* UI components must NOT contain business logic
* Services must NOT access Prisma directly
* Repositories are the ONLY layer allowed to use Prisma
* API routes must be thin (validation + service calls)
* Each feature must be isolated

---

## 🧠 Feature Documentation Strategy

Each feature MUST have its own documentation file.

### Structure

```bash
/docs/mhp/features/{feature-name}/feature.md
```

### Rules

* Must be created BEFORE or DURING development
* Must include:

  * Purpose
  * Flows
  * Business rules
  * Dependencies
* Must always be updated when behavior changes

### Purpose

* Provide context to AI and humans
* Avoid logic loss
* Serve as feature-level source of truth

---

## 🎯 System Design Principles

* The system starts simple and evolves
* **Isolation by user**: boards, lists, and cards belong to an authenticated user; no cross-user access
* **Server is authoritative** for order and ownership; the client may use optimistic UI for drag-and-drop
* Simplicity over complexity
* AI-friendly architecture:

  * predictable structure
  * low unnecessary abstraction
  * strong documentation

---

## 🗄️ Database

### Schema Structure

* Source of truth: `schema.prisma` (project root)
* Reference: `docs/mhp/db-schema.sql` (mirror / draft), `data-model.md`, `business-logic.md`

---

## 🔄 Data Flow Architecture

### Client-Server Communication

* API via Next.js Route Handlers
* JSON request/response; mutations for creates, updates, reorders, and moves

---

### Database Access Pattern

* Prisma used ONLY in repositories
* Services handle business logic and ownership checks

---

## 🔐 Security Architecture

### Authentication & Authorization

* **Clerk** handles sign-in, sessions, and user identity
* Private routes require an authenticated session
* Every mutation on boards, lists, or cards must verify **ownership** (user owns the board) on the server

---

### Data Security

* Validation: Zod on all API inputs
* SQL injection: mitigated by Prisma
* Secrets via environment variables only

---

## 🏪 Data Isolation

* **User** is the top-level owner of **boards**
* Lists belong to a board; cards belong to a list
* Queries must always scope by authenticated `userId` (via board ownership chain)

The system must guarantee:

* No access to another user’s boards, lists, or cards
* No trusting client-sent `userId` without session validation

---

## ⚡ Performance Considerations

### Frontend

* Use Next.js optimizations (layouts, loading UI)
* Keep board/list/card components small; memoize drag sources where needed

---

### Backend

* Index `userId`, `boardId`, `listId`, and fields used in agenda queries (e.g. `dueAt`, `remindAt`)
* Prefer transactional updates when reordering multiple rows

---

## 🔧 Development Workflow

### Code Quality

* ESLint + Prettier
* TypeScript strict mode

---

## 🚫 Architectural Constraints

The system must NEVER:

* Access the DB outside repositories
* Put business logic only in the UI
* Mix data between users
* Skip validation on API inputs
* Trust unvalidated frontend data for authorization

---

## ✅ Final Principle

> This architecture must guide all implementation decisions.
> If code contradicts this document, the code is wrong.

---

**Status:** Active  
**Type:** Architecture Definition  
**Version:** 0.2
