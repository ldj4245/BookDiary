"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLoggedIn } from "@/lib/use-auth";

const PUBLIC_PATHS = ["/login"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const loggedIn = useLoggedIn();
  const publicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  const publicHome = pathname === "/";

  useEffect(() => {
    if (!loggedIn && !publicPath && !publicHome) {
      router.replace("/login");
      return;
    }

    if (loggedIn && pathname === "/login") {
      router.replace("/");
    }
  }, [loggedIn, pathname, publicHome, publicPath, router]);

  if (!loggedIn && !publicPath && !publicHome) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        로딩 중
      </div>
    );
  }

  if (loggedIn && pathname === "/login") {
    return null;
  }

  return <>{children}</>;
}
