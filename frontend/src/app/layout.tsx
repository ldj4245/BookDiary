import type { Metadata } from "next";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Toaster } from "sonner";
import { ClientShell } from "./client-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "BookLog",
  description: "독서 기록 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        <AuthGuard>
          <ClientShell>{children}</ClientShell>
        </AuthGuard>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
