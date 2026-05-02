import { For, Show, createResource } from "solid-js";
import { api } from "../../convex/_generated/api";
import { createQuery } from "../lib/convex";
import { action, redirect, useAction, useSearchParams, query } from "@solidjs/router";
import { getCookie } from "@solidjs/start/http";
import { resolvePrediction as resolvePredictionOnPds, deletePrediction as deletePredictionOnPds } from "~/server/createPrediction";
import Button from "../components/Button";
import ThemeToggle from "../components/ThemeToggle";

const resolveAction = action(async (formData: FormData) => {
  "use server";
  const did = getCookie("did");
  if (!did) throw new Error("Not logged in");

  const atUri = formData.get("atUri") as string;
  const resolvedAs = formData.get("resolvedAs") as "correct" | "incorrect";

  await resolvePredictionOnPds(did, atUri, resolvedAs);
  return redirect("/");
}, "resolvePrediction");

const deleteAction = action(async (formData: FormData) => {
  "use server";
  const did = getCookie("did");
  if (!did) throw new Error("Not logged in");

  const atUri = formData.get("atUri") as string;
  await deletePredictionOnPds(did, atUri);
  return redirect("/");
}, "deletePrediction");

const getSessionDid = query(async () => {
  "use server";
  return getCookie("did") ?? null;
}, "session-did");

async function loadSessionDid() {
  return getSessionDid();
}

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = () =>
    (searchParams.filter as "all" | "unresolved" | "correct" | "incorrect") ?? "all";

  const predictions = createQuery(api.predictions.getPredictions, () => ({ filter: filter() }));
  const resolvePrediction = useAction(resolveAction);
  const deletePredictionAction = useAction(deleteAction);
  const [sessionDid] = createResource(loadSessionDid);

  const isAuthor = (authorDid: string) => sessionDid() === authorDid;

  const setFilter = (f: string) => {
    setSearchParams({ filter: f });
  };

  return (
    <main class="max-w-2xl mx-auto p-4 min-h-screen">
      <header class="flex justify-between items-center mb-4">
        <h1 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100">PredictyPie</h1>
        <nav class="flex gap-4 items-center">
          <ThemeToggle />
          <a href="/oauth/login" class="text-blue-600 dark:text-blue-400 hover:underline">
            Sign in
          </a>
          <a href="/new" class="text-blue-600 dark:text-blue-400 hover:underline">
            New Prediction
          </a>
        </nav>
      </header>

      <div class="flex gap-2 mb-4">
        <Button variant="secondary" active={filter() === "all"} onClick={() => setFilter("all")}>
          All
        </Button>
        <Button
          variant="secondary"
          active={filter() === "unresolved"}
          onClick={() => setFilter("unresolved")}
        >
          Unresolved
        </Button>
        <Button
          variant="secondary"
          active={filter() === "correct"}
          onClick={() => setFilter("correct")}
        >
          Correct
        </Button>
        <Button
          variant="secondary"
          active={filter() === "incorrect"}
          onClick={() => setFilter("incorrect")}
        >
          Incorrect
        </Button>
      </div>

      <Show
        when={predictions()}
        fallback={<p class="text-zinc-500 dark:text-zinc-400">Loading predictions...</p>}
      >
        <Show
          when={(predictions() ?? []).length}
          fallback={
            <p class="text-zinc-500 dark:text-zinc-400">No predictions yet. Be the first!</p>
          }
        >
          <ul class="space-y-3">
            <For each={predictions()}>
              {(pred) => (
                <li class="border rounded p-3 bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
                  <p class="text-lg text-zinc-900 dark:text-zinc-100">{pred.text}</p>
                  <div class="text-sm mt-2 flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                    <span>@{pred.author?.handle ?? pred.authorDid}</span>
                    {pred.deadline && (
                      <span> · Deadline: {new Date(pred.deadline).toLocaleDateString()}</span>
                    )}
                    {pred.resolvedAs ? (
                      <span
                        class={
                          pred.resolvedAs === "correct"
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }
                      >
                        [{pred.resolvedAs === "correct" ? "✓ Correct" : "✗ Incorrect"}]
                      </span>
                    ) : (
                      <Show
                        when={isAuthor(pred.authorDid)}
                        fallback={<span class="text-xs text-zinc-400">Pending resolution</span>}
                      >
                        <div class="ml-auto flex gap-2">
                          <Button
                            variant="success"
                            onClick={() => {
                              const fd = new FormData();
                              fd.set("atUri", pred.atUri);
                              fd.set("resolvedAs", "correct");
                              resolvePrediction(fd);
                            }}
                          >
                            Mark Correct
                          </Button>
                          <Button
                            variant="error"
                            onClick={() => {
                              const fd = new FormData();
                              fd.set("atUri", pred.atUri);
                              fd.set("resolvedAs", "incorrect");
                              resolvePrediction(fd);
                            }}
                          >
                            Mark Incorrect
                          </Button>
                        </div>
                      </Show>
                    )}

                    <Show when={isAuthor(pred.authorDid)}>
                      <button
                        class="ml-2 text-zinc-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400 text-sm"
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this prediction?")) {
                            const fd = new FormData();
                            fd.set("atUri", pred.atUri);
                            deletePredictionAction(fd);
                          }
                        }}
                      >
                        Delete
                      </button>
                    </Show>
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
