import { action, useAction } from "@solidjs/router";
import { getCookie, deleteCookie } from "@solidjs/start/http";
import { getOAuthClient } from "~/auth/client";
import Button from "./Button";

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
    <Button variant="secondary" onClick={handleLogout}>
      Sign out
    </Button>
  );
}
