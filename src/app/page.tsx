import { Show, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default async function Home() {
  return (
    <main className="mx-auto flex min-h-full max-w-lg flex-1 flex-col justify-center gap-8 p-8">
      <div className="rounded-2xl bg-ds-surface-container-lowest p-8 shadow-[0_8px_32px_rgba(26,28,28,0.08)] ring-1 ring-ds-on-surface/[0.06] backdrop-blur-md">
        <div className="stitch-accent-bar mb-5 h-1 w-full max-w-xs rounded-full" aria-hidden />
        <h1 className="text-2xl font-bold tracking-tight text-ds-on-surface">
          Goodbye Bad Habits
        </h1>
        <p className="mt-3 text-xs font-medium uppercase tracking-widest text-ds-on-surface-variant">
          Task board and agenda
        </p>
      </div>
      <Show when="signed-out">
        <div className="flex flex-wrap gap-3">
          <Link
            className="rounded-xl border border-ds-outline-variant/35 bg-ds-surface-container-high px-4 py-2 text-xs font-bold uppercase tracking-widest text-ds-on-surface transition hover:border-ds-primary-container/35"
            href="/sign-in"
          >
            Sign in
          </Link>
          <Link className="stitch-btn-primary px-4 py-2 text-xs font-bold uppercase tracking-widest" href="/sign-up">
            Sign up
          </Link>
        </div>
      </Show>
      <Show when="signed-in">
        <div className="flex flex-wrap items-center gap-4 rounded-xl bg-ds-surface-container-low p-4 shadow-sm ring-1 ring-ds-on-surface/[0.05] backdrop-blur-sm">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "ring-2 ring-ds-primary-fixed",
              },
            }}
          />
          <Link className="stitch-btn-primary px-4 py-2 text-xs font-bold uppercase tracking-widest" href="/my-boards">
            My boards
          </Link>
          <Link
            href="/dashboard"
            className="rounded-xl border border-ds-outline-variant/35 px-4 py-2 text-xs font-bold uppercase tracking-widest text-ds-on-surface transition hover:border-ds-primary-container/35 hover:text-ds-primary"
          >
            Dashboard
          </Link>
        </div>
      </Show>
    </main>
  );
}
