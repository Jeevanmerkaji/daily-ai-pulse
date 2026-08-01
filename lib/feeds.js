// lib/feeds.js
//
// Downloads recent headlines from a handful of AI news RSS feeds and hands
// back a simple flat list. We don't try to fetch the full article text here
// — just title, link, source name, and whatever short description the feed
// itself provides. That's plenty for Claude to pick the biggest story and
// write about it; it also keeps this step fast and dependency-free.

import Parser from "rss-parser";

const parser = new Parser();

// Reputable AI news feeds, verified working. Feel free to add/remove entries
// here later — nothing else in the app needs to change.
const FEEDS = [
  { name: "TechCrunch", url: "https://techcrunch.com/category/artificial-intelligence/feed/" },
  { name: "VentureBeat", url: "https://venturebeat.com/category/ai/feed/" },
  { name: "The Verge", url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml" },
  { name: "Ars Technica", url: "https://arstechnica.com/ai/feed/" },
  { name: "MIT Technology Review", url: "https://www.technologyreview.com/topic/artificial-intelligence/feed/" },
];

// How far back to look for "recent" stories. AI news moves fast, and this
// job runs once a day, so 48 hours gives a little buffer in case a feed is
// slow to update or the job runs slightly early/late.
const LOOKBACK_HOURS = 48;

// Fetches every feed and returns one combined array of recent articles:
// { title, link, source, publishedAt, snippet }
// If one feed fails (site down, feed URL changed, etc.) we log it and keep
// going with whatever feeds did work, rather than failing the whole job.
export async function fetchRecentArticles() {
  const cutoff = Date.now() - LOOKBACK_HOURS * 60 * 60 * 1000;
  const articles = [];

  for (const feed of FEEDS) {
    try {
      const parsed = await parser.parseURL(feed.url);
      for (const item of parsed.items) {
        const publishedAt = item.isoDate || item.pubDate || null;
        const publishedTime = publishedAt ? new Date(publishedAt).getTime() : null;

        // Skip anything older than our lookback window. If a feed item has
        // no date at all, we keep it rather than risk dropping real news.
        if (publishedTime && publishedTime < cutoff) continue;

        articles.push({
          title: item.title,
          link: item.link,
          source: feed.name,
          publishedAt,
          snippet: item.contentSnippet || item.summary || "",
        });
      }
    } catch (err) {
      console.error(`Failed to fetch feed "${feed.name}" (${feed.url}):`, err.message);
    }
  }

  return articles;
}
