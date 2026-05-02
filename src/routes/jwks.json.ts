"use server";

import { JoseKey } from "@atproto/oauth-client-node";

const PRIVATE_KEY = process.env.PRIVATE_KEY;

export async function GET() {
  if (!PRIVATE_KEY) {
    return new Response(JSON.stringify({ keys: [] }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const key = await JoseKey.fromJWK(JSON.parse(PRIVATE_KEY));
  return new Response(JSON.stringify({
    keys: [key.publicJwk],
  }), {
    headers: { "Content-Type": "application/json" },
  });
}
