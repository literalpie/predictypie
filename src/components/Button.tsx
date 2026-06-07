import { splitProps, createMemo, type JSX, type Component } from "solid-js";

type ButtonProps = {
  variant?: "primary" | "secondary" | "link" | "success" | "error" | "danger";
  size?: "sm";
} & JSX.ButtonHTMLAttributes<HTMLButtonElement>;

const Button: Component<ButtonProps> = (props) => {
  const [local, rest] = splitProps(props, ["variant", "size", "class", "children"]);

  const base = "font-medium transition-colors disabled:opacity-50";

  const sizes: Record<string, string> = {
    default: "text-sm px-3 py-1.5 rounded",
    sm: "text-xs px-3 py-1.5 rounded",
  };

  const variants: Record<string, string> = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary:
      "bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100",
    link: "text-blue-600 dark:text-blue-400 hover:underline",
    success: "text-green-600 dark:text-green-400 hover:underline",
    error: "text-red-600 dark:text-red-400 hover:underline",
    danger: "text-zinc-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400",
  };

  const className = createMemo(() => {
    const variant = local.variant ?? "primary";
    const size = local.size ?? "default";
    const variantClasses = variants[variant];
    return [base, sizes[size], variantClasses, local.class].filter(Boolean).join(" ");
  });

  return (
    <button class={className()} {...rest}>
      {local.children}
    </button>
  );
};

export default Button;
