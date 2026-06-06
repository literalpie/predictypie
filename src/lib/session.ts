import { query } from "@solidjs/router";
import { getCookie } from "@solidjs/start/http";

export const getSessionDid = query(async () => {
  "use server";
  return getCookie("did") ?? null;
}, "session-did");
