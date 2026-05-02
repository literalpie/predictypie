import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getPredictions = query({
  args: {
    limit: v.optional(v.number()),
    filter: v.optional(v.union(v.literal("all"), v.literal("unresolved"), v.literal("correct"), v.literal("incorrect"))),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    const filter = args.filter ?? "all";

    let predictions = await ctx.db
      .query("predictions")
      .withIndex("by_created_at")
      .order("desc")
      .take(limit);

    if (filter !== "all") {
      predictions = predictions.filter((p) => {
        if (filter === "unresolved") return p.resolvedAs === undefined;
        if (filter === "correct") return p.resolvedAs === "correct";
        if (filter === "incorrect") return p.resolvedAs === "incorrect";
        return true;
      });
    }

    const predictionsWithAuthors = await Promise.all(
      predictions.map(async (pred) => {
        const user = await ctx.db
          .query("users")
          .withIndex("by_did", (q) => q.eq("did", pred.authorDid))
          .unique();
        return { ...pred, author: user };
      }),
    );

    return predictionsWithAuthors;
  },
});

export const getPrediction = query({
  args: { rkey: v.string() },
  handler: async (ctx, args) => {
    const prediction = await ctx.db
      .query("predictions")
      .withIndex("by_rkey", (q) => q.eq("rkey", args.rkey))
      .unique();

    if (!prediction) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_did", (q) => q.eq("did", prediction.authorDid))
      .unique();

    return { ...prediction, author: user };
  },
});

export const createPrediction = mutation({
  args: {
    rkey: v.string(),
    atUri: v.string(),
    authorDid: v.string(),
    text: v.string(),
    deadline: v.optional(v.string()),
    createdAt: v.string(),
    resolvedAs: v.optional(v.union(v.literal("correct"), v.literal("incorrect"))),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("predictions")
      .withIndex("by_rkey", (q) => q.eq("rkey", args.rkey))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, args);
    } else {
      await ctx.db.insert("predictions", args);
    }
  },
});

export const upsertUser = mutation({
  args: { did: v.string(), handle: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_did", (q) => q.eq("did", args.did))
      .unique();

    if (!existing) {
      await ctx.db.insert("users", { did: args.did, handle: args.handle || args.did });
    } else if (args.handle && existing.handle !== args.handle) {
      await ctx.db.patch(existing._id, { handle: args.handle });
    }
  },
});

export const resolvePrediction = mutation({
  args: {
    rkey: v.string(),
    resolvedAs: v.union(v.literal("correct"), v.literal("incorrect")),
  },
  handler: async (ctx, args) => {
    const prediction = await ctx.db
      .query("predictions")
      .withIndex("by_rkey", (q) => q.eq("rkey", args.rkey))
      .unique();

    if (prediction) {
      await ctx.db.patch(prediction._id, { resolvedAs: args.resolvedAs });
    }
  },
});
