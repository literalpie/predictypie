import { createSignal } from "solid-js";
import { action, redirect, useAction } from "@solidjs/router";
import { getCookie } from "@solidjs/start/http";
import { createPrediction as createPredictionToPds } from "~/server/createPrediction";

const createPredictionAction = action(async (formData: FormData) => {
  "use server";

  const did = getCookie("did");
  if (!did) {
    throw new Error("Not logged in");
  }

  const text = formData.get("text") as string;
  const deadline = formData.get("deadline") as string | null;

  if (!text || text.length > 500) {
    throw new Error("Prediction text is required (max 500 chars)");
  }

  await createPredictionToPds(did, text, deadline || undefined);

  throw redirect("/");
}, "createPrediction");

export default function NewPrediction() {
  const createPrediction = useAction(createPredictionAction);
  const [text, setText] = createSignal("");
  const [deadline, setDeadline] = createSignal("");
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
      await createPrediction(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create prediction");
      setLoading(false);
    }
  }

  return (
    <main class="max-w-2xl mx-auto p-4">
      <h1 class="text-2xl font-bold mb-4">New Prediction</h1>

      <form onSubmit={handleSubmit} class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-zinc-700 mb-1">What do you predict?</label>
          <textarea
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
          <label class="block text-sm font-medium text-zinc-700 mb-1">Deadline (optional)</label>
          <input
            type="datetime-local"
            value={deadline()}
            onInput={(e) => setDeadline(e.target.value)}
            class="w-full px-3 py-2 border border-zinc-300 rounded-lg bg-white text-zinc-900"
            disabled={loading()}
          />
        </div>

        {error() && <p class="text-red-500 text-sm">{error()}</p>}

        <button
          type="submit"
          disabled={loading() || !text()}
          class="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading() ? "Creating..." : "Create Prediction"}
        </button>
      </form>
    </main>
  );
}
