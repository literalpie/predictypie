import { mergeProps, splitProps, type JSX } from "solid-js";

type SelectProps = JSX.SelectHTMLAttributes<HTMLSelectElement> & {
  size?: "sm" | "md";
};

const base = "border border-zinc-300 bg-white text-zinc-900 disabled:opacity-50 dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-100";

const sizes: Record<string, string> = {
  sm: "px-2 py-1.5 text-sm rounded",
  md: "px-3 py-2 rounded-lg",
};

export function Select(p: SelectProps) {
  const [locals, rest] = splitProps(p, ["size", "class"]);
  const props = mergeProps({ size: "md" as const }, locals);
  const cls = `${base} ${sizes[props.size]} ${props.class ?? ""}`;
  return <select class={cls} {...rest} />;
}
