"use client";

import { usePathname } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { useLoggedIn } from "@/lib/use-auth";

export function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const loggedIn = useLoggedIn();

  if (pathname === "/login" || (pathname === "/" && !loggedIn)) {
    return <>{children}</>;
  }

  return <AppShell>{children}</AppShell>;
}
