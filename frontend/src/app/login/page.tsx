"use client";

import { useRouter } from "next/navigation";
import { BookMarked, MessageCircle, Library, PenLine, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mockLogin } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();

  const handleKakaoLogin = () => {
    mockLogin();
    router.push("/");
  };

  return (
    <>
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
          100% { transform: translateY(0px); }
        }
        @keyframes float-delayed {
          0% { transform: translateY(0px); }
          50% { transform: translateY(12px); }
          100% { transform: translateY(0px); }
        }
        @keyframes fade-slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-slide-up {
          animation: fade-slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .delay-200 { animation-delay: 200ms; opacity: 0; }
        .delay-400 { animation-delay: 400ms; opacity: 0; }
      `}</style>
      
      <main className="relative min-h-screen w-full bg-background overflow-hidden flex items-center justify-center selection:bg-primary/20">
        {/* Subtle Background Pattern / Gradient */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background dark:from-primary/20 dark:via-background dark:to-background" />
        
        <div className="container relative mx-auto grid min-h-screen grid-cols-1 items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:px-12">
          {/* Left: Copy & Login */}
          <div className="flex flex-col justify-center space-y-10 animate-fade-slide-up">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
                <BookMarked className="size-5" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-foreground">BookLog</span>
            </div>

            <div className="space-y-6">
              <h1 className="text-5xl sm:text-6xl lg:text-[4rem] font-bold tracking-tighter text-foreground leading-[1.1]">
                읽던 책을 <br />
                <span className="text-primary">이어 기록</span>하세요.
              </h1>
              <p className="max-w-[28rem] text-lg text-muted-foreground leading-relaxed font-medium">
                쪽수, 메모, 완독 기록을 가볍게 남깁니다.<br />
                온전히 나만을 위한 독서 기록장으로 시작해 보세요.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button
                size="lg"
                className="h-14 w-full sm:w-auto px-8 bg-[#FEE500] text-[#191600] hover:bg-[#FEE500]/90 font-semibold shadow-sm transition-all duration-300 active:scale-95 text-base rounded-xl"
                onClick={handleKakaoLogin}
              >
                <MessageCircle className="mr-2.5 size-5 fill-current" />
                카카오로 3초 만에 시작
              </Button>
            </div>
          </div>

          {/* Right: Floating App Preview */}
          <div className="relative hidden lg:flex items-center justify-center animate-fade-slide-up delay-200">
            {/* Main Card (Dashboard Preview) */}
            <div className="relative z-10 w-full max-w-[440px] rounded-[1.5rem] border border-border/40 bg-card/60 p-7 shadow-2xl shadow-primary/5 backdrop-blur-2xl">
              <div className="flex items-center justify-between mb-7">
                <h3 className="font-semibold tracking-tight text-card-foreground text-lg">오늘의 독서</h3>
                <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full">읽는 중</span>
              </div>

              <div className="flex gap-5">
                {/* Fake Book Cover */}
                <div className="h-36 w-24 shrink-0 rounded-lg bg-muted border border-border/50 shadow-md flex items-center justify-center overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent dark:from-primary/30 opacity-60" />
                  <BookMarked className="size-8 text-muted-foreground/30" />
                </div>
                
                <div className="flex flex-col justify-center py-1 w-full">
                  <div>
                    <h4 className="font-bold text-xl leading-tight text-foreground line-clamp-1">살인자의 기억법</h4>
                    <p className="text-sm text-muted-foreground mt-1.5 font-medium">김영하 · 문학동네</p>
                  </div>
                  
                  <div className="space-y-2 mt-5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-muted-foreground">진행</span>
                      <span className="text-foreground">140 / 280쪽</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
                      <div className="h-full rounded-full bg-primary w-1/2 transition-all duration-1000 ease-out" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-2xl bg-muted/30 p-5 border border-border/30 backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <PenLine className="size-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-sm text-foreground/80 leading-relaxed italic font-medium">
                    "기억이 사라진 자리에 남는 것은 습관일지도 모른다."
                  </p>
                </div>
              </div>
            </div>

            {/* Floating Stats Card 1 */}
            <div 
              className="absolute -right-6 -top-6 z-20 flex items-center gap-4 rounded-2xl border border-border/40 bg-card/80 p-4 shadow-xl shadow-black/5 backdrop-blur-xl"
              style={{ animation: 'float 5s ease-in-out infinite' }}
            >
              <div className="flex size-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                <Library className="size-6" />
              </div>
              <div className="pr-2">
                <p className="text-xs font-semibold text-muted-foreground mb-0.5">서재</p>
                <p className="text-xl font-bold text-foreground">4권</p>
              </div>
            </div>

            {/* Floating Stats Card 2 */}
            <div 
              className="absolute -left-8 -bottom-8 z-20 flex items-center gap-4 rounded-2xl border border-border/40 bg-card/80 p-4 shadow-xl shadow-black/5 backdrop-blur-xl"
              style={{ animation: 'float-delayed 6s ease-in-out infinite' }}
            >
              <div className="flex size-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                <Star className="size-6 fill-current" />
              </div>
              <div className="pr-2">
                <p className="text-xs font-semibold text-muted-foreground mb-0.5">올해 완독</p>
                <p className="text-xl font-bold text-foreground">1권</p>
              </div>
            </div>
            
            {/* Decorative Background Blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 blur-[80px] rounded-full pointer-events-none" />
          </div>
        </div>
      </main>
    </>
  );
}
