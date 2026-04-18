import { ConvexHttpClient } from "convex/browser";

export const convexHttpClient = new ConvexHttpClient(
  typeof process !== "undefined" && process.env.VITE_CONVEX_URL
    ? process.env.VITE_CONVEX_URL
    : "http://127.0.0.1:3210"
);