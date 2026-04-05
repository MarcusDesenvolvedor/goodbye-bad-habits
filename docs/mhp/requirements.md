# 📋 Requirements

**Goodbye Bad Habits — Web task board & agenda**

This document defines **what the system must do** from a business and user perspective.

**Platform:** **Web only** (desktop and mobile browsers). **Reference UX:** patterns common in **Trello** (boards, lists, cards, drag-and-drop). **Stack:** **React** (UI), **Next.js** (app + API), **Clerk** (auth).

---

## 🎯 1. Product Vision

Build a web application that allows users to:

- Organize work and habits using **boards** with **lists** (columns) and **cards** (tasks or notes)
- **Drag and drop** cards within a list and between lists, and reorder lists on a board
- See an **agenda-oriented** view: what is due or scheduled **today** / upcoming
- Receive **notifications** for reminders and important events

The product should feel **personal and easy**, not like a heavy enterprise suite.

---

## 👥 2. Users & Roles

### Authenticated users (via Clerk)

Users can:

- Create and manage their own boards
- Manage lists and cards on those boards
- Set due dates and reminders on cards
- View agenda / “today” style views (as implemented)
- Receive in-app and/or browser notifications per product rules

### Unauthenticated visitors

- Access public marketing or landing content (if exposed)
- Sign up or sign in via Clerk to use the app

---

## 🧩 3. Core Use Cases

### Boards

- Create, open, rename, archive or delete boards
- See a horizontal layout of lists on a board (Trello-like board view)

### Lists

- Create and rename lists on a board
- Reorder lists via drag-and-drop

### Cards

- Create, edit, and archive or delete cards
- Move cards within a list and between lists via drag-and-drop
- Optional fields: title (required), description, labels/colors (if specified in features)

### Agenda

- View cards with dates in an agenda or “today” view
- Filter or sort by due date / reminder time as defined in features

### Notifications

- User is notified according to rules (e.g. reminder time, optional in-app feed)

---

## 🔐 4. Authentication Requirements

- Authentication is handled by **Clerk**
- Users must sign up / sign in and maintain a secure session
- All private board data is available only to authenticated users
- API routes must resolve the current user from Clerk and enforce ownership

---

## 📌 5. Board Requirements

Users must be able to:

- Create a board with a title
- List their boards and open one
- Rename or delete (or archive) a board per business rules

The system must:

- Associate every board with exactly one owning user
- Ensure no user can read or modify another user’s boards

---

## 📋 6. List Requirements

Users must be able to:

- Add lists to a board
- Rename lists
- Reorder lists; order must persist after drag-and-drop

The system must:

- Scope lists to a board
- Persist stable ordering for lists on a board

---

## 🗂️ 7. Card Requirements

Users must be able to:

- Add cards to a list
- Edit card fields (title, description, dates per model)
- Move cards between lists and reorder within a list; changes must persist
- Optionally set **due** and/or **reminder** timestamps for agenda features

The system must:

- Keep each card on exactly one list at a time (unless modeled otherwise later)
- Validate ownership through board → user

---

## 🖱️ 8. Drag-and-Drop Requirements

- **Drag-and-drop** is a primary interaction for:

  - Reordering lists on a board
  - Reordering cards within a list
  - Moving cards from one list to another

- After a drop, the UI reflects the new state and the **server stores** list order and card order / list membership
- Failed API calls must not leave the client in a permanently inconsistent state (rollback or refetch)

---

## 📅 9. Agenda & Reminders Requirements

- Cards may have `dueAt` and/or `remindAt` (see data model)
- The app provides at least one agenda-style experience (e.g. “today” / upcoming)
- Reminder times drive notification behavior per `business-logic.md`

---

## 🔔 10. Notification Requirements

- Users receive notifications for defined events (minimum: firing of a **reminder** for a card)
- Delivery may include in-app list and browser notifications (with user permission)
- Users can mark notifications as read where the feature exists

---

## 📱 11. Non-functional Requirements

The system should:

- Be fast and responsive in the browser
- Scale for typical personal / small-team use (large boards may need pagination later)
- Enforce strict **per-user data isolation**
- Be accessible enough for keyboard and screen-reader users in line with the chosen drag-and-drop library
- Be secure: authenticated API, validated inputs, no data leakage between users

---

## 🔮 12. Future Enhancements

- Collaboration (shared boards, comments, @mentions)
- Recurring cards
- Mobile native apps (out of current web-only scope)
- Calendar sync, integrations

---

## ✅ 13. Final Note

> This document defines **WHAT** the system does.  
> **Business logic** (`business-logic.md`) is the behavioral source of truth for implementation.

---

**Status:** Active  
**Type:** Requirements Specification  
**Version:** 0.0
