import { splitProps, type JSX, type Component } from "solid-js";

type ButtonProps = {
  variant?: "primary" | "secondary" | "ghost" | "success" | "error";
  active?: boolean;
} & JSX.ButtonHTMLAttributes<HTMLButtonElement>;

const Button: Component<ButtonProps> = (props) => {
  const [local, rest] = splitProps(props, ["variant", "active", "class", "children"]);

  const base = "px-3 py-1 rounded font-medium transition-colors disabled:opacity-50";
  
  const variants: Record<string, string> = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100",
    ghost: "text-blue-600 dark:text-blue-400 hover:underline",
    success: "text-green-600 dark:text-green-400 hover:underline",
    error: "text-red-600 dark:text-red-400 hover:underline",
  };

  const activeStyles = local.active 
    ? "ring-2 ring-blue-500 dark:ring-blue-400" 
    : "";

  return (
    <button
      class={`${base} ${variants[local.variant ?? "primary"]} ${activeStyles} ${local.class ?? ""}`}
      aria-pressed={local.active}
      {...rest}
    >
      {local.children}
    </button>
  );
};

export default Button;
