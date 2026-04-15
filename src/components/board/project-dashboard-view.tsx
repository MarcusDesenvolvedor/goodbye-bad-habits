"use client";

import Link from "next/link";

import { EmptyPlaceholder } from "@/components/shared/empty-placeholder";

export function ProjectDashboardView({ displayName }: { displayName: string }) {
  return (
    <>
      <div className="mb-10">
        <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-ds-on-surface md:text-4xl">
          Project Overview
        </h1>
        <p className="text-base font-medium text-ds-on-surface-variant">
          {`Welcome back, ${displayName}. Metrics and activity will appear here once your workspace is connected to live task data.`}
        </p>
      </div>

      <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        <EmptyPlaceholder message="No summary metrics yet." />
        <EmptyPlaceholder message="No pending review counts yet." />
        <EmptyPlaceholder message="No contributor stats yet." />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-3 px-0.5">
            <h2 className="text-xl font-bold tracking-tight text-ds-on-surface">Current priorities</h2>
            <Link
              href="/my-boards"
              className="text-sm font-bold text-ds-primary transition hover:text-ds-primary-container active:scale-95"
            >
              View all boards
            </Link>
          </div>
          <EmptyPlaceholder message="No priority tasks to show yet. Open a board and add cards to see them here." />
        </div>

        <div className="space-y-4 lg:col-span-5">
          <h2 className="px-0.5 text-xl font-bold tracking-tight text-ds-on-surface">Recent activity</h2>
          <EmptyPlaceholder message="No recent activity yet." />
        </div>
      </div>

      <div className="mt-14">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-bold tracking-tight text-ds-on-surface">Team availability</h2>
        </div>
        <EmptyPlaceholder message="Team presence is not configured for this workspace yet." />
      </div>
    </>
  );
}
