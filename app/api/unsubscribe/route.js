// app/api/unsubscribe/route.js
//
// The link in every email points here: /api/unsubscribe?token=...
// It deactivates the subscriber (if the token is real) and redirects to a
// simple confirmation page — no login or extra clicks required.

import { NextResponse } from "next/server";
import { deactivateByToken } from "@/lib/db";

export async function GET(request) {
  const token = new URL(request.url).searchParams.get("token");
  const confirmationUrl = new URL("/unsubscribe", request.url);

  if (!token) {
    confirmationUrl.searchParams.set("result", "invalid");
    return NextResponse.redirect(confirmationUrl);
  }

  const subscriber = await deactivateByToken(token);
  confirmationUrl.searchParams.set("result", subscriber ? "success" : "invalid");
  return NextResponse.redirect(confirmationUrl);
}
