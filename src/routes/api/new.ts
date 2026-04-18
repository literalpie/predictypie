"use server";
import { APIEvent } from "@solidjs/start/server";
import { getCookie } from "@solidjs/start/http";
import { json, redirect } from "@solidjs/router";
import { getOAuthClient } from "~/auth/client";
import { api } from "../../../convex/_generated/api";
import { convexHttpClient } from "../../lib/contextHttpClient";

export async function POST({ request }: APIEvent) {
  try {
    const did = getCookie("did");
    if (!did) {
      return redirect("/?error=not_logged_in");
    }

    const { text, deadline } = await request.json();

    if (!text || typeof text !== "string" || text.length > 500) {
      return json({ error: "Prediction text is required (max 500 chars)" }, { status: 400 });
    }

    // Get session from Convex
    const sessionResult = await convexHttpClient.query(api.auth.getSession, { did });
    const session = sessionResult?.session;
    if (!session) {
      return json({ error: "Session expired. Please log in again." }, { status: 401 });
    }

    // Try to create record on user's PDS
    try {
      const client = await getOAuthClient();
      const as = client.getActorSession(session);

      const rkey = crypto.randomUUID();
      const createdAt = new Date().toISOString();
      const atUri = `at://${did}/app.predictypie.prediction/${rkey}`;

      await as.com.atproto.repo.createRecord({
        repo: did,
        collection: "app.predictypie.prediction",
        rkey,
        record: {
          $type: "app.predictypie.prediction",
          text,
          deadline: deadline || undefined,
          createdAt,
        },
      });

      await convexHttpClient.mutation(api.predictions.createPrediction, {
        rkey,
        atUri,
        authorDid: did,
        text,
        deadline,
        createdAt,
      });
    } catch (pdsError) {
      console.warn("PDS write failed, saving to Convex only:", pdsError);
      // Save to Convex anyway
      const rkey = crypto.randomUUID();
      const createdAt = new Date().toISOString();
      const atUri = `local:${rkey}`;

      await convexHttpClient.mutation(api.predictions.createPrediction, {
        rkey,
        atUri,
        authorDid: did,
        text,
        deadline,
        createdAt,
      });
    }

    return redirect("/");
  } catch (error) {
    console.error("Create prediction error:", error);
    return json(
      { error: error instanceof Error ? error.message : "Failed to create prediction" },
      { status: 500 },
    );
  }
}