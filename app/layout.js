import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const description = "The one AI news story that actually matters today — for busy small business owners.";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Daily AI Pulse",
    template: "%s — Daily AI Pulse",
  },
  description,
  openGraph: {
    title: "Daily AI Pulse",
    description,
    url: "/",
    siteName: "Daily AI Pulse",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Daily AI Pulse",
    description,
  },
};

export default async function RootLayout({ children }) {
  // Reading the session cookie here (via getCurrentUser) is what lets the
  // nav below show "Log in" vs "My Account" — it also means this layout
  // renders dynamically per-request rather than being cached as static
  // HTML, same as the rest of the app's database-backed pages already do.
  const user = await getCurrentUser();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900">
        <header className="border-b border-zinc-200 bg-white">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              Daily AI Pulse
            </Link>
            <nav className="flex items-center gap-6 text-sm font-medium text-zinc-600">
              <Link href="/today" className="hover:text-zinc-900">
                Today&apos;s Story
              </Link>
              <Link href="/archive" className="hover:text-zinc-900">
                Archive
              </Link>
              {user ? (
                <div className="flex items-center gap-4">
                  <Link href="/account" className="hover:text-zinc-900">
                    My Account
                  </Link>
                  <form method="POST" action="/api/logout">
                    <button type="submit" className="hover:text-zinc-900">
                      Sign out
                    </button>
                  </form>
                </div>
              ) : (
                <Link href="/login" className="hover:text-zinc-900">
                  Log in
                </Link>
              )}
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-zinc-200 bg-white">
          <div className="mx-auto max-w-3xl px-6 py-6 text-center text-sm text-zinc-500">
            <p>Daily AI Pulse — one story a day, nothing you don&apos;t need.</p>
            <nav className="mt-2 flex justify-center gap-4">
              <Link href="/privacy" className="hover:text-zinc-900">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-zinc-900">
                Terms of Service
              </Link>
              <Link href="/impressum" className="hover:text-zinc-900">
                Impressum
              </Link>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
