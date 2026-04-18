"use server";
import {
  NodeOAuthClient,
  buildAtprotoLoopbackClientMetadata,
  requestLocalLock,
} from "@atproto/oauth-client-node";
import { api } from "../../convex/_generated/api";
import { convexHttpClient } from "../lib/contextHttpClient";

export const SCOPE = "atproto repo:app.predictypie.prediction";

export async function getOAuthClient(): Promise<NodeOAuthClient> {
  return new NodeOAuthClient({
    clientMetadata: buildAtprotoLoopbackClientMetadata({
      scope: SCOPE,
      redirect_uris: ["http://127.0.0.1:3000/oauth/callback"],
    }),
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
        await convexHttpClient.mutation(api.auth.setSession, { did: sub, session: sessionData });
      },
      get: async (sub) => {
        const result = await convexHttpClient.query(api.auth.getSession, { did: sub });
        return result ? result.session : undefined;
      },
      del: async (sub) => {
        await convexHttpClient.mutation(api.auth.delSession, { did: sub });
      },
    },
  });
}