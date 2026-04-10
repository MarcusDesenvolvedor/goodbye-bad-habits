# Goodbye Bad Habits

**Goodbye Bad Habits** is a web app for organizing tasks on a **Kanban-style board** (columns like *To do*, *In progress*, *Done*), with an inbox and reminders. You sign in with an account, create boards, and manage cards on your own workspace.

This project is built with modern web technologies (Next.js, React, a PostgreSQL database, and [Clerk](https://clerk.com) for sign-in). You do **not** need to know how those work to run the app on your computer—you only need to install a few tools and copy some configuration values.

---

## What you need on your computer

| Requirement | What it is |
|-------------|------------|
| **Computer** | Windows, macOS, or Linux |
| **Internet** | To download software and create free accounts (database + login) |
| **About 15–30 minutes** | First-time setup |

You will install:

1. **Node.js** (includes `npm`) — runs the application locally.  
2. **A PostgreSQL database** — stores boards and tasks. The easiest path for beginners is a **free cloud database** (no need to install PostgreSQL on your PC).  
3. **A Clerk account** — handles “Sign in / Sign up” for the app.

Optional: **Git** — only if you clone the repository from GitHub. If you received the project as a ZIP folder, you can skip Git.

---

## Step 1 — Install Node.js

1. Open [https://nodejs.org](https://nodejs.org).
2. Download the **LTS** (“Long Term Support”) version for your system.
3. Run the installer and accept the defaults (make sure the option to install **npm** is enabled).
4. Restart the terminal (or open a new one).

**Check that it worked**

- **Windows:** open **PowerShell** or **Command Prompt** and run:

  ```bash
  node -v
  npm -v
  ```

  You should see version numbers (for example `v22.x` and `10.x`), not an error.

- **macOS / Linux:** open **Terminal** and run the same commands.

---

## Step 2 — Get the project on your machine

**Option A — ZIP folder**

1. Unzip the project into a folder you remember, for example `Documents\goodbye-bad-habits`.

**Option B — Git**

1. Install Git from [https://git-scm.com](https://git-scm.com) if needed.
2. In a terminal, go to the folder where you keep projects and run:

   ```bash
   git clone <URL_OF_THIS_REPOSITORY>
   cd goodbye-bad-habits
   ```

In the next steps, all commands are run **inside the project folder** (where `package.json` is).

---

## Step 3 — Install project dependencies

In the project folder, run:

```bash
npm install
```

Wait until it finishes. This downloads the libraries the app needs.

---

## Step 4 — Create a PostgreSQL database (free cloud)

The app needs a connection string called `DATABASE_URL`. Easiest options:

1. **[Neon](https://neon.tech)** or **[Supabase](https://supabase.com)** — sign up, create a project, choose **PostgreSQL**, then copy the **connection string** (it looks like `postgresql://user:password@host/dbname?...`).
2. Paste it somewhere safe—you will put it in the next step.

> **Tip:** Cloud providers often show the string under “Connection string”, “Database URL”, or “URI”. If they offer `sslmode=require` or similar for SSL, keep that in the URL when the docs say so.

---

## Step 5 — Create a Clerk application (login)

1. Go to [https://dashboard.clerk.com](https://dashboard.clerk.com) and create a free account.
2. Create a new **application**.
3. Open **API Keys** (or **Configure → API Keys**).
4. Copy:
   - **Publishable key** → starts with `pk_`
   - **Secret key** → starts with `sk_`

**Allow localhost**

In the Clerk dashboard, find **Domains** / **Allowed origins** / **Development** settings and ensure **`http://localhost:3000`** is allowed for local development (Clerk often adds this by default for new apps—if sign-in fails in the browser, check this first).

---

## Step 6 — Environment file (`.env.local`)

1. In the project folder, find the file **`.env.example`**.
2. **Copy** it and rename the copy to **`.env.local`** (same folder as `package.json`).
3. Open **`.env.local`** in a text editor (Notepad, VS Code, etc.) and fill in:

   | Variable | What to put |
   |----------|-------------|
   | `DATABASE_URL` | Your PostgreSQL connection string from Step 4 |
   | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key (`pk_...`) |
   | `CLERK_SECRET_KEY` | Clerk secret key (`sk_...`) |

4. Save the file.

> **Security:** Never commit `.env.local` or share your secret keys publicly. The project is set up to use `.env.local` only on your machine.

---

## Step 7 — Create database tables

With `DATABASE_URL` set in `.env.local`, run:

```bash
npx prisma migrate deploy
```

This applies the existing database structure (boards, lists, cards, etc.). If this command prints an error, read the message: it usually means the `DATABASE_URL` is wrong or the database is unreachable.

---

## Step 8 — Run the app

```bash
npm run dev
```

When you see something like “Ready on http://localhost:3000”, open a browser and go to:

**[http://localhost:3000](http://localhost:3000)**

Sign up or sign in with Clerk, then use **My boards** and the board pages as usual.

To stop the server, go back to the terminal and press **Ctrl+C**.

---

## Common problems

| Problem | What to try |
|---------|-------------|
| `node` or `npm` not found | Reinstall Node.js LTS and open a **new** terminal. |
| Clerk errors in the browser | Confirm keys in `.env.local`, restart `npm run dev`, check Clerk dashboard for `http://localhost:3000`. |
| Database / Prisma errors | Check `DATABASE_URL` (password, host, `sslmode` if required). |
| Port 3000 in use | Close another app using port 3000, or run `npx next dev -p 3001` and open `http://localhost:3001` (you may still need to allow that URL in Clerk). |

---

## Scripts (for reference)

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local development server |
| `npm run build` | Production build |
| `npm run start` | Run production build (after `build`) |
| `npm run lint` | Code checks |
| `npm run db:migrate` | Prisma migrate in dev (interactive) |
| `npm run db:push` | Push schema without migrations (advanced) |

Optional: `STITCH_API_KEY` in `.env.local` is only for downloading design reference assets (`npm run stitch:board-assets`); it is **not** required to run the app.

---

## Tech stack (short)

- **Next.js** & **React** — web UI and routes  
- **Prisma** & **PostgreSQL** — data layer  
- **Clerk** — authentication  
- **Tailwind CSS** — styling  

---

## License

This project is private (`"private": true` in `package.json`). Adjust licensing if you publish the repository.

---

*Portuguese version: [README.pt-BR.md](./README.pt-BR.md)*
