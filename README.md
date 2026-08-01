# Daily AI Pulse

The one AI news story that matters today, delivered by email — for small
business owners who don't have time to follow AI news themselves.

## How it works, in plain terms

1. Once a day, a scheduled job (see "The daily job" below) reads recent
   headlines from 5 AI news RSS feeds.
2. It asks Claude (Anthropic's AI) to pick the single most important story
   for a small business owner, and to write a short, jargon-free summary and
   a punchy headline.
3. That story gets saved to the database and emailed to everyone subscribed.
4. The website shows today's story and a simple archive of past days.

## Project layout

```
app/
  page.js                  Landing page + email signup form
  today/page.js             Shows the latest story
  archive/page.js            Lists all past stories
  archive/[date]/page.js      One past story, by date
  unsubscribe/page.js        Confirmation page after unsubscribing
  login/page.js              "Email me a login link" form
  account/page.js            Logged-in account page (subscription + topic)
  api/
    subscribe/route.js       Handles the signup form
    unsubscribe/route.js     Handles unsubscribe links from emails
    login/route.js           Sends a magic login link
    login/verify/route.js    Verifies a login link, starts a session
    logout/route.js          Ends a session
    account/topic/route.js   Saves a logged-in user's topic choice
    cron/daily-job/route.js  The daily pipeline (called by Vercel Cron)
lib/
  db.js         All database queries live here
  feeds.js      Downloads headlines from the RSS feeds
  claude.js     Asks Claude to pick + summarize the top story (per topic)
  email.js      Sends the daily email + login links via Resend
  auth.js       Login/session constants + getCurrentUser() helper
  topics.js     The fixed list of topics users can follow
  dailyJob.js   Wires feeds -> claude -> db -> email together, per topic
db/
  schema.sql                    Fresh-install table definitions
  migrations/001_accounts.sql   Upgrades a pre-accounts database
  migrations/002_topics.sql     Upgrades a pre-topics database
scripts/
  run-job-once.js  Manually run the daily job from your terminal
vercel.json    Tells Vercel when to run the daily job automatically
```

## One-time setup

You'll need free accounts with three services. Use your own regular email
for all of them — there's no need for separate/throwaway accounts.

1. **Neon** (database) — [neon.tech](https://neon.tech). Create a project,
   then go to the dashboard's "Connection Details" and copy the connection
   string.
2. **Anthropic** (the AI) — [console.anthropic.com](https://console.anthropic.com/settings/keys).
   Create an API key. Note: this is separate from any Claude.ai subscription
   and is billed per use (pennies for a job like this).
3. **Resend** (email) — [resend.com](https://resend.com/api-keys). Create an
   API key. You can start with their shared `onboarding@resend.dev` sending
   address — no domain setup required until you're ready to go live for
   real.

Then:

```bash
npm install
cp .env.example .env.local
```

Open `.env.local` and fill in `DATABASE_URL`, `ANTHROPIC_API_KEY`, and
`RESEND_API_KEY` with the values from the accounts above. Leave
`EMAIL_FROM` as `onboarding@resend.dev` and `NEXT_PUBLIC_SITE_URL` as
`http://localhost:3000` for now. Generate a random `CRON_SECRET` yourself,
for example:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Finally, create the database tables:
- **Brand-new database:** run the contents of `db/schema.sql` once (paste
  it into Neon's SQL Editor and run).
- **Already have a database from an earlier version of this project:** run
  whichever numbered migration(s) in `db/migrations/` you haven't applied
  yet, in order (001, then 002) — each upgrades your existing data in place.

## Testing each part

**The daily job on its own** (fetch news, ask Claude, save to DB — no
emails sent):

```bash
npm run run-job
```

Check the result landed correctly by running
`SELECT * FROM daily_stories;` in Neon's SQL Editor.

**The website:**

```bash
npm run dev
```

Open `http://localhost:3000`, sign up with a test email, and check
`/today` and `/archive`.

**Emails + unsubscribe**, once you also have a subscriber in the database
(sign up through the site, or add yourself directly): with `npm run dev`
still running, trigger the real job route in another terminal:

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" http://localhost:3000/api/cron/daily-job
```

That sends a real email to every active subscriber. Click the unsubscribe
link in the email to confirm that works too.

**Accounts (magic-link login):** with `npm run dev` running, visit
`/login` and enter an email. You'll get an email with a one-click login
link (works once, expires in 15 minutes) that signs you in and takes you to
`/account`, where you can see your subscription status, turn the daily
email on/off, and pick a topic. The header nav shows "Log in" or "My
Account"/"Sign out" depending on whether you're currently signed in.

**Topics:** each user has one topic (default: "general" — today's single
best story). Change it on `/account`. The daily job now runs once per topic
(see `lib/topics.js` for the list), saving one story per topic per day and
emailing each subscriber only the story for their own topic. The public
`/today` and `/archive` pages always show the "general" story, regardless
of how many topics exist behind the scenes.

## Deploying

1. Push this project to a GitHub repo.
2. Import it into [Vercel](https://vercel.com/new) (it auto-detects
   Next.js — no config needed).
3. In the Vercel project's Settings → Environment Variables, add every
   variable from `.env.local` — but set `NEXT_PUBLIC_SITE_URL` to your real
   deployed URL (e.g. `https://daily-ai-pulse.vercel.app`) instead of
   localhost.
4. Deploy. Vercel will automatically read `vercel.json` and schedule the
   daily job — no separate server or cron service needed.
5. To test the schedule works before waiting for it to fire naturally, open
   your Vercel project → Cron Jobs tab, and trigger the job manually from
   there.

The schedule in `vercel.json` (`0 13 * * *`) runs at 13:00 UTC, roughly
9am US Eastern time. Change that string to adjust when it runs — each
number is minute, hour, day-of-month, month, day-of-week
([crontab.guru](https://crontab.guru) is handy for this).

## Making common changes

- **Add or remove an RSS feed:** edit the `FEEDS` list in `lib/feeds.js`.
- **Add or remove a topic:** edit the `TOPICS` list in `lib/topics.js` —
  the daily job, the account page, and the topic-update route all read
  from this one file.
- **Change how Claude picks/writes a story:** edit the prompts in
  `lib/claude.js` (there's a separate branch for "general" vs. other topics).
- **Change the email design:** edit `buildEmailHtml` in `lib/email.js`.
- **Change the landing page copy:** edit `app/page.js`.

## What's deliberately not in this yet

Accounts and topic personalization are now in. Still to come, in order:
payment/subscription tiers (via Stripe), and a native mobile app with push
notifications. The `users` table, `getCurrentUser()` helper, and
`lib/topics.js` were built so those can hang off the existing system
without a rewrite.
