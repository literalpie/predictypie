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
import { FormField } from "./FormField";
import { Input } from "./Input";
import { Select } from "./Select";

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
        <PopoverTrigger
          render={(props) => <Button {...props} variant="secondary" />}
          class="flex items-center gap-1.5"
        >
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
                <FormField label="Resolved State" for="filter-resolved">
                  <Select
                    id="filter-resolved"
                    value={draftResolved()}
                    onChange={(e) => setDraftResolved(e.target.value)}
                    size="sm"
                    class="w-full"
                  >
                    <option value="all">All</option>
                    <option value="unresolved">Unresolved</option>
                    <option value="correct">Correct</option>
                    <option value="incorrect">Incorrect</option>
                  </Select>
                </FormField>
                <FormField label="Prediction Made By" for="filter-made-by">
                  <Input
                    id="filter-made-by"
                    type="text"
                    value={draftMadeBy()}
                    onInput={(e) => setDraftMadeBy(e.currentTarget.value)}
                    placeholder="@handle"
                    size="sm"
                  />
                </FormField>
                <FormField label="Date Prediction Made" for="filter-date-made">
                  <div class="flex gap-1.5" role="group">
                    <Select
                      aria-label="Date made modifier"
                      value={draftDateMadeMod()}
                      onChange={(e) => setDraftDateMadeMod(e.target.value)}
                      size="sm"
                    >
                      <option value="on">on</option>
                      <option value="before">before</option>
                      <option value="after">after</option>
                    </Select>
                    <Input
                      id="filter-date-made"
                      aria-label="Date made value"
                      type="date"
                      value={draftDateMade()}
                      onInput={(e) => setDraftDateMade(e.currentTarget.value)}
                      size="sm"
                      class="flex-1"
                    />
                  </div>
                </FormField>
                <FormField label="Prediction Deadline" for="filter-deadline">
                  <div class="flex gap-1.5" role="group">
                    <Select
                      aria-label="Deadline modifier"
                      value={draftDeadlineMod()}
                      onChange={(e) => setDraftDeadlineMod(e.target.value)}
                      size="sm"
                    >
                      <option value="on">on</option>
                      <option value="before">before</option>
                      <option value="after">after</option>
                    </Select>
                    <Input
                      id="filter-deadline"
                      aria-label="Deadline value"
                      type="date"
                      value={draftDeadline()}
                      onInput={(e) => setDraftDeadline(e.currentTarget.value)}
                      size="sm"
                      class="flex-1"
                    />
                  </div>
                </FormField>
                <div class="flex justify-end gap-2 pt-1">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPopoverOpen(false)}
                    class="dark:hover:bg-zinc-700"
                  >
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
