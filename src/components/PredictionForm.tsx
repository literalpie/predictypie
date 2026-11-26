import { createSignal, Show } from "solid-js";
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

type FieldName = keyof PredictionFormValues;
type FieldErrors = Partial<Record<FieldName, string>>;

type Props = {
  defaultValues?: Partial<PredictionFormValues>;
  onSubmit: (values: PredictionFormValues) => Promise<void>;
  submitLabel: string;
  submittingLabel: string;
  attributionPlaceholder?: string;
};

function validateField(name: FieldName, value: string): string | undefined {
  if (name === "text") {
    if (!value) return "Prediction text is required";
    if (value.length > 500) return "Max 500 characters";
  }

  if (name === "source" && value && value !== "https://" && !/^https?:\/\/./.test(value)) {
    return "Must be a valid http or https URL";
  }

  return undefined;
}

export default function PredictionForm(props: Props) {
  const [submitError, setSubmitError] = createSignal<string | null>(null);
  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const [errors, setErrors] = createSignal<FieldErrors>({});

  const [values, setValues] = createSignal<PredictionFormValues>(() => {
    const today = new Date().toISOString().split("T")[0];
    const defaults = props.defaultValues;
    return {
      text: defaults?.text ?? "",
      deadline: defaults?.deadline ?? "",
      madeAt: defaults?.madeAt ?? today,
      attribution: defaults?.attribution ?? "",
      source: defaults?.source || "https://",
    };
  });

  const setField = (name: FieldName, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => {
      const next = { ...current };
      const message = validateField(name, value);
      if (message) next[name] = message;
      else delete next[name];
      return next;
    });
  };

  const submit = async (event: SubmitEvent) => {
    event.preventDefault();

    const current = values();
    const nextErrors: FieldErrors = {};
    for (const name of Object.keys(current) as FieldName[]) {
      const message = validateField(name, current[name]);
      if (message) nextErrors[name] = message;
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await props.onSubmit({
        ...current,
        source: current.source === "https://" ? "" : current.source,
      });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} class="space-y-4">
      <FormField label="What do you predict?" for="text" error={errors().text}>
        <textarea
          id="text"
          value={values().text}
          onInput={(event) => setField("text", event.currentTarget.value)}
          placeholder="I predict that..."
          maxlength={500}
          disabled={isSubmitting()}
          class="w-full border border-zinc-300 bg-white text-zinc-900 disabled:opacity-50 px-3 py-2 rounded-lg h-32 dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-100"
        />
        <p class="text-sm text-zinc-500 text-right">{values().text.length}/500</p>
      </FormField>

      <FormField label="Deadline" for="deadline" error={errors().deadline}>
        <Input
          id="deadline"
          type="date"
          value={values().deadline}
          onInput={(event) => setField("deadline", event.currentTarget.value)}
          disabled={isSubmitting()}
        />
      </FormField>

      <FormField label="When was it made?" for="madeAt" error={errors().madeAt}>
        <Input
          id="madeAt"
          type="date"
          value={values().madeAt}
          onInput={(event) => setField("madeAt", event.currentTarget.value)}
          disabled={isSubmitting()}
        />
      </FormField>

      <FormField label="Who made it?" for="attribution" error={errors().attribution}>
        <Input
          id="attribution"
          type="text"
          value={values().attribution}
          onInput={(event) => setField("attribution", event.currentTarget.value)}
          placeholder={props.attributionPlaceholder}
          disabled={isSubmitting()}
        />
      </FormField>

      <FormField label="Source URL" for="source" error={errors().source}>
        <Input
          id="source"
          type="text"
          value={values().source}
          onInput={(event) => setField("source", event.currentTarget.value)}
          placeholder="https://example.com/proof"
          disabled={isSubmitting()}
        />
      </FormField>

      <Show when={submitError()}>
        <p class="text-red-500 text-sm">{submitError()}</p>
      </Show>

      <Button type="submit" disabled={isSubmitting()} class="w-full">
        {isSubmitting() ? props.submittingLabel : props.submitLabel}
      </Button>
    </form>
  );
}
