# 🔄 Workflow — Feature Development

**Goodbye Bad Habits — Web task board & agenda**

This document defines the **workflow and rules** to create, describe, and implement features.

It must be followed whenever a new feature is created or modified.

---

## 🎯 1. Purpose

Ensure that every feature:

* Is derived from Business Logic
* Uses the Data Model correctly
* Respects Architecture boundaries
* Follows Coding Rules
* Is documented for AI and humans
* Can be developed independently

---

## 🧱 2. What Is a Feature

A **feature** represents a single business capability.

Examples:

* Authentication (Clerk integration, user sync)
* Board (CRUD, list of boards)
* List (CRUD, reorder on board)
* Card (CRUD, move, reorder, dates)
* Agenda / “today” view
* Notifications / reminders

A feature must:

* Solve one business problem
* Own its use cases
* Be isolated from other features where possible

---

## 📁 3. Feature Structure

### Code Location

```bash
/src/features/{feature-name}
```

### Documentation Location

```bash
/docs/mhp/features/{feature-name}/feature.md
```

---

### Example

```bash
/src/features/card
  card.service.ts
  card.repository.ts
  card.schema.ts
  card.types.ts

/docs/mhp/features/card
  feature.md
```

---

### Rules

* Feature name must be `kebab-case`
* One folder per feature
* No cross-feature imports (except shared/lib)
* Every feature MUST have documentation

---

## 📄 4. feature.md (CRITICAL)

Every feature MUST include a `feature.md`.

---

### It must contain:

* Purpose
* Main flows (including drag-and-drop when relevant)
* Business rules
* Entities involved
* API endpoints
* UI behavior (web, responsive)

---

### Rules

* Must be created BEFORE or DURING development
* Must NOT duplicate full business logic
* Must reference:

  * `business-logic.md`
  * `data-model.md`

---

### Purpose

* Provide context
* Prevent logic loss
* Act as feature-level source of truth

---

## 🛠️ 5. Creating a Feature — Steps

---

### Step 1 — Identify the Feature

* Derive from:

  * Requirements
  * Business Logic
* Keep scope small and clear

---

### Step 2 — Create Documentation

Create:

```bash
/docs/mhp/features/{feature-name}/feature.md
```

Write:

* Purpose
* Flows
* Rules

---

### Step 3 — Validate Before Coding

Ensure:

* Matches Business Logic
* Uses correct entities
* Fits Architecture
* Follows Coding Rules

---

### Step 4 — Create Feature Code

Create:

```bash
/src/features/{feature-name}
```

Add:

* service
* repository
* schema (Zod)
* types

---

### Step 5 — Create API Endpoints

* Follow `workflow-api-endpoint.md`
* Use REST-style resources, for example:

```bash
GET    /api/boards
POST   /api/boards
GET    /api/boards/:boardId
PATCH  /api/boards/:boardId
PATCH  /api/cards/:cardId
POST   /api/cards/:cardId/move
```

(Exact paths belong in each feature’s `feature.md`.)

---

### Step 6 — Create Frontend

* Follow `workflow-frontend-component.md`
* Use:

  * React components
  * Forms where needed
  * API integration (containers or hooks — not inside dumb components)

---

### Step 7 — AI Implementation

When asking AI to generate code, ALWAYS provide:

* `architecture.md`
* `coding-rules.md`
* `workflow-feature.md` (this file)
* `workflow-api-endpoint.md`
* `workflow-frontend-component.md`
* The feature `feature.md`

---

### Instruction Example

> "Implement this feature strictly following all provided documents."

---

## ⚙️ 6. Implementation Rules

The system must:

* Implement one feature at a time
* Follow layer separation:

  * API → Service → Repository
* Respect business rules
* Respect **user ownership** of boards (scope all queries)

---

## 🧪 7. Feature Validation

After implementation:

* All flows must work
* All rules must be enforced
* No architecture violations
* Code must pass lint
* Drag-and-drop flows must persist correctly on the server

---

## ❌ 8. Forbidden Practices

* Writing code without `feature.md` for non-trivial work
* Mixing multiple features in one implementation without clear boundaries
* Skipping business logic validation
* Adding logic not described in `feature.md`
* Accessing DB outside repositories
* Duplicating shared logic inside feature folders instead of `lib`

---

## 📌 9. Feature Lifecycle

Each feature follows:

1. Identified
2. Documented (`feature.md`)
3. Implemented
4. Validated
5. Stabilized

---

## 🏁 10. Final Principle

> No code exists without a feature.
> No feature exists without documentation.

---

**Status:** Active  
**Type:** Feature Workflow  
**Version:** 0.0
