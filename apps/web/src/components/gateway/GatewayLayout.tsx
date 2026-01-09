"use client";

import { GatewayNavbar } from "./GatewayNavbar";
import Link from "next/link";

interface GatewayLayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

export function GatewayLayout({ children, showFooter = true }: GatewayLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <GatewayNavbar />

      {/* Main Content - offset by navbar height */}
      <main className="flex-1 pt-14">{children}</main>

      {/* Footer */}
      {showFooter && (
        <footer className="bg-zinc-900 border-t border-gray-700 py-4 text-center text-sm text-gray-400">
          <div className="max-w-[1024px] mx-auto px-4">
            <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4">
              <Link href="/terms" className="hover:text-white transition-colors">
                개인정보처리방침
              </Link>
              <span className="hidden sm:inline">&amp;</span>
              <Link href="/privacy" className="hover:text-white transition-colors">
                이용약관
              </Link>
            </div>
            <p className="mt-2">&copy; 2023 HideD</p>
            <p className="mt-1 text-xs text-gray-500">
              크롬, 엣지, 파이어폭스에 최적화되어있습니다.
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}
