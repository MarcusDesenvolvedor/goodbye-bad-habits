# 🔄 Workflow — Frontend Development

**Goodbye Bad Habits — Web task board & agenda**

This document defines the **workflow and rules** for developing frontend code with **React**, **Next.js**, and **TypeScript**.

**Stack:** **React** = UI components and local state. **Next.js** = App Router, layouts, server components where used, and API routes consumed from the client. **Clerk** = authentication UI and session hooks.

It must be followed whenever creating or modifying pages, components, or client-side logic.

---

## 🎯 1. Purpose

Ensure that the frontend:

* Reflects Business Logic and Features
* Respects Architecture boundaries
* Follows Coding Rules
* Is consistent and maintainable
* Integrates correctly with the API
* Implements **drag-and-drop** in a structured, accessible way

---

## 🧱 2. Technology Context

This workflow assumes:

* **React** (components and UI state)
* Next.js (App Router)
* TypeScript
* Tailwind CSS
* shadcn/ui
* React Hook Form
* Zod
* Fetch API (or a thin wrapper)
* **Drag-and-drop:** e.g. `@dnd-kit`

---

## 📌 3. Before Writing UI Code

Before implementing any UI, you MUST have:

* The **feature.md**
* Access to:

  * `business-logic.md`
  * `data-model.md`
  * `architecture.md`
  * `coding-rules.md`
  * `workflow-api-endpoint.md`

❗ Never build UI without feature context.

---

## 📁 4. Frontend Structure

Follow `architecture.md`.

---

### Rules:

* UI must be separated into:

  * Pages (routing)
  * Components (UI)
* Feature-specific components live under e.g. `/components/board`, `/components/agenda`
* Shared primitives under `/components/ui` and `/components/shared`
* No business logic in presentational components
* **Drag-and-drop:** board shell, list column, and draggable card should be composable; keep DnD providers at a sensible boundary (e.g. board page or board layout component)

---

## 🛠️ 5. Frontend Creation Steps

---

### Step 1 — Identify UI Flows

Define:

* Pages
* User actions (including drag start/drop)
* Navigation flow

Map actions to API endpoints.

---

### Step 2 — Define Types & Schemas

* Create TypeScript types:

  * API responses
  * View models
* Use Zod for:

  * Form validation
  * Optional response validation

---

### Step 3 — Implement API Calls

* Use `fetch` or a small helper
* Keep calls in dedicated modules (e.g. `lib/api/boards.ts`)

Example:

```ts
export async function getBoard(boardId: string) {
  const res = await fetch(`/api/boards/${boardId}`)
  if (!res.ok) throw new Error('Failed to load board')
  return res.json()
}
```

---

### Step 4 — Implement Pages

Pages must:

* Call API functions (or server loaders where applicable)
* Handle navigation
* Pass data to components

---

### Must NOT:

* Contain business logic
* Encode authorization rules without server enforcement

---

### Step 5 — Implement Components

Components must:

* Be presentational where possible
* Receive data via props
* Be reusable

---

### Must NOT:

* Call APIs directly from leaf components if the project standard is container/hook-based fetching (follow repo convention)
* Contain business logic

---

### Step 6 — Forms

Use:

* React Hook Form
* Zod validation

Rules:

* Validate before submit
* Show field errors
* Prevent invalid submission

---

### Step 7 — State Management

* Use local state (`useState`) for UI and drag state
* Do NOT duplicate server data unnecessarily
* After drag-and-drop, persist via API; on failure, rollback or refetch

---

### Step 8 — Loading & Error Handling

Always handle:

* Loading state
* Error state

---

### UI Feedback:

* Loading → spinner/skeleton
* Error → clear message
* Success → feedback (toast/message)

---

## 🔐 6. Authentication Rules

* Use Clerk components and hooks (`SignIn`, `SignUp`, `useUser`, etc.)
* Protect authenticated routes (dashboard, boards)
* Redirect unauthenticated users to sign-in

---

## 🏪 7. Scoped Routes in the Frontend

* Board views use a stable id (e.g. `/board/[boardId]`)
* Never assume URL ids are safe: server validates ownership on every request

---

## 🧾 8. Data Integrity Rules

* Never trust frontend state for security
* Always rely on API for persisted truth
* Never implement ownership or business rules only in the UI

---

## ❌ 9. Forbidden Practices

* Embedding authorization solely in the client
* Business logic in UI
* Using `any`
* Hardcoding domain rules that belong in services
* Duplicating API logic everywhere
* Ignoring validation

---

## 🧪 10. Validation Checklist

Before finishing:

* [ ] UI matches `feature.md`
* [ ] API calls implemented
* [ ] Forms validated
* [ ] Errors handled
* [ ] Loading states handled
* [ ] Drag-and-drop persists or fails gracefully
* [ ] No business-only rules in UI
* [ ] Lint passes

---

## 🏁 11. Final Principle

> The frontend displays data and triggers actions.
> It must never be the only layer that enforces business rules.

---

**Status:** Active  
**Type:** Frontend Workflow  
**Version:** 0.0
