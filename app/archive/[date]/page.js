// app/archive/[date]/page.js
//
// One past story, looked up by its date (the [date] folder name makes this
// a "dynamic route" — /archive/2026-07-31 renders this page with
// params.date === "2026-07-31"). Same free-vs-pro topic gating as
// app/archive/page.js — see the comment there for why it's safe against
// URL editing.

import Link from "next/link";
import { notFound } from "next/navigation";
import { getStoryByDate } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { DEFAULT_TOPIC, isValidTopic } from "@/lib/topics";
import StoryCard from "@/app/components/StoryCard";

export const dynamic = "force-dynamic";

export default async function ArchiveStoryPage({ params, searchParams }) {
  const { date } = await params;
  const query = await searchParams;
  const user = await getCurrentUser();
  const isPro = user?.plan === "pro";

  const requestedTopic = typeof query?.topic === "string" ? query.topic : null;
  const effectiveTopic = isPro && isValidTopic(requestedTopic) ? requestedTopic : DEFAULT_TOPIC;

  const story = await getStoryByDate(date, effectiveTopic);

  if (!story) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <StoryCard story={story} />
      <div className="mt-6 text-center">
        <Link
          href={`/archive${effectiveTopic !== DEFAULT_TOPIC ? `?topic=${effectiveTopic}` : ""}`}
          className="text-sm font-medium text-zinc-600 underline underline-offset-4 hover:text-zinc-900"
        >
          ← Back to archive
        </Link>
      </div>
    </div>
  );
}
