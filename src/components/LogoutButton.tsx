import { action, useAction } from "@solidjs/router";
import { getCookie, deleteCookie } from "@solidjs/start/http";
import { getOAuthClient } from "~/auth/client";

const logout = action(async () => {
  "use server";
  const client = await getOAuthClient();
  const did = getCookie("did");
  if (did) {
    await client.revoke(did);
  }
  deleteCookie("did");
}, "logout");

export function LogoutButton() {
  const logoutAction = useAction(logout);

  async function handleLogout() {
    await logoutAction();
    window.location.href = "/";
  }

  return (
    <button
      onClick={handleLogout}
      class="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
    >
      Sign out
    </button>
  );
}
