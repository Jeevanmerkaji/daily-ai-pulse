// app/archive/page.js
//
// Lists every past story, most recent first, each linking to its own page
// at /archive/YYYY-MM-DD. Free/anonymous visitors always see the general
// topic's archive. Pro subscribers can browse any topic via ?topic=... —
// that override only takes effect if we can confirm (server-side, via the
// session cookie) that the visitor is actually logged in as a pro user, so
// it can't be unlocked by just editing the URL.

import Link from "next/link";
import { getAllStories } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { TOPICS, DEFAULT_TOPIC, isValidTopic } from "@/lib/topics";

export const dynamic = "force-dynamic";

function formatShortDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default async function ArchivePage({ searchParams }) {
  const params = await searchParams;
  const user = await getCurrentUser();
  const isPro = user?.plan === "pro";

  const requestedTopic = typeof params?.topic === "string" ? params.topic : null;
  const effectiveTopic = isPro && isValidTopic(requestedTopic) ? requestedTopic : DEFAULT_TOPIC;

  const stories = await getAllStories(effectiveTopic);

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Archive</h1>

      {isPro && (
        <div className="mt-4 flex flex-wrap gap-2">
          {TOPICS.map((topic) => (
            <Link
              key={topic.id}
              href={`/archive?topic=${topic.id}`}
              className={`rounded-full border px-3 py-1 text-sm ${
                effectiveTopic === topic.id
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-300 text-zinc-600 hover:border-zinc-400"
              }`}
            >
              {topic.label}
            </Link>
          ))}
        </div>
      )}

      {stories.length === 0 ? (
        <p className="mt-6 text-zinc-600">No stories yet — check back after the first daily story runs.</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {stories.map((story) => (
            <li key={story.id}>
              <Link
                href={`/archive/${story.date}${effectiveTopic !== DEFAULT_TOPIC ? `?topic=${effectiveTopic}` : ""}`}
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
