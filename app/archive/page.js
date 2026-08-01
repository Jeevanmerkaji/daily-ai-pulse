// app/archive/page.js
//
// Lists every past story, most recent first, each linking to its own page
// at /archive/YYYY-MM-DD.

import Link from "next/link";
import { getAllStories } from "@/lib/db";

export const dynamic = "force-dynamic";

function formatShortDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default async function ArchivePage() {
  const stories = await getAllStories();

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Archive</h1>

      {stories.length === 0 ? (
        <p className="mt-6 text-zinc-600">No stories yet — check back after the first daily story runs.</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {stories.map((story) => (
            <li key={story.id}>
              <Link
                href={`/archive/${story.date}`}
                className="block rounded-xl border border-zinc-200 bg-white p-5 transition-colors hover:border-zinc-400"
              >
                <p className="text-xs font-medium text-zinc-500">{formatShortDate(story.date)}</p>
                <p className="mt-1 font-semibold text-zinc-900">{story.headline}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
