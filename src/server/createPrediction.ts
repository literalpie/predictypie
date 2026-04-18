"use server";

import { Client, l } from "@atproto/lex";
import { getOAuthClient } from "~/auth/client";
import { main as predictionMain } from "~/lexicons/app/predictypie/prediction";

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
  return result.uri;
};
