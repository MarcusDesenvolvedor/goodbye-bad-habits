# Feature: Authentication

**Goodbye Bad Habits — Web task board & agenda**

**Status:** Active  
**Type:** Feature specification

---

## Purpose

Provide **Clerk-based authentication** and keep an application **User** row in sync with the Clerk identity (`clerkId`), per [business-logic.md](../../business-logic.md) §3 and [data-model.md](../../data-model.md) §3. All later features scope data by this `User`.

---

## Business rules (reference)

- Each `User` has exactly one stable `clerkId` (unique).
- On first authenticated access, the app **upserts** `User` from Clerk profile (email).
- Unauthenticated clients cannot access private app data; API routes resolve the current user from Clerk and enforce authentication.

Full normative text: [business-logic.md](../../business-logic.md).

---

## Entities

| Entity | Notes |
|--------|--------|
| `User` | `id`, `clerkId`, `email`, `createdAt`, `updatedAt` — see [data-model.md](../../data-model.md) |

---

## Main flows

### Sign-up / sign-in (Clerk)

1. User opens public pages and uses Clerk **Sign in** / **Sign up**.
2. After success, Clerk establishes a session; middleware allows access to protected routes.

### Sync User (upsert)

1. Authenticated user hits **`GET /api/me`** (or loads a protected page that triggers it).
2. Route handler validates session, reads `userId` from Clerk (`clerkId` / `sub`).
3. **User service** calls **user repository** to `upsert` by `clerkId` with email from Clerk.
4. Response returns the app `User` record (JSON).

No webhook is required for this MVP; sync is **lazy on first API call** after login.

---

## API endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/me` | Required | Returns current app user; upserts from Clerk if missing |

---

## UI behavior (minimal)

- **Public:** landing at `/` with links to sign in / sign up (Clerk components).
- **Protected:** `/dashboard` — placeholder content after auth (basic layout for later Google Stitch).

---

## Dependencies

- Clerk (`@clerk/nextjs`)
- PostgreSQL + Prisma (`User` and full schema aligned with [db-schema.sql](../../db-schema.sql) at project root)

---

## Implementation notes

- **API → Service → Repository**; Prisma only in repositories.
- Zod validation for any request bodies (none for `GET /api/me`).
