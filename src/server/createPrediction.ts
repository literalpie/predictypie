"use server";

import { Client, l } from "@atproto/lex";
import { AtUri } from "@atproto/syntax";
import { getOAuthClient } from "~/auth/client";
import { main as predictionMain } from "~/lexicons/app/predictypie/prediction";

async function addRepoToTap(did: string) {
  const response = await fetch("https://community-tap.netlify.app/api/hooks/addRepo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Later: 'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      repoDid: did,
    }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to add repo: ${error.error}`);
  }
  return await response.json();
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

  await addRepoToTap(did);

  return result.uri;
};

export const resolvePrediction = async (
  did: string,
  atUri: string,
  resolvedAs: "correct" | "incorrect",
) => {
  const parts = atUri.replace("at://", "").split("/");
  const rkey = parts[2];

  const client = await getOAuthClient();
  const oauthSession = await client.restore(did);
  const lexClient = new Client(oauthSession);

  const existing = await lexClient.get(predictionMain, { rkey });

  await lexClient.put(
    predictionMain,
    {
      text: existing.value.text,
      deadline: existing.value.deadline,
      createdAt: existing.value.createdAt,
      resolvedAs,
    },
    { rkey },
  );
};

export const deletePrediction = async (did: string, atUri: string) => {
  const uri = new AtUri(atUri);

  const client = await getOAuthClient();
  const oauthSession = await client.restore(did);
  const lexClient = new Client(oauthSession);

  await lexClient.deleteRecord(uri.collectionSafe, uri.rkeySafe);
};
