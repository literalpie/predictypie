"use server";
import { APIEvent } from "@solidjs/start/server";
import { getCookie } from "@solidjs/start/http";
import { redirect } from "@solidjs/router";
import { createPrediction } from "~/server/createPrediction";

export async function POST({ request }: APIEvent) {
  try {
    const did = getCookie("did");
    if (!did) {
      return redirect("/?error=not_logged_in");
    }

    const { text, deadline } = await request.json();

    if (!text || typeof text !== "string" || text.length > 500) {
      return new Response("Prediction text is required (max 500 chars)", { status: 400 });
    }

    // Post to PDS only - mirroring happens via webhook
    await createPrediction(did, text, deadline);

    return redirect("/");
  } catch (error) {
    console.error("Create prediction error:", error);
    return new Response("Failed to create prediction", { status: 500 });
  }
}