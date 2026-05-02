"use server";

import { getPublicUrl } from "~/lib/getPublicUrl";

const BASE_URL = getPublicUrl();

export async function GET() {
  const tokenEndpointAuthMethod = process.env.PRIVATE_KEY ? "private_key_jwt" : "none";

  return new Response(
    JSON.stringify({
      client_id: `${BASE_URL}/oauth/client-metadata.json`,
      client_name: "PredictyPie",
      client_uri: BASE_URL,
      redirect_uris: [`${BASE_URL}/oauth/callback`],
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      token_endpoint_auth_method: tokenEndpointAuthMethod,
      ...(process.env.PRIVATE_KEY && {
        token_endpoint_auth_signing_alg: "ES256",
        jwks_uri: `${BASE_URL}/jwks.json`,
        dpop_bound_access_tokens: true,
      }),
      scope: "atproto repo:app.predictypie.prediction",
    }),
    {
      headers: { "Content-Type": "application/json" },
    },
  );
}
