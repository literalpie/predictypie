import { ConvexClient } from "convex/browser";
import { Context, createContext, createSignal, onCleanup, useContext } from "solid-js";
import { isServer } from "solid-js/web";

export const ConvexContext: Context<ConvexClient | undefined> = createContext();

export function createQuery<T>(
  query: any,
  args?: {},
  initialData?: T,
): () => T | undefined {
  if (isServer) return () => initialData;

  const convex = useContext(ConvexContext);
  if (!convex) throw "No convex context";

  const [data, setData] = createSignal<T | undefined>(initialData);

  const unsub = convex.onUpdate(query, args ?? {}, (value: T) => {
    setData(() => value);
  });

  onCleanup(unsub);

  return () => data();
}

export function createMutation<T>(mutation: any) {
  const convex = useContext(ConvexContext);
  if (!convex) throw "No convex context";

  return (args: any = {}) => convex.mutation(mutation, args);
}