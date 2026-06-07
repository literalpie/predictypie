import { createSignal, createResource, Show } from "solid-js";
import { action, redirect, useAction } from "@solidjs/router";
import { getCookie } from "@solidjs/start/http";
import { api } from "../../convex/_generated/api";
import { createQuery } from "../lib/convex";
import { createPrediction as createPredictionToPds } from "~/server/createPrediction";
import { getSessionDid } from "~/lib/session";
import Button from "../components/Button";

const createPredictionAction = action(async (formData: FormData) => {
  "use server";

  const did = getCookie("did");
  if (!did) {
    throw new Error("Not logged in");
  }

  const text = formData.get("text") as string;
  const deadline = formData.get("deadline") as string | null;
  const madeAt = formData.get("madeAt") as string | null;
  const attribution = formData.get("attribution") as string | null;
  const source = formData.get("source") as string | null;

  if (!text || text.length > 500) {
    throw new Error("Prediction text is required (max 500 chars)");
  }

  await createPredictionToPds(
    did,
    text,
    deadline || undefined,
    madeAt || undefined,
    attribution || undefined,
    source || undefined,
  );

  return redirect("/");
}, "createPrediction");

export default function NewPrediction() {
  const createPrediction = useAction(createPredictionAction);
  const [sessionDid] = createResource(() => getSessionDid());
  const user = createQuery(api.auth.getUser, () => ({ did: sessionDid() ?? "" }));
  const attributionPlaceholder = () => {
    const u = user();
    if (u) return `@${u.handle}`;
    const did = sessionDid();
    if (did) return did;
    return "";
  };
  const [text, setText] = createSignal("");
  const [deadline, setDeadline] = createSignal("");
  const today = new Date().toISOString().split("T")[0];
  const [madeAt, setMadeAt] = createSignal(today);
  const [attribution, setAttribution] = createSignal("");
  const [source, setSource] = createSignal("");
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.set("text", text());
      if (deadline()) {
        formData.set("deadline", deadline());
      }
      formData.set("madeAt", madeAt());
      if (attribution()) {
        formData.set("attribution", attribution());
      }
      if (source()) {
        formData.set("source", source());
      }
      await createPrediction(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create prediction");
      setLoading(false);
    }
  }

  return (
    <main class="max-w-2xl mx-auto p-4">
      <Show
        when={sessionDid()}
        fallback={
          <p>
            You must{" "}
            <a href="/oauth/login" class="text-blue-600 dark:text-blue-400 hover:underline">
              sign in
            </a>{" "}
            to create a prediction.
          </p>
        }
      >
        <h1 class="text-2xl font-bold mb-4">New Prediction</h1>

        <form onSubmit={handleSubmit} class="space-y-4">
          <div>
            <label for="text" class="block text-sm font-medium text-zinc-700 mb-1">
              What do you predict?
            </label>
            <textarea
              id="text"
              value={text()}
              onInput={(e) => setText(e.target.value)}
              placeholder="I predict that..."
              maxLength={500}
              class="w-full px-3 py-2 border border-zinc-300 rounded-lg bg-white text-zinc-900 h-32"
              disabled={loading()}
            />
            <p class="text-sm text-zinc-500 text-right">{text().length}/500</p>
          </div>

          <div>
            <label for="deadline" class="block text-sm font-medium text-zinc-700 mb-1">
              Deadline (optional)
            </label>
            <input
              id="deadline"
              type="date"
              value={deadline()}
              onInput={(e) => setDeadline(e.target.value)}
              class="w-full px-3 py-2 border border-zinc-300 rounded-lg bg-white text-zinc-900"
              disabled={loading()}
            />
          </div>

          <div>
            <label for="madeAt" class="block text-sm font-medium text-zinc-700 mb-1">
              When was it made?
            </label>
            <input
              id="madeAt"
              type="date"
              value={madeAt()}
              onInput={(e) => setMadeAt(e.target.value)}
              class="w-full px-3 py-2 border border-zinc-300 rounded-lg bg-white text-zinc-900"
              disabled={loading()}
            />
          </div>

          <div>
            <label for="attribution" class="block text-sm font-medium text-zinc-700 mb-1">
              Who made it?
            </label>
            <input
              id="attribution"
              type="text"
              value={attribution()}
              onInput={(e) => setAttribution(e.target.value)}
              placeholder={attributionPlaceholder()}
              class="w-full px-3 py-2 border border-zinc-300 rounded-lg bg-white text-zinc-900"
              disabled={loading()}
            />
          </div>

          <div>
            <label for="source" class="block text-sm font-medium text-zinc-700 mb-1">
              Source URL (optional)
            </label>
            <input
              id="source"
              type="url"
              value={source()}
              onInput={(e) => setSource(e.target.value)}
              placeholder="https://example.com/proof"
              class="w-full px-3 py-2 border border-zinc-300 rounded-lg bg-white text-zinc-900"
              disabled={loading()}
            />
          </div>

          {error() && <p class="text-red-500 text-sm">{error()}</p>}

          <Button type="submit" disabled={loading() || !text()} class="w-full">
            {loading() ? "Creating..." : "Create Prediction"}
          </Button>
        </form>
      </Show>
    </main>
  );
}
