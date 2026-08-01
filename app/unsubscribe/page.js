// app/unsubscribe/page.js
//
// The confirmation page people land on after clicking the unsubscribe link
// in an email. The actual unsubscribing already happened in
// app/api/unsubscribe/route.js, which redirected here with a "result" flag.

import Link from "next/link";

export default async function UnsubscribePage({ searchParams }) {
  const params = await searchParams;
  const success = params?.result === "success";

  return (
    <div className="mx-auto max-w-lg px-6 py-20 text-center">
      {success ? (
        <>
          <h1 className="text-2xl font-bold text-zinc-900">You&apos;re unsubscribed</h1>
          <p className="mt-3 text-zinc-600">
            You won&apos;t get any more emails from Daily AI Pulse. If that was a
            mistake, you can always sign up again from the homepage.
          </p>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold text-zinc-900">That link isn&apos;t valid</h1>
          <p className="mt-3 text-zinc-600">
            We couldn&apos;t find a matching subscription for that link. It may have
            already been used, or copied incorrectly.
          </p>
        </>
      )}
      <Link href="/" className="mt-6 inline-block text-sm font-medium text-zinc-900 underline underline-offset-4">
        Back to homepage
      </Link>
    </div>
  );
}
