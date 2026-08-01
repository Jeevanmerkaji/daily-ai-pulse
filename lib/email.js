// lib/email.js
//
// Sends the daily story to every active subscriber, using Resend
// (resend.com). Each subscriber gets their own copy of the email so their
// unsubscribe link can include their own personal token.

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Resend's batch endpoint accepts at most 100 emails per request, so for a
// bigger subscriber list we just send multiple batches.
const BATCH_SIZE = 100;

function chunk(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

function buildEmailHtml({ story, unsubscribeUrl }) {
  // Plain, simple HTML that renders well in every email client — no fancy
  // layout tools needed for an MVP.
  return `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 560px; margin: 0 auto; color: #18181b;">
      <p style="font-size: 13px; color: #71717a; text-transform: uppercase; letter-spacing: 0.05em;">Daily AI Pulse</p>
      <h1 style="font-size: 24px; line-height: 1.3; margin: 8px 0 16px;">${story.headline}</h1>
      <p style="font-size: 16px; line-height: 1.6;">${story.summary}</p>
      <p style="margin-top: 24px;">
        <a href="${story.source_url}" style="color: #18181b; font-weight: 600;">Read the full story at ${story.source_name} &rarr;</a>
      </p>
      <hr style="margin: 32px 0; border: none; border-top: 1px solid #e4e4e7;" />
      <p style="font-size: 12px; color: #a1a1aa;">
        You're getting this because you subscribed to Daily AI Pulse.
        <a href="${unsubscribeUrl}" style="color: #a1a1aa;">Unsubscribe</a>
      </p>
    </div>
  `;
}

// story: a row from daily_stories (headline, summary, source_url, source_name)
// subscribers: rows from the subscribers table (email, unsubscribe_token)
// Returns { sent, failed } counts.
export async function sendDailyEmails(story, subscribers) {
  if (subscribers.length === 0) {
    return { sent: 0, failed: 0 };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const emails = subscribers.map((subscriber) => ({
    from: process.env.EMAIL_FROM,
    to: subscriber.email,
    subject: story.headline,
    html: buildEmailHtml({
      story,
      unsubscribeUrl: `${siteUrl}/api/unsubscribe?token=${subscriber.unsubscribe_token}`,
    }),
  }));

  let sent = 0;
  let failed = 0;

  for (const batch of chunk(emails, BATCH_SIZE)) {
    const { error } = await resend.batch.send(batch);
    if (error) {
      console.error("Resend batch send failed:", error);
      failed += batch.length;
    } else {
      sent += batch.length;
    }
  }

  return { sent, failed };
}
