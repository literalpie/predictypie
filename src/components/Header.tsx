import { Show, Suspense, createResource } from "solid-js";
import { clientOnly } from "@solidjs/start";
import Button from "./Button";
import { LogoutButton } from "./LogoutButton";
import { getSessionDid } from "~/lib/session";

const ThemeToggle = clientOnly(() => import("./ThemeToggle"));

export default function Header() {
  const [sessionDid] = createResource(() => getSessionDid());

  return (
    <header class="sticky top-0 z-10 header-scroll-anim">
      <div class="flex justify-between items-center px-4 py-2 max-w-2xl mx-auto">
        <a href="/" class="text-2xl font-bold text-zinc-900 dark:text-zinc-100 no-underline">
          PredictyPie
        </a>
        <nav class="flex gap-2 items-center">
          <ThemeToggle />
          <Suspense>
            <Show when={sessionDid()}>
              <Button variant="secondary" href="/new">
                New Prediction
              </Button>
              <LogoutButton />
            </Show>
            <Show when={sessionDid() === null}>
              <Button variant="secondary" href="/oauth/login">
                Sign in
              </Button>
            </Show>
          </Suspense>
        </nav>
      </div>
    </header>
  );
}
