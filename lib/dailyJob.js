// lib/dailyJob.js
//
// The full daily pipeline in one place, so both the manual test script
// (scripts/run-job-once.js) and the real cron route
// (app/api/cron/daily-job/route.js) run the exact same logic — no risk of
// them drifting apart.

import { fetchRecentArticles } from "./feeds.js";
import { pickAndSummarizeStory } from "./claude.js";
import { saveStory, getActiveSubscribers } from "./db.js";
import { sendDailyEmails } from "./email.js";

// Pass { sendEmails: false } to skip the email step (useful for testing the
// news-picking part on its own without spamming anyone).
export async function runDailyJob({ sendEmails = true } = {}) {
  const articles = await fetchRecentArticles();
  if (articles.length === 0) {
    throw new Error("No articles to summarize — all RSS feeds returned nothing.");
  }

  const picked = await pickAndSummarizeStory(articles);

  const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
  const story = await saveStory({
    date: today,
    headline: picked.headline,
    summary: picked.summary,
    sourceUrl: picked.source_url,
    sourceName: picked.source_name,
  });

  let emailResult = null;
  if (sendEmails) {
    const subscribers = await getActiveSubscribers();
    emailResult = await sendDailyEmails(story, subscribers);
  }

  return { story, emailResult };
}
