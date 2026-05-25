const AUTH_KEY = "booklog_mock_auth";
const AUTH_PROVIDER = "kakao";
const AUTH_EVENT = "booklog-auth";

function notifyAuthChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(AUTH_KEY) === "true";
}

export function mockLogin() {
  localStorage.setItem(AUTH_KEY, "true");
  localStorage.setItem("booklog_provider", AUTH_PROVIDER);
  notifyAuthChange();
}

export function mockLogout() {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem("booklog_provider");
  notifyAuthChange();
}

export function getProvider(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("booklog_provider");
}

export { AUTH_EVENT };
