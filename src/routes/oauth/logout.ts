"use server";
import { APIEvent } from "@solidjs/start/server";
import { deleteCookie } from "@solidjs/start/http";
import { redirect } from "@solidjs/router";
import { getOAuthClient } from "~/auth/client";

const PUBLIC_URL = process.env.PUBLIC_URL || "http://127.0.0.1:3001";

export async function POST({ nativeEvent }: APIEvent) {
  try {
    const client = await getOAuthClient();
    // Get DID from cookie
    const did = nativeEvent?.cookies.get("did")?.value;
    if (did) {
      await client.revoke(did);
    }
    deleteCookie(nativeEvent!, "did");
  } catch (e) {
    console.error("logout error", e);
  }
  return redirect(`${PUBLIC_URL}/`);
}
