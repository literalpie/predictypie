"use server";
import { APIEvent } from "@solidjs/start/server";

const BASE_URL = "https://predictypie.local";

export async function GET({ nativeEvent }: APIEvent) {
  return new Response(
    JSON.stringify({
      client_id: `${BASE_URL}/oauth/client-metadata.json`,
      client_name: "PredictyPie",
      redirect_uris: [`${BASE_URL}/oauth/callback`],
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      token_endpoint_auth_methods: ["none"],
      scope: "atproto repo:app.predictypie.prediction",
    }),
    {
      headers: { "Content-Type": "application/json" },
    },
  );
}
