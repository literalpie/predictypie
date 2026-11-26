import type { APIHandler } from "filesystem-routing/api";
import { getOAuthClient } from "~/auth/client";
import { SCOPE } from "~/auth/scope";

export const POST: APIHandler = async ({ request }) => {
  try {
    const { handle } = await request.json();

    if (!handle || typeof handle !== "string") {
      return Response.json({ error: "Handle is required" }, { status: 400 });
    }

    const client = await getOAuthClient();
    const authUrl = await client.authorize(handle, {
      scope: SCOPE,
    });

    return Response.json({ redirectUrl: authUrl.toString() });
  } catch (error) {
    console.error("OAuth login error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Login failed" },
      { status: 500 },
    );
  }
};
