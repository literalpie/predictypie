import { getRequestEvent, parseCookieHeader, serializeCookie } from "@solidjs/web";

type CookieRequestEvent = {
  request: Request;
  response?: { headers: Headers };
};

function currentEvent(): CookieRequestEvent | undefined {
  return getRequestEvent() as CookieRequestEvent | undefined;
}

export function getCookie(name: string): string | null {
  const event = currentEvent();
  if (!event) return null;
  return parseCookieHeader(event.request.headers.get("cookie"))[name] ?? null;
}

export function setCookie(
  name: string,
  value: string,
  options: Parameters<typeof serializeCookie>[2] = {},
) {
  const event = currentEvent();
  if (!event?.response) return;
  event.response.headers.append("set-cookie", serializeCookie(name, value, options));
}

export function deleteCookie(name: string, path = "/") {
  setCookie(name, "", { path, maxAge: 0 });
}

export function withCookie(
  response: Response,
  name: string,
  value: string,
  options: Parameters<typeof serializeCookie>[2] = {},
) {
  response.headers.append("set-cookie", serializeCookie(name, value, options));
  return response;
}

export function withoutCookie(response: Response, name: string, path = "/") {
  return withCookie(response, name, "", { path, maxAge: 0 });
}
