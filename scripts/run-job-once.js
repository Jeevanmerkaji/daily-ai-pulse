// scripts/run-job-once.js
//
// A manual, run-it-yourself version of the daily job — handy for testing
// without waiting for the real cron schedule. By default it does NOT send
// emails (so you can safely re-run it as many times as you want while
// testing the news-picking part). Add --with-emails to also send to every
// active subscriber, e.g. once you're testing Stage 3 for real.
//
// Run it from the project root with:
//   npm run run-job
//   npm run run-job -- --with-emails
//
// (That npm script passes --env-file=.env.local to Node, which loads your
// secrets from .env.local before the script runs.)

import { runDailyJob } from "../lib/dailyJob.js";

async function main() {
  const sendEmails = process.argv.includes("--with-emails");

  console.log("Running the daily job" + (sendEmails ? " (will send emails)..." : " (no emails this run)..."));
  const { story, emailResult } = await runDailyJob({ sendEmails });

  console.log("\nDone! Saved story:\n");
  console.log(story);

  if (emailResult) {
    console.log(`\nEmails sent: ${emailResult.sent}, failed: ${emailResult.failed}`);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("\nJob failed:", err.message);
  process.exit(1);
});
