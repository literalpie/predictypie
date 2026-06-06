import { For, Show, createResource } from "solid-js";
import {
  CollapsibleRoot,
  CollapsibleTrigger,
  CollapsiblePanel,
  TooltipRoot,
  TooltipTrigger,
  TooltipPortal,
  TooltipPositioner,
  TooltipPopup,
} from "../components/ClientCollapsible";
import { api } from "../../convex/_generated/api";
import { createQuery } from "../lib/convex";
import { action, redirect, useAction, useSearchParams } from "@solidjs/router";
import { getCookie } from "@solidjs/start/http";
import {
  resolvePrediction as resolvePredictionOnPds,
  deletePrediction as deletePredictionOnPds,
} from "~/server/createPrediction";
import { getSessionDid } from "../lib/session";
import Button from "../components/Button";
import { LogoutButton } from "../components/LogoutButton";
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

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = () =>
    (searchParams.filter as "all" | "unresolved" | "correct" | "incorrect") ?? "all";

  const predictions = createQuery(api.predictions.getPredictions, () => ({ filter: filter() }));
  const resolvePrediction = useAction(resolveAction);
  const deletePredictionAction = useAction(deleteAction);
  const [sessionDid] = createResource(() => getSessionDid());

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
          <Show when={sessionDid()}>
            <a href="/new" class="text-blue-600 dark:text-blue-400 hover:underline">
              New Prediction
            </a>
            <LogoutButton />
          </Show>
          <Show when={sessionDid() === null}>
            <a href="/oauth/login" class="text-blue-600 dark:text-blue-400 hover:underline">
              Sign in
            </a>
          </Show>
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
                <li class="border rounded bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
                  <CollapsibleRoot>
                    <CollapsibleTrigger class="flex items-start justify-between p-3 w-full text-left bg-transparent border-none cursor-pointer rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset">
                      <div class="min-w-0 flex-1">
                        <p class="text-lg text-zinc-900 dark:text-zinc-100 truncate pr-3">
                          {pred.text}
                        </p>
                        <div class="text-sm text-zinc-500 dark:text-zinc-400 flex items-center justify-between w-full">
                          <Show
                            when={
                              pred.attribution &&
                              pred.attribution !== `@${pred.author?.handle ?? pred.authorDid}`
                            }
                            fallback={
                              pred.attribution ?? `@${pred.author?.handle ?? pred.authorDid}`
                            }
                          >
                            <TooltipRoot>
                              <TooltipTrigger
                                render="span"
                                class="underline decoration-dotted underline-offset-2"
                              >
                                {pred.attribution}
                              </TooltipTrigger>
                              <TooltipPortal>
                                <TooltipPositioner sideOffset={4}>
                                  <TooltipPopup class="bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 text-xs rounded px-2 py-1 shadow-lg">
                                    @{pred.author?.handle ?? pred.authorDid}
                                  </TooltipPopup>
                                </TooltipPositioner>
                              </TooltipPortal>
                            </TooltipRoot>
                          </Show>
                          {pred.source && (
                            <a
                              href={pred.source}
                              target="_blank"
                              rel="noopener noreferrer"
                              class="text-blue-500 hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Source
                            </a>
                          )}
                        </div>
                      </div>
                      {pred.resolvedAs === "correct" && (
                        <span class="text-green-600 dark:text-green-400 text-xl shrink-0 mt-0.5">
                          ✓
                        </span>
                      )}
                      {pred.resolvedAs === "incorrect" && (
                        <span class="text-red-600 dark:text-red-400 text-xl shrink-0 mt-0.5">
                          ✗
                        </span>
                      )}
                    </CollapsibleTrigger>
                    <CollapsiblePanel class="border-t border-zinc-200 dark:border-zinc-700 p-3 text-sm text-zinc-500 dark:text-zinc-400">
                      <div class="flex justify-between gap-x-6 w-full">
                        <Show when={pred.madeAt}>
                          <Show
                            when={
                              pred.createdAt &&
                              new Date(pred.createdAt).toDateString() !==
                                new Date(pred.madeAt!).toDateString()
                            }
                            fallback={<span>{new Date(pred.madeAt!).toLocaleDateString()}</span>}
                          >
                            <TooltipRoot>
                              <TooltipTrigger
                                render="span"
                                class="underline decoration-dotted underline-offset-2"
                              >
                                {new Date(pred.madeAt!).toLocaleDateString()}
                              </TooltipTrigger>
                              <TooltipPortal>
                                <TooltipPositioner sideOffset={4}>
                                  <TooltipPopup class="bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 text-xs rounded px-2 py-1 shadow-lg">
                                    Submitted: {new Date(pred.createdAt!).toLocaleDateString()}
                                  </TooltipPopup>
                                </TooltipPositioner>
                              </TooltipPortal>
                            </TooltipRoot>
                          </Show>
                        </Show>
                        {pred.deadline && (
                          <span>Deadline: {new Date(pred.deadline).toLocaleDateString()}</span>
                        )}
                      </div>
                      <Show when={!pred.resolvedAs && !isAuthor(pred.authorDid)}>
                        <p class="text-xs text-zinc-400 mt-2">Pending resolution</p>
                      </Show>
                      <Show when={isAuthor(pred.authorDid)}>
                        <div class="flex gap-2 pt-2 items-center -ml-3">
                          <Show when={!pred.resolvedAs}>
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
                          </Show>
                          <button
                            class="text-zinc-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400 text-sm ml-auto"
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
                        </div>
                      </Show>
                    </CollapsiblePanel>
                  </CollapsibleRoot>
                </li>
              )}
            </For>
          </ul>
        </Show>
      </Show>
    </main>
  );
}
