// @refresh reload
"use server";
import { AtpAgent } from "@atproto/api";
import { Notification } from "@atproto/api/dist/client/types/app/bsky/notification/listNotifications";
// import { startServer } from "./mocks";
// startServer(); // Start the MSW server

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
    // NOTE: must have identifier and password set in .env file.
    // This can't be shared with git for security reasons.
    identifier: process.env.BSKY_IDENTIFIER as string,
    password: process.env.BSKY_PASSWORD as string,
  });
  const noteListRes = await agent.listNotifications({});
  // console.log("noteListRes", noteListRes.data.notifications);
  return noteListRes.data.notifications
    .filter((notif) => notif.reason === "mention")
    .filter((notif)=>(notif.record as Prediction['record']).text.toLowerCase().includes('i predict'))
    .map<Prediction>((notif) => ({
      author: notif.author,
      record: notif.record as Prediction["record"],
      uri: notif.uri,
    }));
};
