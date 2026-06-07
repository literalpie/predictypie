import { createSignal } from "solid-js";
import Button from "../../components/Button";
import { FormField } from "../../components/FormField";
import { Input } from "../../components/Input";

export default function LoginPage() {
  const [handle, setHandle] = createSignal("");
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/oauth/login-api", {
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
    <main class="max-w-2xl mx-auto p-4">
      <h1 class="text-2xl font-bold mb-4">Sign in</h1>

      <form onSubmit={handleSubmit} class="space-y-4">
        <FormField label="Handle" for="handle" error={error() ?? undefined}>
          <Input
            id="handle"
            type="text"
            value={handle()}
            onInput={(e) => setHandle(e.currentTarget.value)}
            placeholder="user.bsky.social"
            disabled={loading()}
          />
        </FormField>

        <Button type="submit" disabled={loading() || !handle()} class="w-full">
          {loading() ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </main>
  );
}
