// app/login/page.js
//
// Where an existing (or brand-new) account requests a magic login link.
// Like the homepage signup form, this is a plain HTML form — no client-side
// JavaScript needed for it to work.

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

const ERROR_MESSAGES = {
  "invalid-email": "That doesn't look like a valid email address — mind trying again?",
  "invalid-token": "That link is invalid or has expired. Request a new one below.",
  "server-error": "Something went wrong on our end. Please try again in a moment.",
};

export default async function LoginPage({ searchParams }) {
  const user = await getCurrentUser();
  if (user) {
    redirect("/account");
  }

  const params = await searchParams;
  const sent = params?.sent === "1";
  const error = typeof params?.error === "string" ? ERROR_MESSAGES[params.error] : null;

  return (
    <div className="mx-auto max-w-md px-6 py-20">
      <h1 className="text-center text-2xl font-bold tracking-tight text-zinc-900">
        Log in to your account
      </h1>
      <p className="mt-2 text-center text-zinc-600">
        Enter your email and we&apos;ll send you a one-click login link. No password needed.
      </p>

      <div className="mt-8">
        {sent ? (
          <div className="rounded-lg border border-green-200 bg-green-50 px-5 py-4 text-center text-green-800">
            Check your inbox — we&apos;ve sent you a login link. It expires in 15 minutes.
          </div>
        ) : (
          <form method="POST" action="/api/login" className="flex flex-col gap-3">
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
              Send login link
            </button>
          </form>
        )}
        {error && <p className="mt-3 text-center text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
