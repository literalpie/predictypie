import { For, Show } from "solid-js";
import { api } from "../../convex/_generated/api";
import { createQuery } from "../lib/convex";

export default function Home() {
  const predictions = createQuery(api.predictions.getPredictions, {});

  return (
    <main class="max-w-2xl mx-auto p-4">
      <header class="flex justify-between items-center mb-4">
        <h1 class="text-2xl font-bold">PredictyPie</h1>
        <nav class="flex gap-4">
          <a href="/oauth/login" class="text-blue-600 hover:underline">
            Sign in
          </a>
          <a href="/new" class="text-blue-600 hover:underline">
            New Prediction
          </a>
        </nav>
      </header>

      <Show when={predictions()} fallback={<p>Loading predictions...</p>}>
        <Show when={predictions()?.length} fallback={
          <p class="text-zinc-500">No predictions yet. Be the first!</p>
        }>
          <ul class="space-y-3">
            <For each={predictions()}>
              {(pred: any) => (
                <li class="border rounded p-3">
                  <p class="text-lg">{pred.text}</p>
                  <div class="text-sm text-zinc-500 mt-2">
                    <span>@{pred.author?.handle ?? pred.authorDid}</span>
                    {pred.deadline && (
                      <span> · Deadline: {new Date(pred.deadline).toLocaleDateString()}</span>
                    )}
                    {pred.resolvedAs && (
                      <span class="ml-2">
                        [{pred.resolvedAs === "correct" ? "✓" : "✗"}]
                      </span>
                    )}
                  </div>
                </li>
              )}
            </For>
          </ul>
        </Show>
      </Show>
    </main>
  );
}