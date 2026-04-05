# 🧩 Coding Rules

**Goodbye Bad Habits — Web task board & agenda**

**Stack:** **React** (UI), **Next.js** (app + API), **Clerk** (auth), **PostgreSQL** + **Prisma**. See `architecture.md`.

This document defines **mandatory coding standards, principles, and conventions**. All code must follow these rules; violations should be refactored.

---

## 🎯 1. Purpose

The goals are:

* Ensure consistency across the codebase
* Reduce bugs and technical debt
* Align implementation with Architecture and Business Logic
* Make the system predictable for AI and human contributors

---

## 🧠 2. Core Principles

All code must follow:

* Clean Code
* SOLID
* KISS
* DRY
* YAGNI
* Explicit over implicit

> Code must be predictable and easy to understand.

---

## 🧱 3. General Rules

* Use **TypeScript** everywhere
* Never use `any`
* Prefer immutability
* Functions must:
  * Be small
  * Do one thing
* Avoid side effects
* No unused code
* No commented-out code
* No TODOs without context

---

## 📝 4. Naming Conventions

* Variables/functions: `camelCase`
* Types/interfaces: `PascalCase`
* Constants: `UPPER_SNAKE_CASE`
* Files: `kebab-case.ts`
* React components: `PascalCase.tsx`

Names must be:

* Descriptive
* In English
* Based on domain: Board, List, Card, Notification, etc.

---

## 🗂️ 5. Project Structure Rules

Follow `architecture.md`.

Rules:

* No circular dependencies
* Each layer has one responsibility
* Feature-specific code must stay isolated
* Shared logic goes to shared folders (`lib`, `components/ui`, etc.)

---

## 🧠 6. Feature Documentation Rule (CRITICAL)

Every feature MUST have a documentation file:

```
/docs/mhp/features/{feature-name}/feature.md
```

---

### Requirements:

* Must be created BEFORE or DURING development
* Must include:

  * Purpose
  * Flows
  * Business rules
  * Dependencies

---

### Maintenance:

* Must always be updated when:

  * logic changes
  * flows change

---

### Purpose:

* Prevent context loss
* Keep logic centralized
* Serve as feature-level source of truth

---

## ⚙️ 7. Backend Rules (Next.js)

### 7.1 API Routes

* Must:

  * Receive request
  * Validate input (Zod)
  * Call service
  * Return response

* Must NOT:

  * Contain business logic
  * Access Prisma directly

---

### 7.2 Services

* Contain business logic

* Must:

  * Enforce rules from `business-logic.md`
  * Verify board ownership via `userId` from Clerk + data layer

* Must NOT:

  * Access database directly

---

### 7.3 Repositories

* Responsible for Prisma access

* Must:

  * Only perform DB operations

* Must NOT:

  * Contain business logic

---

## 🎨 8. Frontend Rules (React + Next.js)

### 8.1 Components

* Must be:

  * Small
  * Reusable
  * Focused on UI

* **Drag-and-drop:** keep sensors, drag overlays, and DnD context in dedicated components or hooks (e.g. under `components/board`) so pages stay readable

* Must NOT:

  * Contain business logic or authorization decisions alone (server must enforce)

---

### 8.2 State

* Use local state for UI and transient drag state
* Avoid unnecessary global state
* After mutations, align with server truth (especially after reorder/move)

---

### 8.3 Forms

* Use React Hook Form
* Validate before submit
* Show clear errors

---

## 🔐 9. Security Rules

* Never trust frontend data for authorization
* Always validate input with Zod
* Never expose secrets to the client
* Use environment variables for secrets (Clerk, database URL, etc.)

---

## 🧾 10. Error Handling

* Never ignore errors
* Errors must:

  * Be explicit
  * Have clear messages for users where appropriate

---

## 🧹 11. Formatting & Linting

* Use ESLint
* Use Prettier
* Code must pass lint before commit

---

## 🚫 12. Forbidden Practices

The system must NEVER:

* Use `any`
* Put business logic only in UI
* Access DB outside repositories
* Skip validation
* Duplicate domain rules in multiple places without abstraction
* Break architecture rules

---

## 🤖 13. AI Development Rules (CRITICAL)

When generating code, AI MUST:

* Follow folder structure strictly
* Respect layer separation:

  * API → Service → Repository
* NEVER:

  * create new patterns without reason
  * duplicate logic
  * ignore existing services

---

### Before writing code, AI must:

* Check:

  * `business-logic.md`
  * `data-model.md`
  * `feature.md` (if exists)

---

### When creating new features:

* MUST create:

  * `feature.md`
  * service
  * repository
  * API route (when applicable)

---

## ✅ 14. Final Principle

> If code violates these rules, it must be refactored.

---

**Status:** Active  
**Type:** Coding Standards  
**Version:** 0.0
