import { JoseKey } from "@atproto/oauth-client-node";
import type { APIHandler } from "filesystem-routing/api";

const PRIVATE_KEY = process.env.PRIVATE_KEY;

export const GET: APIHandler = async () => {
  if (!PRIVATE_KEY) {
    return new Response(JSON.stringify({ keys: [] }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const key = await JoseKey.fromJWK(JSON.parse(PRIVATE_KEY));
  return new Response(
    JSON.stringify({
      keys: [key.publicJwk],
    }),
    {
      headers: { "Content-Type": "application/json" },
    },
  );
};
