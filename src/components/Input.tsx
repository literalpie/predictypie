import { mergeProps, splitProps, type JSX } from "solid-js";
import { cn } from "../lib/cn";

type InputProps = JSX.InputHTMLAttributes<HTMLInputElement> & {
  size?: "sm" | "md";
};

const base = "w-full border border-zinc-300 bg-white text-zinc-900 disabled:opacity-50 dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-100";

const sizes: Record<string, string> = {
  sm: "px-2 py-1.5 text-sm rounded",
  md: "px-3 py-2 rounded-lg",
};

export function Input(p: InputProps) {
  const [locals, rest] = splitProps(p, ["size", "class"]);
  const props = mergeProps({ size: "md" as const }, locals);
  const cls = cn(base, sizes[props.size], props.class);
  return <input class={cls} {...rest} />;
}
