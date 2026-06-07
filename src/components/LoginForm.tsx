import { createSignal } from "solid-js";
import Button from "./Button";

export function LoginForm() {
  const [handle, setHandle] = createSignal("");
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/oauth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: handle() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }
      window.location.href = data.redirectUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-zinc-700 mb-1">Handle</label>
        <input
          type="text"
          value={handle()}
          onInput={(e) => setHandle(e.target.value)}
          placeholder="user.bsky.social"
          class="w-full px-3 py-2 border border-zinc-300 rounded-lg bg-white text-zinc-900"
          disabled={loading()}
        />
      </div>
      {error() && <p class="text-red-500 text-sm">{error()}</p>}

      <Button
        type="submit"
        disabled={loading() || !handle()}
        class="w-full"
      >
        {loading() ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
