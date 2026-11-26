import type { APIHandler } from "filesystem-routing/api";
import { redirect } from "@solidjs/web";
import { getCookie, withoutCookie } from "~/lib/cookies";
import { getOAuthClient } from "~/auth/client";
import { getPublicUrl } from "~/lib/getPublicUrl";

const PUBLIC_URL = getPublicUrl();

export const POST: APIHandler = async () => {
  try {
    const client = await getOAuthClient();
    const did = getCookie("did");
    if (did) {
      await client.revoke(did);
    }
  } catch (e) {
    console.error("logout error", e);
  }
  return withoutCookie(redirect(`${PUBLIC_URL}/`), "did");
};
