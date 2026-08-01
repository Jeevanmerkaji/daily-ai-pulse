// lib/claude.js
//
// Sends the day's headlines to Claude and asks for three things back:
//   1. which single story matters most today
//   2. a plain-English summary of it for a busy, non-technical small
//      business owner
//   3. a punchy one-line headline
//
// Instead of asking Claude to "please reply with JSON" (which it sometimes
// gets slightly wrong, like leaving out a field), we use Anthropic's "tool
// use" feature: we describe a fake tool called `publish_story` with a strict
// schema, and force Claude to "call" it. This guarantees the response always
// has exactly the fields we need, in the right shape.

import Anthropic from "@anthropic-ai/sdk";
import { TOPICS, DEFAULT_TOPIC } from "./topics.js";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Keep this current with Anthropic's latest generally-available model.
const MODEL = "claude-sonnet-5";

// The schema Claude's answer must match. This isn't a real tool that runs
// code — it's just a structured "form" for Claude to fill in.
const PUBLISH_STORY_TOOL = {
  name: "publish_story",
  description: "Publish today's single most important AI news story for Daily AI Pulse readers.",
  input_schema: {
    type: "object",
    properties: {
      headline: {
        type: "string",
        description: "A punchy, one-line headline, under 12 words.",
      },
      summary: {
        type: "string",
        description:
          "A 3-5 sentence, plain-English summary of what happened and why it matters for a small business owner. No jargon, no hype.",
      },
      source_url: {
        type: "string",
        description: "The exact Link of the chosen story, copied from the list you were given.",
      },
      source_name: {
        type: "string",
        description: "The exact source name of the chosen story, copied from the list you were given.",
      },
    },
    required: ["headline", "summary", "source_url", "source_name"],
  },
};

function buildPrompt(articles, topic) {
  // We only send the fields Claude actually needs to decide and write about
  // the story — title, source, link, and a short snippet for context.
  const list = articles
    .map(
      (a, i) =>
        `${i + 1}. [${a.source}] ${a.title}\n   Link: ${a.link}\n   Snippet: ${a.snippet || "(none)"}`
    )
    .join("\n\n");

  // "general" keeps the exact original prompt — this is the story most
  // subscribers get, and its wording/behavior must not change just because
  // topics now exist.
  if (topic === DEFAULT_TOPIC) {
    return `You are the editor of "Daily AI Pulse", a daily email that tells small business owners the ONE AI news story that actually matters today. Your reader is busy, non-technical, and doesn't have time to follow AI news.

Below is a list of recent AI news headlines gathered from several sources today.

${list}

Pick the SINGLE most significant story from the list above — the one a small business owner would most want to know about (favors real-world impact, new tools they could use, major shifts, or things that affect their business or industry over incremental research news). Then call publish_story with your headline, summary, and the chosen story's exact source link and source name.`;
  }

  // Other topics: same reader, but they've specifically asked for one
  // topic. The article pool is generic AI news (not topic-specific feeds),
  // so some days won't have a strong match — Claude is told to pick the
  // closest fit and be upfront about it rather than pretend it's a perfect
  // match.
  const topicLabel = TOPICS.find((t) => t.id === topic)?.label ?? topic;

  return `You are the editor of "Daily AI Pulse", a daily email that tells small business owners the ONE AI news story that actually matters today. This reader has specifically chosen to follow the "${topicLabel}" topic instead of general AI news. Your reader is busy, non-technical, and doesn't have time to follow AI news.

Below is a list of recent AI news headlines gathered from several general AI news sources today (these sources aren't topic-specific, so not every story will be a perfect fit for "${topicLabel}").

${list}

Pick the SINGLE story from the list above that best fits the "${topicLabel}" topic. If nothing is a strong, direct match today, pick the closest/most tangentially relevant story instead — but be upfront about that in the summary (e.g. say plainly that there wasn't a dedicated story on this topic today, and briefly explain why you're sharing this one anyway). Never present a loosely related story as if it were a perfect match. Then call publish_story with your headline, summary, and the chosen story's exact source link and source name.`;
}

// Takes the flat article list from lib/feeds.js and returns
// { headline, summary, source_url, source_name }
export async function pickAndSummarizeStory(articles, topic = DEFAULT_TOPIC) {
  if (articles.length === 0) {
    throw new Error("No articles to summarize — all RSS feeds returned nothing.");
  }

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    tools: [PUBLISH_STORY_TOOL],
    tool_choice: { type: "tool", name: "publish_story" }, // force Claude to use the tool, not just talk
    messages: [{ role: "user", content: buildPrompt(articles, topic) }],
  });

  const toolCall = message.content.find(
    (block) => block.type === "tool_use" && block.name === "publish_story"
  );

  if (!toolCall) {
    throw new Error(`Claude didn't return a publish_story call. Raw response: ${JSON.stringify(message.content)}`);
  }

  const story = toolCall.input;

  if (!story.headline || !story.summary || !story.source_url || !story.source_name) {
    throw new Error(`Claude's response was missing a required field: ${JSON.stringify(story)}`);
  }

  return story;
}
