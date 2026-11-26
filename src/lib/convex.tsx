import { ConvexClient } from "convex/browser";
import { Context, createContext, createSignal, useContext, createEffect } from "solid-js";
import { isServer } from "@solidjs/web";
import type { FunctionArgs, FunctionReturnType, FunctionReference } from "convex/server";

export const ConvexContext: Context<ConvexClient | null> = createContext<ConvexClient | null>(null);

type QueryFn = FunctionReference<"query", "public">;
type MutationFn = FunctionReference<"mutation", "public">;

export function createQuery<Q extends QueryFn>(
  query: Q,
  args?: FunctionArgs<Q> | (() => FunctionArgs<Q>),
): () => FunctionReturnType<Q> | undefined {
  const [data, setData] = createSignal<FunctionReturnType<Q> | undefined>(undefined);
  const convex = useContext(ConvexContext);

  const getArgs: () => Record<string, unknown> =
    typeof args === "function" ? args : () => args ?? {};

  createEffect(
    () => getArgs(),
    (currentArgs) => {
      if (isServer || !convex) return;

      setData(undefined);
      const unsub = convex.onUpdate(query, currentArgs as Record<string, unknown>, (value) => {
        setData(() => value as FunctionReturnType<Q>);
      });

      return unsub;
    },
  );

  return () => data();
}

export function createMutation<M extends MutationFn>(mutation: M) {
  const convex = useContext(ConvexContext);
  if (!convex) throw "No convex context";

  return (args?: FunctionArgs<M>) =>
    convex.mutation(mutation, (args ?? {}) as Record<string, unknown>);
}
