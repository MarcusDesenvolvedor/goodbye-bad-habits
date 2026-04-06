import { Show, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default async function Home() {
  return (
    <main className="mx-auto flex min-h-full max-w-lg flex-1 flex-col justify-center gap-6 p-8">
      <h1 className="text-2xl font-semibold">Goodbye Bad Habits</h1>
      <p className="text-sm text-zinc-600">Task board and agenda (UI placeholder)</p>
      <Show when="signed-out">
        <div className="flex flex-wrap gap-3">
          <Link
            className="rounded border border-zinc-300 px-3 py-2 text-sm"
            href="/sign-in"
          >
            Sign in
          </Link>
          <Link
            className="rounded border border-zinc-300 px-3 py-2 text-sm"
            href="/sign-up"
          >
            Sign up
          </Link>
        </div>
      </Show>
      <Show when="signed-in">
        <div className="flex flex-wrap items-center gap-4">
          <UserButton />
          <Link className="text-sm underline" href="/my-boards">
            My boards
          </Link>
        </div>
      </Show>
    </main>
  );
}
