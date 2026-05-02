// @refresh reload
import { createHandler, StartServer } from "@solidjs/start/server";
import { getCookie } from "@solidjs/start/http";

export default createHandler(() => {
  const theme = getCookie("theme");

  return (
    <StartServer
      document={({ assets, children, scripts }) => (
        <html
          lang="en"
          class={theme === "dark" ? "dark" : undefined}
          style={theme ? `color-scheme: ${theme};` : undefined}
        >
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link rel="icon" href="/favicon.ico" />
            {assets}
          </head>
          <body>
            <div id="app">{children}</div>
            {scripts}
          </body>
        </html>
      )}
    />
  );
});
