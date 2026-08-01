// app/today/page.js
//
// Shows the most recent story in the database. This is a Server Component,
// so it fetches directly from Postgres (via lib/db.js) while the page is
// being built on the server — no separate API call needed.

import Link from "next/link";
import { getLatestStory } from "@/lib/db";
import StoryCard from "@/app/components/StoryCard";

export const dynamic = "force-dynamic"; // always fetch fresh — this changes once a day

export default async function TodayPage() {
  const story = await getLatestStory();

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      {story ? (
        <StoryCard story={story} />
      ) : (
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center text-zinc-600">
          No story yet — check back tomorrow morning!
        </div>
      )}
      <div className="mt-6 text-center">
        <Link href="/archive" className="text-sm font-medium text-zinc-600 underline underline-offset-4 hover:text-zinc-900">
          See past stories →
        </Link>
      </div>
    </div>
  );
}
