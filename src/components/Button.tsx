import { splitProps, createMemo, type JSX, type Component } from "solid-js";
import { cn } from "../lib/cn";

type ButtonProps = {
  variant?: "primary" | "secondary" | "link" | "success" | "error" | "danger";
  size?: "sm";
  href?: string;
  inLayer?: boolean;
} & JSX.ButtonHTMLAttributes<HTMLButtonElement> & JSX.AnchorHTMLAttributes<HTMLAnchorElement>;

const Button: Component<ButtonProps> = (props) => {
  const [local, rest] = splitProps(props, ["variant", "size", "class", "children", "href", "inLayer"]);

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
    error: "text-red-600 dark:text-red-400 hover:underline",
    danger: "text-zinc-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400",
  };

  const className = createMemo(() => {
    const variant = local.variant ?? "primary";
    const size = local.size ?? "default";
    let variantClasses = variants[variant];
    if (variant === "secondary" && local.inLayer) {
      variantClasses = variantClasses.replace("dark:hover:bg-zinc-800", "dark:hover:bg-zinc-700");
    }
    return cn(base, sizes[size], variantClasses, local.class);
  });

  if (local.href) {
    return (
      <a href={local.href} class={className()}>
        {local.children}
      </a>
    );
  }

  return (
    <button class={className()} {...rest}>
      {local.children}
    </button>
  );
};

export default Button;
