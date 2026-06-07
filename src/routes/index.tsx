import { For, Show, createResource, createMemo } from "solid-js";
import {
  CollapsibleRoot,
  CollapsibleTrigger,
  CollapsiblePanel,
} from "../components/ClientCollapsible";
import { Tooltip } from "../components/Tooltip";
import { FilterBar } from "../components/FilterBar";
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
  const fResolved = () =>
    (searchParams.f_resolved as "all" | "unresolved" | "correct" | "incorrect" | undefined) ??
    "all";
  const fMadeBy = () => (searchParams.f_madeBy as string | undefined) ?? "";
  const fDateMade = () => (searchParams.f_dateMade as string | undefined) ?? "";
  const fDateMadeMod = () => (searchParams.f_dateMadeMod as string | undefined) ?? "on";
  const fDeadline = () => (searchParams.f_deadline as string | undefined) ?? "";
  const fDeadlineMod = () => (searchParams.f_deadlineMod as string | undefined) ?? "on";

  const resolvedFilter = createMemo(() => {
    const r = fResolved();
    if (r === "all") return filter();
    return r;
  });

  const predictions = createQuery(api.predictions.getPredictions, () => ({
    filter: resolvedFilter(),
  }));
  const resolvePrediction = useAction(resolveAction);
  const deletePredictionAction = useAction(deleteAction);
  const [sessionDid] = createResource(() => getSessionDid());

  const isAuthor = (authorDid: string) => sessionDid() === authorDid;

  function fmtDate(dateStr: string): string {
    const [y, m, d] = dateStr.split("T")[0].split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString();
  }

  function compareDate(dateStr: string | undefined, filterDate: string, mod: string): boolean {
    if (!dateStr) return false;
    const d = dateStr.split("T")[0];
    if (mod === "on") return d === filterDate;
    if (mod === "before") return d < filterDate;
    if (mod === "after") return d > filterDate;
    return d === filterDate;
  }

  const filteredPredictions = createMemo(() => {
    const preds = predictions();
    if (!preds) return [];
    const mb = fMadeBy().replace(/^@/, "").toLowerCase();
    const dm = fDateMade();
    const dmMod = fDateMadeMod();
    const dl = fDeadline();
    const dlMod = fDeadlineMod();
    return preds.filter((p) => {
      if (
        mb &&
        !(p.attribution?.toLowerCase().includes(mb) || p.author?.handle?.toLowerCase().includes(mb))
      ) {
        return false;
      }
      if (dm && !compareDate(p.madeAt ?? p.createdAt, dm, dmMod)) return false;
      if (dl && !compareDate(p.deadline, dl, dlMod)) return false;
      return true;
    });
  });

  const setMadeByFilter = (v: string) => {
    setSearchParams({ f_madeBy: v || undefined });
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
      <FilterBar />
      <Show
        when={predictions()}
        fallback={
          <ul class="space-y-3">
            <li class="border border-zinc-200 dark:border-zinc-700 rounded bg-zinc-50 dark:bg-zinc-800/50 animate-pulse h-18" />
            <li class="border border-zinc-200 dark:border-zinc-700 rounded bg-zinc-50 dark:bg-zinc-800/50 animate-pulse h-18" />
            <li class="border border-zinc-200 dark:border-zinc-700 rounded bg-zinc-50 dark:bg-zinc-800/50 animate-pulse h-18" />
            <li class="border border-zinc-200 dark:border-zinc-700 rounded bg-zinc-50 dark:bg-zinc-800/50 animate-pulse h-18 opacity-50" />
            <li class="border border-zinc-200 dark:border-zinc-700 rounded bg-zinc-50 dark:bg-zinc-800/50 animate-pulse h-18 opacity-20" />
          </ul>
        }
      >
        <Show
          when={filteredPredictions().length}
          fallback={
            <p class="text-zinc-500 dark:text-zinc-400">No predictions match your filters.</p>
          }
        >
          <ul class="space-y-3">
            <For each={filteredPredictions()}>
              {(pred) => (
                <li class="border rounded bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
                  <CollapsibleRoot>
                    <CollapsibleTrigger class="flex items-start justify-between p-3 w-full text-left bg-transparent border-none cursor-pointer rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset">
                      <div class="min-w-0 flex-1">
                        <p class="text-lg text-zinc-900 dark:text-zinc-100 pr-3">{pred.text}</p>
                        <div class="text-sm text-zinc-500 dark:text-zinc-400 flex items-center justify-between w-full">
                          <Show
                            when={
                              pred.attribution &&
                              pred.attribution !== `@${pred.author?.handle ?? pred.authorDid}`
                            }
                            fallback={
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMadeByFilter(
                                    pred.attribution ?? pred.author?.handle ?? pred.authorDid,
                                  );
                                }}
                                class="hover:text-blue-700 dark:hover:text-blue-400"
                              >
                                {pred.attribution ?? `@${pred.author?.handle ?? pred.authorDid}`}
                              </button>
                            }
                          >
                            <Tooltip
                              text={pred.attribution!}
                              tooltip={`@${pred.author?.handle ?? pred.authorDid}`}
                              class="underline decoration-dotted underline-offset-2 cursor-default hover:text-blue-700 dark:hover:text-blue-400"
                              onClick={(e) => {
                                e.stopPropagation();
                                setMadeByFilter(pred.attribution!.replace(/^@/, ""));
                              }}
                            />
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
                        <Show when={pred.madeAt} fallback={<span>{fmtDate(pred.createdAt)}</span>}>
                          <Show
                            when={
                              pred.createdAt &&
                              pred.madeAt!.split("T")[0] !== pred.createdAt.split("T")[0]
                            }
                            fallback={<span>{fmtDate(pred.madeAt!)}</span>}
                          >
                            <Tooltip
                              text={fmtDate(pred.madeAt!)}
                              tooltip={`Submitted: ${fmtDate(pred.createdAt!)}`}
                            />
                          </Show>
                        </Show>
                        {pred.deadline && <span>Deadline: {fmtDate(pred.deadline)}</span>}
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
                          <Button
                            variant="danger"
                            class="ml-auto"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this prediction?")) {
                                const fd = new FormData();
                                fd.set("atUri", pred.atUri);
                                deletePredictionAction(fd);
                              }
                            }}
                          >
                            Delete
                          </Button>
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
