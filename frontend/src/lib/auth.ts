const AUTH_KEY = "booklog_access_token";
const AUTH_EVENT = "booklog-auth";

// 메모리 캐시 역할 (선택 사항)
let memoryToken: string | null = null;

function notifyAuthChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function setAccessToken(token: string) {
  if (typeof window === "undefined") return;
  memoryToken = token;
  localStorage.setItem(AUTH_KEY, token);
  notifyAuthChange();
}

export function clearAccessToken() {
  if (typeof window === "undefined") return;
  memoryToken = null;
  localStorage.removeItem(AUTH_KEY);
  notifyAuthChange();
}

export function getAccessToken(): string | null {
  if (typeof window !== "undefined") {
    return memoryToken || localStorage.getItem(AUTH_KEY);
  }
  return memoryToken;
}

export function isLoggedIn(): boolean {
  return !!getAccessToken();
}

export function getProvider(): string | null {
  if (typeof window === "undefined") return null;
  return "kakao"; // 임시로 카카오 하드코딩
}

export { AUTH_EVENT };
