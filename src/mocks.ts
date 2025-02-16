import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

export const handlers = [
  http.post("https://bsky.social/xrpc/com.atproto.server.createSession", () => {
    const res = HttpResponse.json({
      did: "did:plc:7nnwcfq6lludnlfpngdihs2x",
      didDoc: {
        id: "did:plc:7nnwcfq6lludnlfpngdihs2x",
      },
      handle: "predictypie.bsky.social",
      email: "example@example.com",
      emailConfirmed: true,
      emailAuthFactor: false,
      accessJwt: "mocked",
      refreshJwt: "mocked",
      active: true,
    });
    return res;
  }),
  http.get(
    "https://bsky.social/xrpc/app.bsky.notification.listNotifications",
    () => {
      const res = HttpResponse.json({
        notifications: [
          {
            author: {
              did: "did:plc:r3bpptdqfsipcnildivvdv5d",
              handle: "literlpie.bsky.social",
            },
            record: {
              createdAt: "2021-09-01",
              text: "@predictypie.bsky.social I predict it won't work still!!??",
              langs: ["en"],
              $type: "text",
              facets: [],
            },
            uri: "at://did:plc:r3bpptdqfsipcnildivvdv5d/app.bsky.feed.post/3ldvsbnl4ik27",
            cid: "bafyreifxaylz6hcvpjoumuk3h46rixj2udeq4crwlidfiacnb25zby67qi",
            reason: "mention",
            indexedAt: "2024-12-22T16:06:15.105Z",
            isRead: false,
          },
        ],
      });
      return res;
    }
  ),
];
let server = setupServer(...handlers);

let isServerRunning = false;

export const startServer = () => {
  if (!isServerRunning) {
    server = setupServer(...handlers);
    server.listen();
    isServerRunning = true;
  }
};

if (import.meta.hot) {
  console.log("HOTT");
  import.meta.hot.accept();
  import.meta.hot.dispose(() => {
    console.log("closing");
    server.close();
    isServerRunning = false;
  });
}
