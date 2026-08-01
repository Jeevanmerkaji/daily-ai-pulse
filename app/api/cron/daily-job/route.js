// app/api/cron/daily-job/route.js
//
// This is the endpoint Vercel's Cron Jobs feature calls once a day (see
// vercel.json). It runs the full pipeline: fetch news, ask Claude to pick
// and summarize the top story, save it, and email every active subscriber.
//
// It's protected by CRON_SECRET so random visitors can't trigger it. When
// you set a CRON_SECRET environment variable in your Vercel project,
// Vercel automatically sends it back as "Authorization: Bearer <secret>"
// on the real scheduled requests. For local/manual testing, send that
// header yourself, e.g.:
//   curl -H "Authorization: Bearer YOUR_CRON_SECRET" http://localhost:3000/api/cron/daily-job

import { NextResponse } from "next/server";
import { runDailyJob } from "@/lib/dailyJob";

export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { storiesByTopic, emailResult } = await runDailyJob({ sendEmails: true });
    const stories = Object.fromEntries(
      Object.entries(storiesByTopic).map(([topic, story]) => [topic, { date: story.date, headline: story.headline }])
    );
    return NextResponse.json({
      ok: true,
      stories,
      emailsSent: emailResult?.sent ?? 0,
      emailsFailed: emailResult?.failed ?? 0,
    });
  } catch (err) {
    console.error("Daily job failed:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
