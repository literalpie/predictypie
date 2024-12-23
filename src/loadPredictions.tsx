"use server";
import { AtpAgent } from "@atproto/api";
import { Notification } from "@atproto/api/dist/client/types/app/bsky/notification/listNotifications";

export type Prediction = {
  author: Notification["author"];
  record: {
    $type: string;
    createdAt: string;
    facets: unknown[];
    langs: "en"[];
    text: string;
  };
  uri: string;
};

export const loadPredictions = async () => {
  const agent = new AtpAgent({ service: "https://bsky.social" });
  await agent.login({
    identifier: process.env.BSKY_IDENTIFIER as string,
    password: process.env.BSKY_PASSWORD as string,
  });

  const noteListRes = await agent.listNotifications({});

  return noteListRes.data.notifications
    .filter((notif) => notif.reason === "mention")
    .map<Prediction>((notif) => ({
      author: notif.author,
      record: notif.record as Prediction["record"],
      uri: notif.uri,
    }));
};
