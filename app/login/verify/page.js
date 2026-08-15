// app/login/verify/page.js
//
// Landing page for a magic-link login email. Deliberately does NOT log the
// person in on load — email security scanners and link-prefetchers GET this
// URL automatically as soon as the email arrives, which would burn the
// single-use token before the person actually clicks it. Logging in only
// happens once they submit the form below, since that requires a real user
// action a scanner can't perform.

import { getUserByValidLoginToken } from "@/lib/db";

export default async function VerifyLoginPage({ searchParams }) {
  const params = await searchParams;
  const token = typeof params?.token === "string" ? params.token : "";
  const user = token ? await getUserByValidLoginToken(token) : null;

  return (
    <div className="mx-auto max-w-md px-6 py-20 text-center">
      {user ? (
        <>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Finish logging in</h1>
          <p className="mt-2 text-zinc-600">
            Confirm it&apos;s you to sign in as <strong>{user.email}</strong>.
          </p>
          <form method="POST" action="/api/login/verify" className="mt-8">
            <input type="hidden" name="token" value={token} />
            <button
              type="submit"
              className="rounded-lg bg-zinc-900 px-6 py-3 font-medium text-white transition-colors hover:bg-zinc-700"
            >
              Log in
            </button>
          </form>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Link expired or already used</h1>
          <p className="mt-2 text-zinc-600">
            Login links work once and expire after 15 minutes. Request a new one below.
          </p>
          <a
            href="/login"
            className="mt-8 inline-block rounded-lg bg-zinc-900 px-6 py-3 font-medium text-white transition-colors hover:bg-zinc-700"
          >
            Back to login
          </a>
        </>
      )}
    </div>
  );
}
