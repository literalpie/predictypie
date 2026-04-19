import { For, Show } from "solid-js";
import { api } from "../../convex/_generated/api";
import { createQuery } from "../lib/convex";
import { action, redirect, useAction } from "@solidjs/router";
import { getCookie } from "@solidjs/start/http";
import { resolvePrediction as resolvePredictionOnPds } from "~/server/createPrediction";

const resolveAction = action(async (formData: FormData) => {
  "use server";
  const did = getCookie("did");
  if (!did) throw new Error("Not logged in");

  const atUri = formData.get("atUri") as string;
  const resolvedAs = formData.get("resolvedAs") as "correct" | "incorrect";

  await resolvePredictionOnPds(did, atUri, resolvedAs);
  throw redirect("/");
}, "resolvePrediction");

export default function Home() {
  const predictions = createQuery(api.predictions.getPredictions, {});
  const resolvePrediction = useAction(resolveAction);

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
        <Show when={(predictions() ?? []).length} fallback={
          <p class="text-zinc-500">No predictions yet. Be the first!</p>
        }>
          <ul class="space-y-3">
            <For each={predictions()}>
              {(pred) => (
                <li class="border rounded p-3">
                  <p class="text-lg">{pred.text}</p>
                  <div class="text-sm text-zinc-500 mt-2 flex items-center gap-2">
                    <span>@{pred.author?.handle ?? pred.authorDid}</span>
                    {pred.deadline && (
                      <span> · Deadline: {new Date(pred.deadline).toLocaleDateString()}</span>
                    )}
                    {pred.resolvedAs ? (
                      <span
                        class={pred.resolvedAs === "correct" ? "text-green-600" : "text-red-600"}
                      >
                        [{pred.resolvedAs === "correct" ? "✓ Correct" : "✗ Incorrect"}]
                      </span>
                    ) : (
                      <div class="ml-auto flex gap-2">
                        <button
                          onClick={() => {
                            const fd = new FormData();
                            fd.set("atUri", pred.atUri);
                            fd.set("resolvedAs", "correct");
                            resolvePrediction(fd);
                          }}
                          class="text-green-600 hover:underline text-xs"
                        >
                          Mark Correct
                        </button>
                        <button
                          onClick={() => {
                            const fd = new FormData();
                            fd.set("atUri", pred.atUri);
                            fd.set("resolvedAs", "incorrect");
                            resolvePrediction(fd);
                          }}
                          class="text-red-600 hover:underline text-xs"
                        >
                          Mark Incorrect
                        </button>
                      </div>
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
