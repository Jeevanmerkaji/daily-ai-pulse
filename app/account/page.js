// app/account/page.js
//
// A logged-in user's home base: who they are, whether they get the daily
// email, which topic it's about, and their plan.

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { TOPICS, DEFAULT_TOPIC } from "@/lib/topics";

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const TOPIC_ERROR_MESSAGES = {
  "invalid-topic": "That's not a topic we recognize — please pick one from the list.",
  "server-error": "Something went wrong saving that. Please try again.",
};

const BILLING_ERROR_MESSAGES = {
  "no-billing-account": "You don't have a billing account yet — upgrade to Pro first.",
  "checkout-failed": "Couldn't start checkout. Please try again.",
  "portal-failed": "Couldn't open the billing portal. Please try again.",
};

export default async function AccountPage({ searchParams }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const topicUpdated = params?.["topic-updated"] === "1";
  const topicError = typeof params?.error === "string" ? TOPIC_ERROR_MESSAGES[params.error] : null;
  const billingError = typeof params?.error === "string" ? BILLING_ERROR_MESSAGES[params.error] : null;
  const upgradeResult = params?.upgrade; // "success" | "canceled" | undefined
  const currentTopic = user.topic || DEFAULT_TOPIC;
  const isPro = user.plan === "pro";

  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900">My Account</h1>

      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6">
        <p className="text-sm text-zinc-500">Email</p>
        <p className="font-medium text-zinc-900">{user.email}</p>

        <p className="mt-4 text-sm text-zinc-500">Member since</p>
        <p className="font-medium text-zinc-900">{formatDate(user.subscribed_at)}</p>

        <p className="mt-4 text-sm text-zinc-500">Daily email</p>
        {user.active ? (
          <div className="mt-1 flex items-center justify-between">
            <span className="font-medium text-green-700">Active</span>
            <a
              href={`/api/unsubscribe?token=${user.unsubscribe_token}`}
              className="text-sm text-zinc-500 underline underline-offset-4 hover:text-zinc-900"
            >
              Unsubscribe
            </a>
          </div>
        ) : (
          <div className="mt-1 flex items-center justify-between">
            <span className="font-medium text-zinc-500">Inactive</span>
            <form method="POST" action="/api/subscribe">
              <input type="hidden" name="email" value={user.email} />
              <input type="hidden" name="redirect" value="/account" />
              <button
                type="submit"
                className="rounded-lg bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-zinc-700"
              >
                Subscribe
              </button>
            </form>
          </div>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6">
        <p className="text-sm text-zinc-500">Which topic should your daily story be about?</p>
        <form method="POST" action="/api/account/topic" className="mt-3 flex flex-col gap-3">
          <input type="hidden" name="redirect" value="/account" />
          {TOPICS.map((topic) => (
            <label key={topic.id} className="flex items-start gap-2 text-sm">
              <input
                type="radio"
                name="topic"
                value={topic.id}
                defaultChecked={currentTopic === topic.id}
                className="mt-0.5"
              />
              <span>
                <span className="font-medium text-zinc-900">{topic.label}</span>
                <span className="text-zinc-500"> — {topic.description}</span>
              </span>
            </label>
          ))}
          <button
            type="submit"
            className="mt-1 self-start rounded-lg bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-zinc-700"
          >
            Save topic
          </button>
        </form>
        {topicUpdated && (
          <p className="mt-3 text-sm text-green-700">Saved — tomorrow&apos;s email will match your new topic.</p>
        )}
        {topicError && <p className="mt-3 text-sm text-red-600">{topicError}</p>}
      </div>

      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6">
        <p className="text-sm text-zinc-500">Plan</p>
        {isPro ? (
          <div className="mt-1 flex items-center justify-between">
            <span className="font-medium text-green-700">Pro — active</span>
            <form method="POST" action="/api/billing/portal">
              <button
                type="submit"
                className="rounded-lg border border-zinc-300 px-4 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
              >
                Manage billing
              </button>
            </form>
          </div>
        ) : (
          <>
            <p className="mt-1 font-medium text-zinc-900">Free</p>
            <p className="mt-1 text-sm text-zinc-500">
              Pro gets you every topic&apos;s story in one daily digest, plus full archive access to every topic.
            </p>
            <form method="POST" action="/api/billing/checkout" className="mt-3">
              <button
                type="submit"
                className="rounded-lg bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-zinc-700"
              >
                Upgrade to Pro
              </button>
            </form>
          </>
        )}
        {upgradeResult === "success" && (
          <p className="mt-3 text-sm text-green-700">
            Payment received — your Pro plan is being activated (this page will show it shortly).
          </p>
        )}
        {upgradeResult === "canceled" && (
          <p className="mt-3 text-sm text-zinc-500">Upgrade canceled — no charge was made.</p>
        )}
        {billingError && <p className="mt-3 text-sm text-red-600">{billingError}</p>}
      </div>

      <form method="POST" action="/api/logout" className="mt-6">
        <button type="submit" className="text-sm font-medium text-zinc-600 underline underline-offset-4 hover:text-zinc-900">
          Sign out
        </button>
      </form>
    </div>
  );
}
