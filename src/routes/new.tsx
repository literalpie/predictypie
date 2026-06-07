import { createSignal, createResource, Show } from "solid-js";
import { action, useAction, useNavigate } from "@solidjs/router";
import { getCookie } from "@solidjs/start/http";
import { api } from "../../convex/_generated/api";
import { createQuery } from "../lib/convex";
import { createPrediction as createPredictionToPds } from "~/server/createPrediction";
import { getSessionDid } from "~/lib/session";
import { createForm } from "@tanstack/solid-form";
import Button from "~/components/Button";
import { FormField } from "../components/FormField";
import { Input } from "../components/Input";

type PredictionInput = {
  text: string;
  deadline: string;
  madeAt: string;
  attribution: string;
  source: string;
};

const createPredictionAction = action(async (input: PredictionInput) => {
  "use server";

  const did = getCookie("did");
  if (!did) {
    throw new Error("Not logged in");
  }

  const { text, deadline, madeAt, attribution, source } = input;

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
}, "createPrediction");

export default function NewPrediction() {
  const createPrediction = useAction(createPredictionAction);
  const navigate = useNavigate();
  const [sessionDid] = createResource(() => getSessionDid());
  const user = createQuery(api.auth.getUser, () => ({ did: sessionDid() ?? "" }));
  const today = new Date().toISOString().split("T")[0];
  const [submitError, setSubmitError] = createSignal<string | null>(null);

  const attributionPlaceholder = () => {
    const u = user();
    if (u) return `@${u.handle}`;
    const did = sessionDid();
    if (did) return did;
    return "";
  };

  const form = createForm(() => ({
    defaultValues: {
      text: "",
      deadline: "",
      madeAt: today,
      attribution: "",
      source: "https://",
    } as PredictionInput,
    onSubmit: async ({ value }) => {
      setSubmitError(null);
      try {
        await createPrediction({
          ...value,
          source: value.source === "https://" ? "" : value.source,
        });
        navigate("/");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to create prediction";
        setSubmitError(message);
      }
    },
  }));

  const isSubmitting = form.useStore((state) => state.isSubmitting);

  return (
    <main class="max-w-2xl mx-auto p-4">
      <Show
        when={sessionDid()}
        fallback={
          <p>
            You must{" "}
            <Button variant="link" href="/oauth/login">sign in</Button>{" "}
            to create a prediction.
          </p>
        }
      >
        <h1 class="text-2xl font-bold mb-4">New Prediction</h1>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          class="space-y-4"
        >
          <form.Field
            name="text"
            validators={{
              onChange: ({ value }) => {
                if (!value) return "Prediction text is required";
                if (value.length > 500) return "Max 500 characters";
                return undefined;
              },
            }}
          >
            {(field) => (
              <FormField
                label="What do you predict?"
                for="text"
                error={field().state.meta.errors?.[0]}
              >
                <textarea
                  id="text"
                  value={field().state.value}
                  onInput={(e) => field().handleChange(e.target.value)}
                  placeholder="I predict that..."
                  maxLength={500}
                  disabled={isSubmitting()}
                  class="w-full border border-zinc-300 bg-white text-zinc-900 disabled:opacity-50 px-3 py-2 rounded-lg h-32 dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-100"
                />
                <p class="text-sm text-zinc-500 text-right">{field().state.value.length}/500</p>
              </FormField>
            )}
          </form.Field>

          <form.Field name="deadline">
            {(field) => (
              <FormField label="Deadline (optional)" for="deadline">
                <Input
                  id="deadline"
                  type="date"
                  value={field().state.value}
                  onInput={(e) => field().handleChange(e.currentTarget.value)}
                  disabled={isSubmitting()}
                />
              </FormField>
            )}
          </form.Field>

          <form.Field name="madeAt">
            {(field) => (
              <FormField label="When was it made?" for="madeAt">
                <Input
                  id="madeAt"
                  type="date"
                  value={field().state.value}
                  onInput={(e) => field().handleChange(e.currentTarget.value)}
                  disabled={isSubmitting()}
                />
              </FormField>
            )}
          </form.Field>

          <form.Field name="attribution">
            {(field) => (
              <FormField label="Who made it?" for="attribution">
                <Input
                  id="attribution"
                  type="text"
                  value={field().state.value}
                  onInput={(e) => field().handleChange(e.currentTarget.value)}
                  placeholder={attributionPlaceholder()}
                  disabled={isSubmitting()}
                />
              </FormField>
            )}
          </form.Field>

          <form.Field
            name="source"
            validators={{
              onChange: ({ value }) => {
                if (!value || value === "https://") return undefined;
                if (!/^https?:\/\/./.test(value)) return "Must be a valid http or https URL";
                return undefined;
              },
            }}
          >
            {(field) => (
              <FormField
                label="Source URL (optional)"
                for="source"
                error={field().state.meta.errors?.[0]}
              >
                <Input
                  id="source"
                  type="text"
                  value={field().state.value}
                  onInput={(e) => field().handleChange(e.currentTarget.value)}
                  placeholder="https://example.com/proof"
                  disabled={isSubmitting()}
                />
              </FormField>
            )}
          </form.Field>

          <Show when={submitError()}>
            <p class="text-red-500 text-sm">{submitError()}</p>
          </Show>

          <Button type="submit" disabled={isSubmitting()} class="w-full">
            {isSubmitting() ? "Creating..." : "Create Prediction"}
          </Button>
        </form>
      </Show>
    </main>
  );
}
