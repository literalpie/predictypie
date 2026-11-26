import { createMemo, omit, Show, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { cn } from "../lib/cn";

type ButtonProps = {
  variant?: "primary" | "secondary" | "link" | "success";
  size?: "sm";
  href?: string;
  inLayer?: boolean;
} & JSX.ButtonHTMLAttributes<HTMLButtonElement> &
  JSX.AnchorHTMLAttributes<HTMLAnchorElement>;

const Button: Component<ButtonProps> = (props) => {
  const rest = omit(props, "variant", "size", "class", "children", "href", "inLayer");

  const base = "font-medium transition-colors disabled:opacity-50 cursor-pointer";

  const sizes: Record<string, string> = {
    default: "text-sm px-3 py-1.5 rounded",
    sm: "text-xs px-3 py-1.5 rounded",
  };

  const variants: Record<string, string> = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary:
      "bg-transparent hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100",
    link: "text-blue-600 dark:text-blue-400 hover:underline",
    success: "text-green-600 dark:text-green-400 hover:underline",
  };

  const className = createMemo(() => {
    const variant = props.variant ?? "primary";
    const size = props.size ?? "default";
    let variantClasses = variants[variant];
    if (variant === "secondary" && props.inLayer) {
      variantClasses = variantClasses.replace("dark:hover:bg-zinc-800", "dark:hover:bg-zinc-700");
    }
    return cn(base, sizes[size], variantClasses, props.class);
  });

  return (
    <Show
      when={props.href}
      fallback={
        <button class={className()} {...rest}>
          {props.children}
        </button>
      }
    >
      {(href) => (
        <a href={href()} class={className()}>
          {props.children}
        </a>
      )}
    </Show>
  );
};

export default Button;
