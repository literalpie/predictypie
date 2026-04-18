"use server";
import { getCookie } from "@solidjs/start/http";
import { api } from "../../convex/_generated/api";
import { convexHttpClient } from "../lib/contextHttpClient";

export async function getCurrentSession(did?: string): Promise<any> {
  const sessionDid = did ?? getCookie("did");
  if (!sessionDid) return null;

  const result = await convexHttpClient.query(api.auth.getSession, { did: sessionDid });
  return result?.session ?? null;
}