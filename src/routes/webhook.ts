import { parseTapEvent, assureAdminAuth } from "@atproto/tap";
import { AtUri } from "@atproto/syntax";
import { api } from "../../convex/_generated/api";
import { convexHttpClient } from "../lib/contextHttpClient";

const TAP_ADMIN_PASSWORD = process.env.TAP_ADMIN_PASSWORD || "admin";

export async function POST({ request }: { request: Request }) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  try {
    assureAdminAuth(TAP_ADMIN_PASSWORD, authHeader);
  } catch {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const body = await request.json();
  const evt = parseTapEvent(body);

  if (evt.type === "record" && evt.collection === "app.predictypie.prediction" && (evt.action === "create" || evt.action === "update")) {
    const uri = AtUri.make(evt.did, evt.collection, evt.rkey);
    const record = evt.record as any;

    await convexHttpClient.mutation(api.predictions.createPrediction, {
      rkey: evt.rkey,
      atUri: uri.toString(),
      authorDid: evt.did,
      text: record.text,
      deadline: record.deadline,
      createdAt: record.createdAt,
    });

    console.log(`Stored prediction: ${uri.toString()}`);
  }

  return new Response(JSON.stringify({ success: true }));
}