import { For, Show, createMemo } from "solid-js";
import { api } from "../../convex/_generated/api";
import { createQuery } from "../lib/convex";
import { action, redirect, useAction, useSearchParams } from "@solidjs/router";
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

function getCurrentDid(): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(/(?:^|;)did=([^;]+)/);
  return match ? match[1] : undefined;
}

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = () => (searchParams.filter as "all" | "unresolved" | "correct" | "incorrect") ?? "all";
  
  const predictions = createQuery(api.predictions.getPredictions, () => ({ filter: filter() }));
  const resolvePrediction = useAction(resolveAction);
  const currentDid = createMemo(() => getCurrentDid());

  const isAuthor = (authorDid: string) => currentDid() === authorDid;

  const setFilter = (f: string) => {
    setSearchParams({ filter: f });
  };

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

      <div class="flex gap-2 mb-4">
        <button
          onClick={() => setFilter("all")}
          class={`px-3 py-1 rounded ${filter() === "all" ? "bg-blue-600 text-white" : "bg-zinc-200"}`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("unresolved")}
          class={`px-3 py-1 rounded ${filter() === "unresolved" ? "bg-blue-600 text-white" : "bg-zinc-200"}`}
        >
          Unresolved
        </button>
        <button
          onClick={() => setFilter("correct")}
          class={`px-3 py-1 rounded ${filter() === "correct" ? "bg-blue-600 text-white" : "bg-zinc-200"}`}
        >
          Correct
        </button>
        <button
          onClick={() => setFilter("incorrect")}
          class={`px-3 py-1 rounded ${filter() === "incorrect" ? "bg-blue-600 text-white" : "bg-zinc-200"}`}
        >
          Incorrect
        </button>
      </div>

      <Show when={predictions()} fallback={<p>Loading predictions...</p>}>
        <Show
          when={(predictions() ?? []).length}
          fallback={<p class="text-zinc-500">No predictions yet. Be the first!</p>}
        >
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
                      <Show
                        when={isAuthor(pred.authorDid)}
                        fallback={<span class="text-zinc-400 text-xs">Pending resolution</span>}
                      >
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
                      </Show>
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
