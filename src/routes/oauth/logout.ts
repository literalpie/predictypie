"use server";
import { APIEvent } from "@solidjs/start/server";
import { deleteCookie, getCookie } from "@solidjs/start/http";
import { redirect } from "@solidjs/router";
import { getOAuthClient } from "~/auth/client";
import { getPublicUrl } from "~/lib/getPublicUrl";

const PUBLIC_URL = getPublicUrl();

export async function POST({ nativeEvent }: APIEvent) {
  try {
    const client = await getOAuthClient();
    // Get DID from cookie
    const did = getCookie("did");
    if (did) {
      await client.revoke(did);
    }
    deleteCookie(nativeEvent!, "did");
  } catch (e) {
    console.error("logout error", e);
  }
  return redirect(`${PUBLIC_URL}/`);
}
