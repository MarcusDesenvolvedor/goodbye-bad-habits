# 🔄 Workflow — API Development

**Goodbye Bad Habits — Web task board & agenda**

This document defines the **step-by-step workflow and rules** for developing API endpoints implemented as **Next.js Route Handlers**, with **Clerk** for authentication and **Prisma** for persistence.

It must be followed whenever creating or modifying any API-related code.

---

## 🎯 1. Purpose

Ensure that every API endpoint:

* Follows the Architecture
* Respects the Business Logic
* Uses the Data Model correctly
* Complies with Coding Rules
* Is consistent, predictable, and maintainable

---

## 🧱 2. Technology Context

This workflow assumes:

* Next.js (Route Handlers)
* TypeScript
* REST-style JSON APIs
* Clerk authentication
* Prisma ORM
* Zod validation

---

## 📌 3. Before Creating an Endpoint

Before writing code, you MUST have:

* The **feature.md** describing the use case
* Access to:

  * `business-logic.md`
  * `data-model.md`
  * `architecture.md`
  * `coding-rules.md`

❗ Never create endpoints based on assumptions.

---

## 🛠️ 4. API Creation Steps

---

### Step 1 — Define the Use Case

Clearly define:

* What the endpoint does
* Who can access it (authenticated user)
* Which **board** or resource it affects and how ownership is verified

---

### Step 2 — Define Route & Method

Use REST conventions:

* `GET` → retrieve
* `POST` → create
* `PATCH` → update
* `DELETE` → delete (or soft-delete per spec)

---

### Route Rules

* Use plural resources where it helps consistency
* Use clean and predictable paths

Examples:

```bash
GET    /api/boards
POST   /api/boards
GET    /api/boards/:boardId
PATCH  /api/boards/:boardId
DELETE /api/boards/:boardId

GET    /api/boards/:boardId/lists
POST   /api/boards/:boardId/lists
PATCH  /api/lists/:listId
PATCH  /api/cards/:cardId
POST   /api/cards/:cardId/move
```

---

### Step 3 — Define Schema (Zod)

Create validation schemas:

* Request schema
* Response schema (optional)

Rules:

* Validate ALL inputs
* Do not trust the frontend
* Do not expose internal implementation details in errors

---

### Step 4 — Implement Route Handler

Location:

```bash
/src/app/api/{resource}/route.ts
```

(or nested dynamic segments as needed)

---

### Responsibilities:

* Receive request
* Parse input
* Validate with Zod
* Resolve authenticated user (Clerk)
* Call service
* Return response

---

### Must NOT:

* Contain business logic
* Access Prisma directly

---

## ⚙️ 5. Service Layer

Location:

```bash
/src/features/{feature}/{feature}.service.ts
```

(or aligned with repo layout under `/server/services` — follow `architecture.md`)

---

### Responsibilities:

* Implement use case logic
* Enforce business rules
* Validate **board ownership**: `board.userId` must match the app user linked to Clerk

---

### Must NOT:

* Access database directly

---

## 🗄️ 6. Repository Layer

Location:

```bash
/src/features/{feature}/{feature}.repository.ts
```

---

### Responsibilities:

* Perform Prisma operations
* Query database with correct `where` clauses (always scoped)

---

### Must NOT:

* Contain business logic

---

## 🔐 7. Authentication & Authorization

* Use Clerk session / `auth()` (or project helper) to get the current user
* Map Clerk user to internal `User` id if stored
* For any board, list, or card operation:

  * Load the board (or traverse list → board) and check `board.userId === currentUser.id`

---

## 🏪 8. Data Isolation Rules

* Every query for private data must filter by ownership (via `userId` on board or join path)
* Never return another user’s boards, lists, or cards

---

### NEVER:

* Access data without verifying the authenticated user owns the board
* Trust client-sent `userId` for authorization

---

## 📄 9. API Response Standards

Responses must:

* Be consistent
* Use JSON

---

### Standard Format:

```json
{
  "data": {}
}
```

---

### Error Format:

```json
{
  "error": "Error message"
}
```

---

### Rules:

* Never expose stack traces to clients
* Use clear messages

---

## ❌ 10. Forbidden Practices

* Business logic in API routes
* Skipping validation
* Accessing Prisma outside repositories
* Returning raw internal entities when a DTO is required
* Mixing users’ data
* Trusting frontend input for authorization

---

## 🧪 11. Validation Checklist

Before finishing an endpoint:

* [ ] Schema created and validated
* [ ] Route handler is thin
* [ ] Service implements logic
* [ ] Repository handles DB
* [ ] Clerk auth resolved
* [ ] Board / resource ownership validated
* [ ] Errors handled
* [ ] Response consistent
* [ ] Lint passes

---

## 🏁 12. Final Principle

> Every API endpoint is a contract.
> It must be predictable, validated, and aligned with business rules.

---

**Status:** Active  
**Type:** API Workflow  
**Version:** 0.0
