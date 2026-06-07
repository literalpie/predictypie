import { Show, createSignal } from "solid-js";
import { useSearchParams } from "@solidjs/router";
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverPortal,
  PopoverPositioner,
  PopoverPopup,
} from "./ClientCollapsible";
import Button from "./Button";

export function FilterBar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const fResolved = () => (searchParams.f_resolved as string | undefined) ?? "all";
  const fMadeBy = () => (searchParams.f_madeBy as string | undefined) ?? "";
  const fDateMade = () => (searchParams.f_dateMade as string | undefined) ?? "";
  const fDateMadeMod = () => (searchParams.f_dateMadeMod as string | undefined) ?? "on";
  const fDeadline = () => (searchParams.f_deadline as string | undefined) ?? "";
  const fDeadlineMod = () => (searchParams.f_deadlineMod as string | undefined) ?? "on";

  const activeFilterCount = () => {
    let count = 0;
    if (fResolved() !== "all") count++;
    if (fMadeBy()) count++;
    if (fDateMade()) count++;
    if (fDeadline()) count++;
    return count;
  };

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
    <div class="flex gap-2 mb-4 items-center flex-wrap min-h-9">
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
                  <Button variant="secondary" size="sm" onClick={() => setPopoverOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      applyFilters();
                      setPopoverOpen(false);
                    }}
                  >
                    Apply
                  </Button>
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
  );
}
