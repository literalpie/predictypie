import { For, Show, createResource, createMemo, createSignal } from "solid-js";
import {
  CollapsibleRoot,
  CollapsibleTrigger,
  CollapsiblePanel,
  TooltipRoot,
  TooltipTrigger,
  TooltipPortal,
  TooltipPositioner,
  TooltipPopup,
  PopoverRoot,
  PopoverTrigger,
  PopoverPortal,
  PopoverPositioner,
  PopoverPopup,
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
  const fResolved = () => (searchParams.f_resolved as string | undefined) ?? "all";
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

  const activeFilterCount = createMemo(() => {
    let count = 0;
    if (fResolved() !== "all") count++;
    if (fMadeBy()) count++;
    if (fDateMade()) count++;
    if (fDeadline()) count++;
    return count;
  });

  const [draftResolved, setDraftResolved] = createSignal(fResolved());
  const [draftMadeBy, setDraftMadeBy] = createSignal(fMadeBy());
  const [draftDateMade, setDraftDateMade] = createSignal(fDateMade());
  const [draftDateMadeMod, setDraftDateMadeMod] = createSignal(fDateMadeMod());
  const [draftDeadline, setDraftDeadline] = createSignal(fDeadline());
  const [draftDeadlineMod, setDraftDeadlineMod] = createSignal(fDeadlineMod());

  const resetDrafts = () => {
    setDraftResolved(fResolved());
    setDraftMadeBy(fMadeBy());
    setDraftDateMade(fDateMade());
    setDraftDateMadeMod(fDateMade() ? fDateMadeMod() : "after");
    setDraftDeadline(fDeadline());
    setDraftDeadlineMod(fDeadline() ? fDeadlineMod() : "before");
  };

  const applyFilters = () => {
    setSearchParams({
      f_resolved: draftResolved() === "all" ? undefined : draftResolved(),
      f_madeBy: draftMadeBy() || undefined,
      f_dateMade: draftDateMade() || undefined,
      f_dateMadeMod: draftDateMade() ? draftDateMadeMod() : undefined,
      f_deadline: draftDeadline() || undefined,
      f_deadlineMod: draftDeadline() ? draftDeadlineMod() : undefined,
    });
  };

  const setResolvedFilter = (v: string) => {
    setSearchParams({ f_resolved: v === "all" ? undefined : v });
  };
  const setMadeByFilter = (v: string) => {
    setSearchParams({ f_madeBy: v || undefined });
  };

  const [popoverOpen, setPopoverOpen] = createSignal(false);

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
      <div class="flex gap-2 mb-4 items-center flex-wrap min-h-[36px]">
        <PopoverRoot
          open={popoverOpen()}
          onOpenChange={(open) => {
            setPopoverOpen(open);
            if (open) resetDrafts();
          }}
        >
          <PopoverTrigger class="px-3 py-1 rounded font-medium transition-colors bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm flex items-center gap-1.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              class="w-4 h-4"
            >
              <path
                fill-rule="evenodd"
                d="M2 3.75A.75.75 0 012.75 3h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 3.75zm0 4.167a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75zm0 4.166a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75zm0 4.167a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z"
                clip-rule="evenodd"
              />
            </svg>
            Filters
            <Show when={activeFilterCount() > 0}>
              <span class="bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {activeFilterCount()}
              </span>
            </Show>
          </PopoverTrigger>
          <PopoverPortal>
            <PopoverPositioner sideOffset={4}>
              <PopoverPopup class="bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-700 p-4 w-72 text-sm text-zinc-900 dark:text-zinc-100">
                <div class="space-y-3">
                  <div>
                    <label class="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                      Resolved State
                    </label>
                    <select
                      value={draftResolved()}
                      onChange={(e) => setDraftResolved(e.target.value)}
                      class="w-full px-2 py-1.5 border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm"
                    >
                      <option value="all">All</option>
                      <option value="unresolved">Unresolved</option>
                      <option value="correct">Correct</option>
                      <option value="incorrect">Incorrect</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                      Prediction Made By
                    </label>
                    <input
                      type="text"
                      value={draftMadeBy()}
                      onInput={(e) => setDraftMadeBy(e.target.value)}
                      placeholder="@handle"
                      class="w-full px-2 py-1.5 border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                      Date Prediction Made
                    </label>
                    <div class="flex gap-1.5">
                      <select
                        value={draftDateMadeMod()}
                        onChange={(e) => setDraftDateMadeMod(e.target.value)}
                        class="px-1.5 py-1.5 border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs"
                      >
                        <option value="on">on</option>
                        <option value="before">before</option>
                        <option value="after">after</option>
                      </select>
                      <input
                        type="date"
                        value={draftDateMade()}
                        onInput={(e) => setDraftDateMade(e.target.value)}
                        class="flex-1 px-2 py-1.5 border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                      Prediction Deadline
                    </label>
                    <div class="flex gap-1.5">
                      <select
                        value={draftDeadlineMod()}
                        onChange={(e) => setDraftDeadlineMod(e.target.value)}
                        class="px-1.5 py-1.5 border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs"
                      >
                        <option value="on">on</option>
                        <option value="before">before</option>
                        <option value="after">after</option>
                      </select>
                      <input
                        type="date"
                        value={draftDeadline()}
                        onInput={(e) => setDraftDeadline(e.target.value)}
                        class="flex-1 px-2 py-1.5 border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm"
                      />
                    </div>
                  </div>
                  <div class="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => setPopoverOpen(false)}
                      class="px-3 py-1.5 rounded text-xs font-medium bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        applyFilters();
                        setPopoverOpen(false);
                      }}
                      class="px-3 py-1.5 rounded text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </PopoverPopup>
            </PopoverPositioner>
          </PopoverPortal>
        </PopoverRoot>

        <Show when={fResolved() !== "all"}>
          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
            Resolved: {fResolved()}
            <button
              onClick={() => setResolvedFilter("all")}
              class="hover:text-blue-900 dark:hover:text-blue-100 ml-0.5"
            >
              &times;
            </button>
          </span>
        </Show>
        <Show when={fMadeBy()}>
          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
            Made by: {fMadeBy()}
            <button
              onClick={() => setMadeByFilter("")}
              class="hover:text-blue-900 dark:hover:text-blue-100 ml-0.5"
            >
              &times;
            </button>
          </span>
        </Show>
        <Show when={fDateMade()}>
          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
            Date made: {fDateMadeMod() !== "on" ? fDateMadeMod() + " " : ""}
            {fDateMade()}
            <button
              onClick={() => setSearchParams({ f_dateMade: undefined, f_dateMadeMod: undefined })}
              class="hover:text-blue-900 dark:hover:text-blue-100 ml-0.5"
            >
              &times;
            </button>
          </span>
        </Show>
        <Show when={fDeadline()}>
          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
            Deadline: {fDeadlineMod() !== "on" ? fDeadlineMod() + " " : ""}
            {fDeadline()}
            <button
              onClick={() => setSearchParams({ f_deadline: undefined, f_deadlineMod: undefined })}
              class="hover:text-blue-900 dark:hover:text-blue-100 ml-0.5"
            >
              &times;
            </button>
          </span>
        </Show>
      </div>
      <Show
        when={predictions()}
        fallback={
          <ul class="space-y-3">
            <li class="border border-zinc-200 dark:border-zinc-700 rounded bg-zinc-50 dark:bg-zinc-800/50 animate-pulse h-[72px]" />
            <li class="border border-zinc-200 dark:border-zinc-700 rounded bg-zinc-50 dark:bg-zinc-800/50 animate-pulse h-[72px]" />
            <li class="border border-zinc-200 dark:border-zinc-700 rounded bg-zinc-50 dark:bg-zinc-800/50 animate-pulse h-[72px]" />
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
                                onClick={(e) => { e.stopPropagation(); setMadeByFilter(pred.attribution ?? pred.author?.handle ?? pred.authorDid); }}
                                class="hover:text-blue-700 dark:hover:text-blue-400"
                              >
                                {pred.attribution ?? `@${pred.author?.handle ?? pred.authorDid}`}
                              </button>
                            }
                          >
                            <TooltipRoot>
                              <TooltipTrigger
                                render="span"
                                class="underline decoration-dotted underline-offset-2 cursor-default hover:text-blue-700 dark:hover:text-blue-400"
                                onClick={(e) => { e.stopPropagation(); setMadeByFilter(pred.attribution!.replace(/^@/, "")); }}
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
                        <Show when={pred.madeAt} fallback={<span>{fmtDate(pred.createdAt)}</span>}>
                          <Show
                            when={
                              pred.createdAt &&
                              pred.madeAt!.split("T")[0] !== pred.createdAt.split("T")[0]
                            }
                            fallback={<span>{fmtDate(pred.madeAt!)}</span>}
                          >
                            <TooltipRoot>
                              <TooltipTrigger
                                render="span"
                                class="underline decoration-dotted underline-offset-2"
                              >
                                {fmtDate(pred.madeAt!)}
                              </TooltipTrigger>
                              <TooltipPortal>
                                <TooltipPositioner sideOffset={4}>
                                  <TooltipPopup class="bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 text-xs rounded px-2 py-1 shadow-lg">
                                    Submitted: {fmtDate(pred.createdAt!)}
                                  </TooltipPopup>
                                </TooltipPositioner>
                              </TooltipPortal>
                            </TooltipRoot>
                          </Show>
                        </Show>
                        {pred.deadline && (
                          <span>Deadline: {fmtDate(pred.deadline)}</span>
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
