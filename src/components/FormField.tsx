import { Show, type JSX } from "solid-js";

type FormFieldProps = {
  label: string;
  for?: string;
  error?: string;
  labelClass?: string;
  children: JSX.Element;
};

export function FormField(props: FormFieldProps) {
  return (
    <div>
      <label
        for={props.for}
        class={
          props.labelClass ?? "block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
        }
      >
        {props.label}
      </label>
      {props.children}
      <Show when={props.error}>
        <p class="text-red-500 dark:text-red-300 text-sm mt-1">{props.error}</p>
      </Show>
    </div>
  );
}
