import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Daily AI Pulse",
  description: "The one AI news story that actually matters today — for busy small business owners.",
};

export default function RootLayout({ children }) {
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
            <nav className="flex gap-6 text-sm font-medium text-zinc-600">
              <Link href="/today" className="hover:text-zinc-900">
                Today&apos;s Story
              </Link>
              <Link href="/archive" className="hover:text-zinc-900">
                Archive
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-zinc-200 bg-white">
          <div className="mx-auto max-w-3xl px-6 py-6 text-center text-sm text-zinc-500">
            Daily AI Pulse — one story a day, nothing you don&apos;t need.
          </div>
        </footer>
      </body>
    </html>
  );
}
