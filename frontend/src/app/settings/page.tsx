"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Settings, UserRound, Target, AlertTriangle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCurrentUser, updateUserProfile, deleteUser } from "@/lib/api/client";
import { getProvider, clearAccessToken } from "@/lib/auth";
import type { User } from "@/types";
import { toast } from "sonner";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [nickname, setNickname] = useState("");
  const [yearlyGoal, setYearlyGoal] = useState<string>("");
  const [provider, setProvider] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    void getCurrentUser().then((u) => {
      setUser(u);
      setNickname(u.nickname);
      if (u.yearlyGoal) setYearlyGoal(u.yearlyGoal.toString());
      setProvider(getProvider());
    }).catch(() => {
      toast.error("사용자 정보를 불러오는데 실패했습니다.");
    });
  }, []);

  const handleSave = async () => {
    if (!nickname.trim()) {
      toast.error("닉네임을 입력해주세요.");
      return;
    }
    
    setIsSaving(true);
    try {
      const goalNum = yearlyGoal ? parseInt(yearlyGoal, 10) : undefined;
      const updatedUser = await updateUserProfile({
        nickname: nickname.trim(),
        yearlyGoal: goalNum,
      });
      setUser(updatedUser);
      toast.success("프로필이 성공적으로 업데이트되었습니다.");
    } catch (error) {
      toast.error("프로필 수정에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("정말로 계정을 삭제하시겠습니까? 기록된 모든 데이터가 삭제되며 복구할 수 없습니다.")) {
      return;
    }
    
    setIsDeleting(true);
    try {
      await deleteUser();
      clearAccessToken();
      toast.success("계정이 삭제되었습니다.");
      router.push("/login");
    } catch (error) {
      toast.error("계정 삭제에 실패했습니다.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-7 pb-20">
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
            <Button variant="outline" size="sm" disabled className="gap-2" title="추후 지원 예정입니다">
              <ImagePlus className="size-4" />
              이미지 업로드
            </Button>
          </div>

          <div className="space-y-2">
            <Label>닉네임</Label>
            <div className="flex gap-2">
              <Input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="bg-background max-w-sm"
              />
            </div>
          </div>
          
          <div className="space-y-2 pt-2 border-t border-border/50">
            <Label className="flex items-center gap-2 mt-4">
              <Target className="size-4" />
              올해의 독서 목표 (권)
            </Label>
            <div className="flex gap-2">
              <Input
                type="number"
                min="0"
                value={yearlyGoal}
                onChange={(e) => setYearlyGoal(e.target.value)}
                placeholder="예: 50"
                className="bg-background max-w-[120px]"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">올해 달성하고 싶은 독서량 목표를 설정해보세요.</p>
          </div>

          <div className="pt-2">
            <Button 
              variant="default" 
              size="sm" 
              onClick={handleSave} 
              disabled={isSaving}
            >
              {isSaving ? "저장 중..." : "변경사항 저장"}
            </Button>
          </div>

          {provider && (
            <div className="pt-4 mt-2 border-t border-border/50">
              <p className="inline-flex items-center rounded-lg bg-muted/60 px-3 py-2 text-sm text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-yellow-400 mr-2"></span>
                연결된 계정: 카카오
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="max-w-2xl rounded-lg border border-red-200/50 bg-red-50/30 p-5">
        <div className="mb-4 flex items-center gap-2 text-sm font-medium text-red-600">
          <AlertTriangle className="size-4" />
          위험 구역 (Danger Zone)
        </div>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            계정을 삭제하면 등록된 모든 독서 기록과 노트가 영구적으로 삭제되며 복구할 수 없습니다.
          </p>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleDeleteAccount}
            disabled={isDeleting}
          >
            {isDeleting ? "처리 중..." : "계정 삭제 (회원 탈퇴)"}
          </Button>
        </div>
      </section>
    </div>
  );
}
