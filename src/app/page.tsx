import { Show, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default async function Home() {
  return (
    <main className="mx-auto flex min-h-full max-w-lg flex-1 flex-col justify-center gap-8 p-8">
      <div className="rounded-2xl border border-white/10 bg-[var(--stitch-surface)] p-8 shadow-[0_0_48px_rgba(59,130,246,0.1)] backdrop-blur-md">
        <div
          className="mb-5 h-1 w-full max-w-xs rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-violet-500 shadow-[0_0_16px_rgba(59,130,246,0.45)]"
          aria-hidden
        />
        <h1 className="text-2xl font-bold tracking-tight text-zinc-50">
          Goodbye Bad Habits
        </h1>
        <p className="mt-3 text-xs font-medium uppercase tracking-widest text-zinc-500">
          Task board and agenda
        </p>
      </div>
      <Show when="signed-out">
        <div className="flex flex-wrap gap-3">
          <Link
            className="rounded-lg border border-white/15 bg-zinc-900/60 px-4 py-2 text-xs font-bold uppercase tracking-widest text-zinc-200 shadow-[0_0_16px_rgba(0,0,0,0.35)] transition hover:border-blue-400/40"
            href="/sign-in"
          >
            Sign in
          </Link>
          <Link
            className="rounded-lg border border-blue-400/45 bg-blue-600/90 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white shadow-[0_0_22px_rgba(59,130,246,0.35)] transition hover:bg-blue-500"
            href="/sign-up"
          >
            Sign up
          </Link>
        </div>
      </Show>
      <Show when="signed-in">
        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-white/10 bg-zinc-900/45 p-4 shadow-[0_0_28px_rgba(0,0,0,0.35)] backdrop-blur-sm">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "border-2 border-blue-400/40 ring-2 ring-blue-500/15",
              },
            }}
          />
          <Link
            className="rounded-lg border border-violet-400/40 bg-violet-600/80 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white shadow-[0_0_18px_rgba(139,92,246,0.3)] transition hover:bg-violet-500"
            href="/my-boards"
          >
            My boards
          </Link>
        </div>
      </Show>
    </main>
  );
}
