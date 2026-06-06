import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getSession = query({
  args: { did: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sessions")
      .withIndex("by_did", (q) => q.eq("did", args.did))
      .unique();
  },
});

export const setSession = mutation({
  args: { did: v.string(), session: v.any() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("sessions")
      .withIndex("by_did", (q) => q.eq("did", args.did))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { session: args.session });
    } else {
      await ctx.db.insert("sessions", { did: args.did, session: args.session });
    }
  },
});

export const delSession = mutation({
  args: { did: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("sessions")
      .withIndex("by_did", (q) => q.eq("did", args.did))
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

export const setState = mutation({
  args: { key: v.string(), state: v.any() },
  handler: async (ctx, args) => {
    await ctx.db.insert("authStates", { key: args.key, state: args.state });
  },
});

export const getUser = query({
  args: { did: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_did", (q) => q.eq("did", args.did))
      .unique();
  },
});

export const getState = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("authStates")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();
  },
});

export const delState = mutation({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("authStates")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});
