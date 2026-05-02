"use server";
import { APIEvent } from "@solidjs/start/server";
import { json } from "@solidjs/router";
import { getOAuthClient, SCOPE } from "~/auth/client";

export async function POST({ request, nativeEvent }: APIEvent) {
  try {
    const { handle } = await request.json();

    if (!handle || typeof handle !== "string") {
      return json({ error: "Handle is required" }, { status: 400 });
    }

    // Get the base URL from the request
    const protocol = nativeEvent?.socket?.encrypted ? "https" : "http";
    const host =
      request.headers.get("x-forwarded-host") ||
      request.headers.get("host") ||
      "127.0.0.1:3001";
    console.log("host", host);
    const baseUrl = `${protocol}://${host}`;

    const client = await getOAuthClient(baseUrl);
    const authUrl = await client.authorize(handle, {
      scope: SCOPE,
    });

    return json({ redirectUrl: authUrl.toString() });
  } catch (error) {
    console.error("OAuth login error:", error);
    return json(
      { error: error instanceof Error ? error.message : "Login failed" },
      { status: 500 },
    );
  }
}
