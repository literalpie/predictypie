"use server";

import { APIEvent } from "@solidjs/start/server";
import { setCookie } from "@solidjs/start/http";
import { redirect } from "@solidjs/router";

import { getOAuthClient } from "~/auth/client";

const PUBLIC_URL = "http://127.0.0.1:3000";

export async function GET(request: APIEvent) {
  try {
    if (!request.nativeEvent) throw redirect(`${PUBLIC_URL}/?error=missing_event`);

    const params = new URL(request.request.url).searchParams;
    const client = await getOAuthClient();

    const { session } = await client.callback(params);

    const response = redirect(`${PUBLIC_URL}/`);

    setCookie("did", session.did, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("OAuth callback error:", error);
    return redirect(`${PUBLIC_URL}/?error=login_failed`);
  }
}
