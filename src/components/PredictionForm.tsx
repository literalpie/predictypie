import { createSignal, Show } from "solid-js";
import { createForm } from "@tanstack/solid-form";
import Button from "./Button";
import { FormField } from "./FormField";
import { Input } from "./Input";

export type PredictionFormValues = {
  text: string;
  deadline: string;
  madeAt: string;
  attribution: string;
  source: string;
};

type Props = {
  defaultValues?: Partial<PredictionFormValues>;
  onSubmit: (values: PredictionFormValues) => Promise<void>;
  submitLabel: string;
  submittingLabel: string;
  attributionPlaceholder?: string;
};

export default function PredictionForm(props: Props) {
  const [submitError, setSubmitError] = createSignal<string | null>(null);
  const today = new Date().toISOString().split("T")[0];

  const form = createForm(() => {
    const builtInDefaults: PredictionFormValues = {
      text: "",
      deadline: "",
      madeAt: today,
      attribution: "",
      source: "https://",
    };

    return {
      defaultValues: {
        ...builtInDefaults,
        ...props.defaultValues,
        source: props.defaultValues?.source || builtInDefaults.source,
      },
    onSubmit: async ({ value }) => {
      setSubmitError(null);
      try {
        await props.onSubmit({
          ...value,
          source: value.source === "https://" ? "" : value.source,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Submission failed";
        setSubmitError(message);
      }
    },
    };
  });

  const isSubmitting = form.useStore((state) => state.isSubmitting);

  return (
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
              placeholder={props.attributionPlaceholder}
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
        {isSubmitting() ? props.submittingLabel : props.submitLabel}
      </Button>
    </form>
  );
}
