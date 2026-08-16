// app/sitemap.js
//
// Generates /sitemap.xml — the static pages plus every day's general-topic
// story, so the archive is actually discoverable by search engines instead
// of only reachable by clicking through /archive.

import { getAllStories } from "@/lib/db";
import { DEFAULT_TOPIC } from "@/lib/topics";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// New stories land via the daily cron job, not a redeploy — without this,
// Next.js would prerender the sitemap once at build time and it would go
// stale every day a story is added without a code change shipping.
export const dynamic = "force-dynamic";

export default async function sitemap() {
  const staticRoutes = ["", "/today", "/archive", "/login", "/privacy", "/terms", "/impressum"].map(
    (path) => ({
      url: `${siteUrl}${path}`,
      lastModified: new Date(),
    })
  );

  const stories = await getAllStories(DEFAULT_TOPIC);
  const storyRoutes = stories.map((story) => ({
    url: `${siteUrl}/archive/${story.date}`,
    lastModified: new Date(story.date),
  }));

  return [...staticRoutes, ...storyRoutes];
}
