import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    did: v.string(),
    handle: v.string(),
  }).index("by_did", ["did"]),

  predictions: defineTable({
    rkey: v.string(),
    atUri: v.string(),
    authorDid: v.string(),
    text: v.string(),
    deadline: v.optional(v.string()),
    createdAt: v.string(),
    resolvedAs: v.optional(v.union(v.literal("correct"), v.literal("incorrect"))),
    madeAt: v.optional(v.string()),
    attribution: v.optional(v.string()),
    source: v.optional(v.string()),
  })
    .index("by_rkey", ["rkey"])
    .index("by_author_recent", ["authorDid", "createdAt"])
    .index("by_created_at", ["createdAt"]),

  authStates: defineTable({
    key: v.string(),
    state: v.any(),
  }).index("by_key", ["key"]),

  sessions: defineTable({
    did: v.string(),
    session: v.any(),
  }).index("by_did", ["did"]),
});
