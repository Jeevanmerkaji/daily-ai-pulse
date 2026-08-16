// app/today/page.js
//
// Shows the most recent story in the database. This is a Server Component,
// so it fetches directly from Postgres (via lib/db.js) while the page is
// being built on the server — no separate API call needed.

import { cache } from "react";
import Link from "next/link";
import { getLatestStory } from "@/lib/db";
import StoryCard from "@/app/components/StoryCard";

export const dynamic = "force-dynamic"; // always fetch fresh — this changes once a day

// Wrapped in cache() so generateMetadata and the page body share one fetch
// per request instead of hitting the database twice.
const getStory = cache(getLatestStory);

export async function generateMetadata() {
  const story = await getStory();
  if (!story) {
    return { title: "Today's Story" };
  }
  const description = story.summary.length > 160 ? `${story.summary.slice(0, 157)}...` : story.summary;
  return {
    title: story.headline,
    description,
    openGraph: { title: story.headline, description },
    twitter: { title: story.headline, description },
  };
}

export default async function TodayPage() {
  const story = await getStory();

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
