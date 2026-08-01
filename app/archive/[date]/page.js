// app/archive/[date]/page.js
//
// One past story, looked up by its date (the [date] folder name makes this
// a "dynamic route" — /archive/2026-07-31 renders this page with
// params.date === "2026-07-31").

import Link from "next/link";
import { notFound } from "next/navigation";
import { getStoryByDate } from "@/lib/db";
import StoryCard from "@/app/components/StoryCard";

export const dynamic = "force-dynamic";

export default async function ArchiveStoryPage({ params }) {
  const { date } = await params;
  const story = await getStoryByDate(date);

  if (!story) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <StoryCard story={story} />
      <div className="mt-6 text-center">
        <Link href="/archive" className="text-sm font-medium text-zinc-600 underline underline-offset-4 hover:text-zinc-900">
          ← Back to archive
        </Link>
      </div>
    </div>
  );
}
