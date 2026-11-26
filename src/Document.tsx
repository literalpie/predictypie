import type { ParentProps } from "solid-js";
import { HydrationScript } from "@solidjs/web";
import { getCookie } from "./lib/cookies";

export default function Document(props: ParentProps) {
  const theme = getCookie("theme");

  return (
    <html
      lang="en"
      class={theme === "dark" ? "dark" : undefined}
      style={theme ? `color-scheme: ${theme};` : undefined}
    >
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <title>PredictyPie</title>
        <HydrationScript />
      </head>
      <body>{props.children}</body>
    </html>
  );
}
