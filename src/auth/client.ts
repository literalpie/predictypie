"use server";
import {
  NodeOAuthClient,
  JoseKey,
  Keyset,
  buildAtprotoLoopbackClientMetadata,
  requestLocalLock,
  type OAuthClientMetadataInput,
} from "@atproto/oauth-client-node";
import { api } from "../../convex/_generated/api";
import { convexHttpClient } from "../lib/contextHttpClient";

export const SCOPE = "atproto repo:app.predictypie.prediction";

const PUBLIC_URL = process.env.VITE_PUBLIC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

function getClientMetadata(): OAuthClientMetadataInput {
  if (PUBLIC_URL) {
    console.log("Using public URL for client metadata:", PUBLIC_URL);
    return {
      client_id: `${PUBLIC_URL}/oauth/client-metadata.json`,
      client_name: "PredictyPie",
      client_uri: PUBLIC_URL,
      redirect_uris: [`${PUBLIC_URL}/oauth/callback`],
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      scope: SCOPE,
      token_endpoint_auth_method: "private_key_jwt" as const,
      token_endpoint_auth_signing_alg: "ES256" as const,
      jwks_uri: `${PUBLIC_URL}/.well-known/jwks.json`,
      dpop_bound_access_tokens: true,
    };
  }
  console.log(
    "no public url",
    process.env.VITE_PUBLIC_URL,
    import.meta.env.VITE_PUBLIC_URL,
  );
  return buildAtprotoLoopbackClientMetadata({
    scope: SCOPE,
    redirect_uris: ["http://127.0.0.1:3000/oauth/callback"],
  });
}

async function getKeyset(): Promise<Keyset | undefined> {
  if (PUBLIC_URL && PRIVATE_KEY) {
    return new Keyset([await JoseKey.fromJWK(JSON.parse(PRIVATE_KEY))]);
  }
  return undefined;
}

export async function getOAuthClient(): Promise<NodeOAuthClient> {
  return new NodeOAuthClient({
    clientMetadata: getClientMetadata(),
    keyset: await getKeyset(),
    requestLock: requestLocalLock,
    stateStore: {
      set: async (key, state) => {
        await convexHttpClient.mutation(api.auth.setState, { key, state });
      },
      get: async (key) => {
        const result = await convexHttpClient.query(api.auth.getState, { key });
        return result ? result.state : undefined;
      },
      del: async (key) => {
        await convexHttpClient.mutation(api.auth.delState, { key });
      },
    },
    sessionStore: {
      set: async (sub, sessionData) => {
        await convexHttpClient.mutation(api.auth.setSession, {
          did: sub,
          session: sessionData,
        });
      },
      get: async (sub) => {
        const result = await convexHttpClient.query(api.auth.getSession, {
          did: sub,
        });
        return result ? result.session : undefined;
      },
      del: async (sub) => {
        await convexHttpClient.mutation(api.auth.delSession, { did: sub });
      },
    },
  });
}
