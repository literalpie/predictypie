import { query } from "@solidjs/router";
import { getCookie } from "./cookies";

export const getSessionDid = query(async () => {
  "use server";
  return getCookie("did");
}, "session-did");
