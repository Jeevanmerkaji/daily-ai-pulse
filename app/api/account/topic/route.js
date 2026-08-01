// app/api/account/topic/route.js
//
// Handles the topic radio-button form on /account. Unlike /api/subscribe
// (which acts on whatever email is in the form), this always acts on
// whoever's session cookie is currently valid — there's no email field.

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { updateUserTopic } from "@/lib/db";
import { isValidTopic } from "@/lib/topics";

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url), 303);
  }

  const formData = await request.formData();
  const topic = (formData.get("topic") || "").toString();

  const redirectField = (formData.get("redirect") || "/account").toString();
  const redirectPath = redirectField.startsWith("/") ? redirectField : "/account";
  const destinationUrl = new URL(redirectPath, request.url);

  if (!isValidTopic(topic)) {
    destinationUrl.searchParams.set("error", "invalid-topic");
    return NextResponse.redirect(destinationUrl, 303);
  }

  try {
    await updateUserTopic(user.id, topic);
  } catch (err) {
    console.error("Failed to update topic:", err);
    destinationUrl.searchParams.set("error", "server-error");
    return NextResponse.redirect(destinationUrl, 303);
  }

  destinationUrl.searchParams.set("topic-updated", "1");
  return NextResponse.redirect(destinationUrl, 303);
}
