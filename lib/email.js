// lib/email.js
//
// Sends the daily story to every active subscriber, using Resend
// (resend.com). Each subscriber gets their own copy of the email so their
// unsubscribe link can include their own personal token.

import { Resend } from "resend";
import { DEFAULT_TOPIC } from "./topics.js";

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

// storiesByTopic: { [topicId]: rowFromDailyStories } — one entry per topic,
//   built by lib/dailyJob.js
// subscribers: rows from the users table (email, unsubscribe_token, topic)
// Returns { sent, failed } counts.
export async function sendDailyEmails(storiesByTopic, subscribers) {
  if (subscribers.length === 0) {
    return { sent: 0, failed: 0 };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const emails = subscribers.map((subscriber) => {
    // Every subscriber has a topic (the database defaults it to "general"),
    // but falling back here too means a stale/removed topic value can never
    // crash a send — it just quietly gets the general story instead.
    const story = storiesByTopic[subscriber.topic] || storiesByTopic[DEFAULT_TOPIC];
    return {
      from: process.env.EMAIL_FROM,
      to: subscriber.email,
      subject: story.headline,
      html: buildEmailHtml({
        story,
        unsubscribeUrl: `${siteUrl}/api/unsubscribe?token=${subscriber.unsubscribe_token}`,
      }),
    };
  });

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

function buildMagicLinkEmailHtml({ loginUrl }) {
  return `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 560px; margin: 0 auto; color: #18181b;">
      <p style="font-size: 13px; color: #71717a; text-transform: uppercase; letter-spacing: 0.05em;">Daily AI Pulse</p>
      <h1 style="font-size: 22px; line-height: 1.3; margin: 8px 0 16px;">Log in to your account</h1>
      <p style="font-size: 16px; line-height: 1.6;">Click the button below to log in. This link works once and expires in 15 minutes.</p>
      <p style="margin: 24px 0;">
        <a href="${loginUrl}" style="display: inline-block; background: #18181b; color: #ffffff; font-weight: 600; padding: 12px 24px; border-radius: 8px; text-decoration: none;">Log in</a>
      </p>
      <p style="font-size: 13px; color: #a1a1aa;">If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;
}

// Sends a single login link to one person — this is a one-off transactional
// email, not a bulk send, so it uses resend.emails.send() directly instead
// of the batch path above.
export async function sendMagicLinkEmail(email, loginUrl) {
  await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Your Daily AI Pulse login link",
    html: buildMagicLinkEmailHtml({ loginUrl }),
  });
}
