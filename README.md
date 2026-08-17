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
    billing/checkout/route.js  Starts a Stripe Checkout session for Pro
    billing/portal/route.js    Opens the Stripe billing portal for Pro users
    webhooks/stripe/route.js   Stripe calls this when a payment/subscription changes
lib/
  db.js         All database queries live here
  feeds.js      Downloads headlines from the RSS feeds
  claude.js     Asks Claude to pick + summarize the top story (per topic)
  email.js      Sends the daily email + login links via Resend
  auth.js       Login/session constants + getCurrentUser() helper
  topics.js     The fixed list of topics users can follow
  dailyJob.js   Wires feeds -> claude -> db -> email together, per topic
  stripe.js     The shared Stripe client used by the billing/webhook routes
db/
  schema.sql                    Fresh-install table definitions
  migrations/001_accounts.sql   Upgrades a pre-accounts database
  migrations/002_topics.sql     Upgrades a pre-topics database
  migrations/003_billing.sql    Upgrades a pre-billing database
scripts/
  run-job-once.js  Manually run the daily job from your terminal
vercel.json    Tells Vercel when to run the daily job automatically
```

## One-time setup

You'll need free accounts with four services. Use your own regular email
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
4. **Stripe** (Pro plan billing) — [stripe.com](https://stripe.com). Create
   an account. You don't need to activate it for real payments yet — test
   mode works with no verification at all. See "Setting up Stripe" below for
   the rest of this one; it has a few more steps than the others.

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

Leave the three `STRIPE_*` variables for now — "Setting up Stripe" below
walks through getting each one.

Finally, create the database tables:
- **Brand-new database:** run the contents of `db/schema.sql` once (paste
  it into Neon's SQL Editor and run).
- **Already have a database from an earlier version of this project:** run
  whichever numbered migration(s) in `db/migrations/` you haven't applied
  yet, in order (001, then 002, then 003) — each upgrades your existing data
  in place.

## Setting up Stripe (Pro plan billing)

Subscribers on the free plan get one topic's story a day. Pro subscribers
(`€5/month`) get every topic's story in one digest email, plus full archive
access to every topic — see `app/api/billing/checkout/route.js`,
`app/api/billing/portal/route.js`, and `app/api/webhooks/stripe/route.js`.

This is the one service worth doing carefully, because test mode and live
mode are two completely separate environments in Stripe — separate API
keys, separate products/prices, separate webhooks. Do the whole thing in
**test mode** first; "Going live with Stripe" below covers switching a
deployed site over to real payments later.

1. In the Stripe Dashboard, make sure you're in **test mode** (top-left
   toggle), then go to **Product catalogue → Add a product**. Create a
   recurring product (e.g. "Daily AI Pulse Pro", €5.00/month). Open the
   price you just created and copy its ID (starts with `price_`) into
   `.env.local` as `STRIPE_PRO_PRICE_ID`.
2. Go to **Developers → API keys**, reveal the **Secret key** (starts with
   `sk_test_`), and put it in `.env.local` as `STRIPE_SECRET_KEY`.
3. Install the [Stripe CLI](https://docs.stripe.com/stripe-cli), then run
   `stripe login` once to connect it to your account. To receive webhook
   events locally, run this in its own terminal while you're testing:

   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

   It prints a webhook signing secret (starts with `whsec_`) — put that in
   `.env.local` as `STRIPE_WEBHOOK_SECRET`. This value is only good for as
   long as `stripe listen` keeps running; re-run it (and update the env var)
   whenever you come back to test billing again.
4. With `npm run dev` and `stripe listen` both running, sign in at
   `/account` and click "Upgrade to Pro". Complete Stripe's test checkout
   with card number `4242 4242 4242 4242`, any future expiry date, and any
   CVC. You should land back on `/account` showing "Pro — active", and the
   `stripe listen` terminal should show a `200` response for the
   `checkout.session.completed` event.

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

**Pro plan billing:** see "Setting up Stripe" above — that section doubles
as the testing walkthrough (upgrade with a test card, confirm the webhook
fires, confirm `/account` shows "Pro — active"). Pro subscribers also get
topic-gated archive browsing (`/archive?topic=...`) and a multi-topic
digest email instead of the single-topic one.

## Deploying

1. Push this project to a GitHub repo.
2. Import it into [Vercel](https://vercel.com/new) (it auto-detects
   Next.js — no config needed).
3. In the Vercel project's Settings → Environment Variables, add every
   variable from `.env.local` — but set `NEXT_PUBLIC_SITE_URL` to your real
   deployed URL (e.g. `https://daily-ai-pulse.vercel.app`) instead of
   localhost. For the three `STRIPE_*` variables, it's fine to add your test
   values for now — see "Going live with Stripe" below for switching those
   to real payments whenever you're ready.
4. Deploy. Vercel will automatically read `vercel.json` and schedule the
   daily job — no separate server or cron service needed.
5. To test the schedule works before waiting for it to fire naturally, open
   your Vercel project → Cron Jobs tab, and trigger the job manually from
   there.

The schedule in `vercel.json` (`0 13 * * *`) runs at 13:00 UTC, roughly
9am US Eastern time. Change that string to adjust when it runs — each
number is minute, hour, day-of-month, month, day-of-week
([crontab.guru](https://crontab.guru) is handy for this).

## Going live with Stripe

Everything above runs in Stripe **test mode** — no real card can be charged,
no matter what. When you're ready to actually accept payments for real,
Stripe treats live mode as a fully separate environment: you redo the
product/price and webhook steps, just switched to live mode.

1. In the Stripe Dashboard, activate the account for live payments if you
   haven't already (business details + bank account) — Stripe walks you
   through this, and it's a one-time step per account, not per project.
2. Switch the toggle to **live mode**, then repeat "Setting up Stripe" step
   1 above (Product catalogue → Add a product) to create the same Pro
   product/price in live mode. Prices don't carry over between test and
   live — you get a new `price_...` ID.
3. Repeat step 2 above (Developers → API keys) to get a live secret key
   (starts with `sk_live_`).
4. Go to **Developers → Webhooks** (live mode), add an endpoint at
   `https://<your-deployed-domain>/api/webhooks/stripe`, and select the
   `checkout.session.completed`, `customer.subscription.updated`, and
   `customer.subscription.deleted` events (the same ones
   `app/api/webhooks/stripe/route.js` handles). Reveal its signing secret.
5. In Vercel's Environment Variables, you now want **different values for
   Preview vs. Production** — Preview deploys should keep using test keys,
   so a pull request preview can never touch real money. For each of
   `STRIPE_SECRET_KEY`, `STRIPE_PRO_PRICE_ID`, and `STRIPE_WEBHOOK_SECRET`:
   - Edit the existing entry so it's scoped to **Preview** only (keep its
     test value).
   - Add a new entry with the same name, your **live** value from steps
     2-4 above, scoped to **Production** only.
6. Redeploy Production (Deployments → the current Production deployment's
   "..." menu → Redeploy) so it picks up the live values.

There's no way to fully verify live mode without a real charge — the safest
check is one genuine Pro upgrade (by you or an early subscriber), then
confirming in the Stripe Dashboard (live mode) that the payment and webhook
delivery both succeeded, and that the subscriber's row in the `users` table
shows `plan = 'pro'`.

## Making common changes

- **Add or remove an RSS feed:** edit the `FEEDS` list in `lib/feeds.js`.
- **Add or remove a topic:** edit the `TOPICS` list in `lib/topics.js` —
  the daily job, the account page, and the topic-update route all read
  from this one file.
- **Change how Claude picks/writes a story:** edit the prompts in
  `lib/claude.js` (there's a separate branch for "general" vs. other topics).
- **Change the email design:** edit `buildEmailHtml` in `lib/email.js`.
- **Change the landing page copy:** edit `app/page.js`.
- **Change the Pro plan price:** create a new price on the existing product
  in the Stripe Dashboard (test mode, and live mode once you're live), then
  update `STRIPE_PRO_PRICE_ID` wherever it's set. Existing subscribers keep
  paying whatever price they signed up at unless you change their
  subscription directly in Stripe.

## What's deliberately not in this yet

Accounts, topic personalization, and Pro plan billing are now in. Still to
come: a native mobile app with push notifications. The `users` table and
`getCurrentUser()` helper were built so that can hang off the existing
system without a rewrite.
