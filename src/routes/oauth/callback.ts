import type { APIHandler } from "filesystem-routing/api";
import { redirect } from "@solidjs/web";
import { getOAuthClient } from "~/auth/client";
import { getPublicUrl } from "~/lib/getPublicUrl";
import { withCookie } from "~/lib/cookies";

const PUBLIC_URL = getPublicUrl();

export const GET: APIHandler = async ({ request }) => {
  try {
    const params = new URL(request.url).searchParams;
    const client = await getOAuthClient();

    const { session } = await client.callback(params);

    const response = redirect(`${PUBLIC_URL}/`);
    return withCookie(response, "did", session.did, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
  } catch (error) {
    console.error("OAuth callback error:", error);
    return redirect(`${PUBLIC_URL}/?error=login_failed`);
  }
};
