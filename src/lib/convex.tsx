import { ConvexClient } from "convex/browser";
import { Context, createContext, createSignal, onCleanup, useContext } from "solid-js";
import { isServer } from "solid-js/web";
import type { FunctionArgs, FunctionReturnType, FunctionReference } from "convex/server";

export const ConvexContext: Context<ConvexClient | undefined> = createContext();

type QueryFn = FunctionReference<"query", "public">;
type MutationFn = FunctionReference<"mutation", "public">;

export function createQuery<Q extends QueryFn>(
  query: Q,
  args?: FunctionArgs<Q>,
): () => FunctionReturnType<Q> | undefined {
  if (isServer) return () => undefined;

  const convex = useContext(ConvexContext);
  if (!convex) throw "No convex context";

  const [data, setData] = createSignal<FunctionReturnType<Q> | undefined>(undefined);

  const unsub = convex.onUpdate(query, (args ?? {}) as Record<string, unknown>, (value) => {
    setData(() => value as FunctionReturnType<Q>);
  });

  onCleanup(unsub);

  return () => data();
}

export function createMutation<M extends MutationFn>(mutation: M) {
  const convex = useContext(ConvexContext);
  if (!convex) throw "No convex context";

  return (args?: FunctionArgs<M>) => convex.mutation(mutation, (args ?? {}) as Record<string, unknown>);
}