"use client";

import { useEffect, useState } from "react";
import { ImagePlus, Settings, UserRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCurrentUser } from "@/lib/api/client";
import { getProvider } from "@/lib/auth";
import type { User } from "@/types";

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [nickname, setNickname] = useState("");
  const [provider, setProvider] = useState<string | null>(null);

  useEffect(() => {
    void getCurrentUser().then((u) => {
      setUser(u);
      setNickname(u.nickname);
      setProvider(getProvider());
    });
  }, []);

  return (
    <div className="space-y-7">
      <header className="border-b border-border/70 pb-6">
        <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-primary">
          <Settings className="size-3.5" />
          설정
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--ink)]">
          설정
        </h1>
      </header>

      <section className="max-w-2xl rounded-lg border border-border/80 bg-card p-5">
        <div className="mb-6 flex items-center gap-2 text-sm font-medium">
          <UserRound className="size-4 text-primary" />
          프로필
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="size-16 border border-border/80">
              {user?.profileImageUrl && (
                <AvatarImage src={user.profileImageUrl} alt="" />
              )}
              <AvatarFallback>BL</AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm" disabled className="gap-2">
              <ImagePlus className="size-4" />
              이미지 업로드
            </Button>
          </div>

          <div className="space-y-2">
            <Label>닉네임</Label>
            <Input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="bg-background"
            />
            <Button variant="secondary" size="sm" disabled>
              저장
            </Button>
          </div>

          {provider && (
            <p className="rounded-lg bg-muted/60 px-3 py-2 text-sm text-muted-foreground">
              로그인: 카카오
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
