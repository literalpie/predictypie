import { createSignal } from "solid-js";

export default function NewPrediction() {
  const [text, setText] = createSignal("");
  const [deadline, setDeadline] = createSignal("");
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [loggedIn, setLoggedIn] = createSignal(true);

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text(),
          deadline: deadline() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.error?.includes("logged in")) {
          setLoggedIn(false);
        }
        throw new Error(data.error || "Failed to create prediction");
      }
      window.location.href = "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create prediction");
      setLoading(false);
    }
  }

  return (
    <main class="max-w-2xl mx-auto p-4">
      <h1 class="text-2xl font-bold mb-4">New Prediction</h1>

      {!loggedIn() && (
        <div class="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
          <p class="text-yellow-800 mb-2">You must be logged in to create a prediction.</p>
          <a href="/oauth/login" class="text-blue-600 hover:underline">Sign in first</a>
        </div>
      )}

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