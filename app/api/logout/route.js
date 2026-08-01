// app/api/logout/route.js
//
// Signs the current browser out: deletes the session from the database (so
// the cookie's value stops meaning anything even if someone kept a copy of
// it) and clears the cookie itself. This is a POST, not a GET, specifically
// so that link previews/prefetching can never accidentally log someone out.

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/lib/auth";
import { deleteSession } from "@/lib/db";

export async function POST(request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await deleteSession(token);
  }

  const response = NextResponse.redirect(new URL("/", request.url), 303);
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}
