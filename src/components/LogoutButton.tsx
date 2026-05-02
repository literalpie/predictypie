"use client";

import { revalidate } from "@solidjs/router";
import { query } from "@solidjs/router";

const sessionQuery = query(async () => {
  "use server";
  return null;
}, "session");

export function LogoutButton() {
  async function handleLogout() {
    await fetch("/oauth/logout", { method: "POST" });
    revalidate(sessionQuery.key);
  }

  return (
    <button onClick={handleLogout} class="text-sm text-zinc-500 hover:text-zinc-700">
      Sign out
    </button>
  );
}
