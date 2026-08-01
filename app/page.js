// app/page.js
//
// The landing page. It's a Server Component (the default in Next.js's App
// Router) — it runs on the server and sends plain HTML to the browser. The
// signup form below is a normal HTML <form> that POSTs to /api/subscribe;
// no client-side JavaScript is needed for it to work.

import Link from "next/link";

const ERROR_MESSAGES = {
  "invalid-email": "That doesn't look like a valid email address — mind trying again?",
  "server-error": "Something went wrong on our end. Please try again in a moment.",
};

export default async function HomePage({ searchParams }) {
  const params = await searchParams;
  const subscribed = params?.subscribed === "1";
  const error = typeof params?.error === "string" ? ERROR_MESSAGES[params.error] : null;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <section className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
          The ONE AI story that matters today.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-zinc-600">
          No digests. No jargon. No hours lost to AI Twitter. Every morning we read
          the AI news so you don&apos;t have to, and send you the single story that
          actually affects your business — explained in plain English, in under a
          minute.
        </p>
      </section>

      <section className="mx-auto mt-10 max-w-md">
        {subscribed ? (
          <div className="rounded-lg border border-green-200 bg-green-50 px-5 py-4 text-center text-green-800">
            You&apos;re in! Keep an eye on your inbox for tomorrow&apos;s story.
          </div>
        ) : (
          <form
            method="POST"
            action="/api/subscribe"
            className="flex flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              name="email"
              required
              placeholder="you@yourbusiness.com"
              className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-lg bg-zinc-900 px-6 py-3 font-medium text-white transition-colors hover:bg-zinc-700"
            >
              Get today&apos;s story
            </button>
          </form>
        )}
        {error && (
          <p className="mt-3 text-center text-sm text-red-600">{error}</p>
        )}
        <p className="mt-3 text-center text-xs text-zinc-400">
          Free. One email a day. Unsubscribe anytime with one click.
        </p>
        <p className="mt-1 text-center text-xs text-zinc-400">
          Already a subscriber?{" "}
          <Link href="/login" className="underline underline-offset-4 hover:text-zinc-600">
            Log in
          </Link>
        </p>
      </section>

      <section className="mx-auto mt-20 grid max-w-2xl gap-8 sm:grid-cols-3">
        <div className="text-center">
          <div className="text-2xl">📰</div>
          <h3 className="mt-2 font-semibold">We read everything</h3>
          <p className="mt-1 text-sm text-zinc-600">
            We scan the day&apos;s AI news from reputable sources so you don&apos;t
            have to.
          </p>
        </div>
        <div className="text-center">
          <div className="text-2xl">🎯</div>
          <h3 className="mt-2 font-semibold">We pick just one</h3>
          <p className="mt-1 text-sm text-zinc-600">
            The single story that actually matters — not a 10-item digest you&apos;ll
            never finish.
          </p>
        </div>
        <div className="text-center">
          <div className="text-2xl">💬</div>
          <h3 className="mt-2 font-semibold">In plain English</h3>
          <p className="mt-1 text-sm text-zinc-600">
            No jargon. Just what happened and why it matters for your business.
          </p>
        </div>
      </section>
    </div>
  );
}
