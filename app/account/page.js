// app/account/page.js
//
// A logged-in user's home base. For now it just shows who they are and
// lets them turn the daily email on/off — the sections below marked
// "Phase 2b" / "Phase 2c" are where topic preferences and billing info will
// go once those are built, so this page doesn't need restructuring later.

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

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

      {/* Phase 2b: topic preferences will be added here. */}
      {/* Phase 2c: plan/billing info will be added here. */}

      <form method="POST" action="/api/logout" className="mt-6">
        <button type="submit" className="text-sm font-medium text-zinc-600 underline underline-offset-4 hover:text-zinc-900">
          Sign out
        </button>
      </form>
    </div>
  );
}
