import { parseTapEvent, assureAdminAuth } from "@atproto/tap";
import { AtUri } from "@atproto/syntax";
import { api } from "../../convex/_generated/api";
import { convexHttpClient } from "../lib/contextHttpClient";

const TAP_ADMIN_PASSWORD = process.env.TAP_ADMIN_PASSWORD || "admin";

async function resolveHandle(did: string): Promise<string | null> {
  try {
    const resp = await fetch(`https://plc.directory/${did}`);
    if (!resp.ok) return null;
    const data = await resp.json();
    if (data.alsoKnownAs && data.alsoKnownAs.length > 0) {
      const atUri = data.alsoKnownAs[0];
      return atUri.replace("at://", "");
    }
    return null;
  } catch {
    return null;
  }
}

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

  if (evt.type === "record" && evt.collection === "app.predictypie.prediction") {
    const uri = AtUri.make(evt.did, evt.collection, evt.rkey);
    const record = evt.record as any;

    if (evt.action === "create" || evt.action === "update") {
      const handle = await resolveHandle(evt.did);
      await convexHttpClient.mutation(api.predictions.createPrediction, {
        rkey: evt.rkey,
        atUri: uri.toString(),
        authorDid: evt.did,
        text: record.text,
        deadline: record.deadline,
        createdAt: record.createdAt,
        resolvedAs: record.resolvedAs,
      });
      if (handle) {
        await convexHttpClient.mutation(api.predictions.upsertUser, { did: evt.did, handle });
      }

      console.log(`Stored prediction: ${uri.toString()}`);
    }
  }

  return new Response(JSON.stringify({ success: true }));
}
