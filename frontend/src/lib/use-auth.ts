"use client";

import { useSyncExternalStore } from "react";
import { AUTH_EVENT, isLoggedIn } from "@/lib/auth";

function subscribe(callback: () => void) {
  window.addEventListener(AUTH_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(AUTH_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function useLoggedIn() {
  return useSyncExternalStore(subscribe, isLoggedIn, () => false);
}
