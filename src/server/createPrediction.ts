"use server";

import { Client, l } from "@atproto/lex";
import { Tap } from "@atproto/tap";
import { getOAuthClient } from "~/auth/client";
import { main as predictionMain } from "~/lexicons/app/predictypie/prediction";

const TAP_URL = process.env.TAP_URL || "http://localhost:2480";
const TAP_ADMIN_PASSWORD = process.env.TAP_ADMIN_PASSWORD || "admin";

async function addRepoToTap(did: string) {
  try {
    const tap = new Tap(TAP_URL, { adminPassword: TAP_ADMIN_PASSWORD });
    await tap.addRepos([did]);
    console.log(`Added repo to Tap: ${did}`);
  } catch (err) {
    console.error("Failed to add repo to Tap:", err);
  }
}

export const createPrediction = async (did: string, text: string, deadline?: string) => {
  const now = l.toDatetimeString(new Date());
  const client = await getOAuthClient();
  const oauthSession = await client.restore(did);
  const lexClient = new Client(oauthSession);

  const result = await lexClient.create(predictionMain, {
    text,
    deadline: deadline ? l.toDatetimeString(new Date(deadline)) : now,
    createdAt: now,
  });

  console.log("PDS write succeeded:", result.uri);

  await addRepoToTap(did);

  return result.uri;
};
