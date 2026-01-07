import type { Metadata } from "next";
import "./globals.css";
import { TRPCProvider } from "./trpc-provider.js";

export const metadata: Metadata = {
  title: "삼국지 모의전투",
  description: "HiDCHe 삼국지 모의전투 게임",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}
