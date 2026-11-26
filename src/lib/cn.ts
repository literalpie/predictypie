import type { JSX } from "@solidjs/web";
import { twMerge } from "tailwind-merge";

export function cn(...classes: (JSX.ClassValue | undefined | null | false)[]) {
  const resolved: string[] = [];

  const add = (value: JSX.ClassValue | undefined | null | false) => {
    if (!value) return;
    if (typeof value === "string" || typeof value === "number") {
      resolved.push(String(value));
    } else if (Array.isArray(value)) {
      value.forEach(add);
    } else if (typeof value === "object") {
      for (const [key, enabled] of Object.entries(value)) {
        if (enabled) resolved.push(key);
      }
    }
  };

  classes.forEach(add);
  return twMerge(resolved);
}
