// lib/dailyJob.js
//
// The full daily pipeline in one place, so both the manual test script
// (scripts/run-job-once.js) and the real cron route
// (app/api/cron/daily-job/route.js) run the exact same logic — no risk of
// them drifting apart.

import { fetchRecentArticles } from "./feeds.js";
import { pickAndSummarizeStory } from "./claude.js";
import { saveStory, getActiveSubscribers, deleteExpiredSessions } from "./db.js";
import { sendDailyEmails } from "./email.js";
import { TOPICS, DEFAULT_TOPIC } from "./topics.js";

// Pass { sendEmails: false } to skip the email step (useful for testing the
// news-picking part on its own without spamming anyone).
export async function runDailyJob({ sendEmails = true } = {}) {
  // One shared pool of recent headlines — the RSS feeds are generic AI
  // news, not topic-specific, so there's no reason to fetch them again for
  // each topic below.
  const articles = await fetchRecentArticles();
  if (articles.length === 0) {
    throw new Error("No articles to summarize — all RSS feeds returned nothing.");
  }

  const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
  const storiesByTopic = {};

  // "general" goes first, and isn't wrapped in a try/catch: it's what most
  // subscribers get, so if picking it fails, the whole job should fail
  // loudly (exactly like it did before topics existed) rather than quietly
  // limping along.
  const generalPicked = await pickAndSummarizeStory(articles, DEFAULT_TOPIC);
  storiesByTopic[DEFAULT_TOPIC] = await saveStory({
    date: today,
    topic: DEFAULT_TOPIC,
    headline: generalPicked.headline,
    summary: generalPicked.summary,
    sourceUrl: generalPicked.source_url,
    sourceName: generalPicked.source_name,
  });

  // The rest run one at a time (not in parallel), so we don't fire several
  // Anthropic requests at once and so any failure's log line clearly says
  // which topic it was. If a niche topic's call fails outright, its
  // subscribers still get today's general story instead of no email at all.
  for (const topic of TOPICS) {
    if (topic.id === DEFAULT_TOPIC) continue;

    try {
      const picked = await pickAndSummarizeStory(articles, topic.id);
      storiesByTopic[topic.id] = await saveStory({
        date: today,
        topic: topic.id,
        headline: picked.headline,
        summary: picked.summary,
        sourceUrl: picked.source_url,
        sourceName: picked.source_name,
      });
    } catch (err) {
      console.error(`Failed to pick a story for topic "${topic.id}", falling back to today's general story:`, err.message);
      storiesByTopic[topic.id] = storiesByTopic[DEFAULT_TOPIC];
    }
  }

  let emailResult = null;
  if (sendEmails) {
    const subscribers = await getActiveSubscribers();
    emailResult = await sendDailyEmails(storiesByTopic, subscribers);
  }

  // Cheap housekeeping so expired login sessions don't pile up forever —
  // riding along on the once-a-day job rather than needing its own schedule.
  await deleteExpiredSessions();

  return { storiesByTopic, emailResult };
}
