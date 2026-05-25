"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookMarked,
  BookOpen,
  ChartColumn,
  Compass,
  FolderOpen,
  Home,
  LibraryBig,
  LogOut,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { clearAccessToken } from "@/lib/auth";
import { fetchApi } from "@/lib/api/client";

const navItems = [
  { href: "/", label: "오늘", icon: Home },
  { href: "/library", label: "서재", icon: LibraryBig },
  { href: "/search", label: "발견", icon: Compass },
  { href: "/collections", label: "컬렉션", icon: FolderOpen },
  { href: "/stats", label: "통계", icon: ChartColumn },
  { href: "/settings", label: "설정", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetchApi("/auth/logout", { method: "POST" });
    } catch (e) {
      console.error(e);
    } finally {
      clearAccessToken();
      router.push("/login");
    }
  };

  return (
    <div className="flex min-h-screen bg-background/50 selection:bg-primary/20">
      <aside className="hidden w-64 shrink-0 border-r border-border/40 bg-card/50 backdrop-blur-xl md:flex md:flex-col shadow-sm">
        <div className="border-b border-border/40 px-6 py-7">
          <Link href="/" className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-foreground">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <BookOpen className="size-4" />
            </div>
            BookLog
          </Link>
          <p className="mt-2 text-xs font-medium text-muted-foreground ml-9">나만의 독서 기록장</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/"
                ? pathname === "/"
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-300",
                  active
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[0.98]"
                    : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border/40 p-4">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors duration-300 rounded-xl"
            onClick={handleLogout}
          >
            <LogOut className="size-4" />
            로그아웃
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border/40 bg-card/60 backdrop-blur-xl px-4 py-3 md:hidden sticky top-0 z-50">
          <Link href="/" className="font-bold flex items-center gap-2">
            <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <BookOpen className="size-3" />
            </div>
            BookLog
          </Link>
          <nav className="flex gap-2 overflow-x-auto text-xs pb-1 scrollbar-none">
            {navItems.slice(0, 4).map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "whitespace-nowrap rounded-full px-3 py-1.5 font-medium transition-all",
                  pathname === href || pathname.startsWith(href + "/")
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/50 text-muted-foreground",
                )}
              >
                {label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 md:px-8 lg:py-10 animate-fade-slide-up">
          {children}
        </main>
      </div>
    </div>
  );
}
