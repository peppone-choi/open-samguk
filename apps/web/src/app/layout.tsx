import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "삼국지 모의전투",
  description: "HiDCHe 삼국지 모의전투 게임",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
