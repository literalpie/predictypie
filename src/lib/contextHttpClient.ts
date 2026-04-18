import { ConvexHttpClient } from "convex/browser";

export const convexHttpClient = new ConvexHttpClient(
  import.meta.env.VITE_CONVEX_URL || "http://127.0.0.1:3210",
);