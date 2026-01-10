"use client";

import Link from "next/link";
import { Swords, Users, BookOpen, MessageSquare, Trophy } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-black text-white font-sans overflow-x-hidden">
      {/* Background Image with Overlay */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-60 pointer-events-none transition-opacity duration-1000"
        style={{ backgroundImage: "url('/assets/images/landing_bg.png')" }}
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-black/40 via-black/80 to-black pointer-events-none" />

      {/* Navigation Header */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 backdrop-blur-sm border-b border-white/5 sticky top-0 bg-black/20">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold tracking-tighter hover:text-primary transition-colors font-serif">
            HiDCHe
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-400">
            <Link href="#" className="hover:text-white transition-colors">메뉴</Link>
            <Link href="#" className="hover:text-white transition-colors">커뮤니티</Link>
            <Link href="#" className="hover:text-white transition-colors">위키</Link>
            <Link href="#" className="hover:text-white transition-colors">도움말</Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/auth/register"
            className="text-sm font-semibold text-primary hover:underline underline-offset-4"
          >
            회원가입
          </Link>
          <Link
            href="/auth/login"
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-sm font-bold rounded border border-white/10 transition-all"
          >
            로그인
          </Link>
        </div>
      </nav>

      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-24 flex flex-col items-center">
        {/* Hero Section */}
        <div className="text-center mb-16 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <h1 className="text-6xl md:text-8xl font-bold tracking-widest font-serif text-primary drop-shadow-[0_5px_15px_rgba(var(--primary-glow),0.3)]">
            삼국지 모의전투
          </h1>
          <p className="text-xl md:text-2xl font-medium text-gray-300 tracking-[0.2em] font-serif">
            STORY OF THREE KINGDOMS
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full items-start">

          {/* Left Column: Information & Login */}
          <div className="space-y-8 order-2 lg:order-1">
            <div className="space-y-6">
              <h3 className="text-2xl font-serif font-bold border-l-4 border-primary pl-4">천하를 통일할 영웅을 기다립니다</h3>
              <p className="text-gray-400 leading-relaxed max-w-md">
                위, 촉, 오 세 나라가 격돌하는 난세의 한복판.
                전략적 지혜와 외교적 수완으로 자신만의 세력을 구축하고
                중원의 진정한 주인이 되십시오.
              </p>
            </div>

            <LoginForm />

            {/* Quick Stats/Features */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-zinc-900/50 border border-white/5 rounded-lg flex items-center gap-4">
                <Users className="text-primary w-6 h-6" />
                <div>
                  <div className="text-xs text-gray-500 uppercase">동시 접속</div>
                  <div className="font-bold">124명</div>
                </div>
              </div>
              <div className="p-4 bg-zinc-900/50 border border-white/5 rounded-lg flex items-center gap-4">
                <Swords className="text-red-500 w-6 h-6" />
                <div>
                  <div className="text-xs text-gray-500 uppercase">진행 턴</div>
                  <div className="font-bold">1,452턴</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Game Status Preview */}
          <div className="space-y-6 order-1 lg:order-2 animate-in fade-in zoom-in duration-1000">
            <div className="bg-zinc-900/80 backdrop-blur-md border border-gray-700/50 rounded-lg overflow-hidden shadow-2xl">
              <div className="bg-zinc-800/90 px-4 py-2 flex justify-between items-center border-b border-gray-700">
                <span className="font-bold text-sm tracking-tight">천하 현황 (SERVER: CHESUB)</span>
                <span className="text-xs font-serif text-primary">西紀 197年 7月 秋</span>
              </div>

              {/* Map Preview Area */}
              <div className="aspect-video bg-zinc-950 relative overflow-hidden group">
                <div
                  className="absolute inset-0 bg-[url('/assets/images/landing_bg.png')] bg-cover opacity-20 group-hover:scale-105 transition-transform duration-10000"
                  style={{ filter: "grayscale(100%) contrast(150%)" }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-3 z-10 transition-transform group-hover:scale-110">
                    <div className="inline-block px-3 py-1 bg-primary/20 border border-primary/50 text-primary text-[10px] font-bold uppercase tracking-widest rounded-full mb-2">LIVE VIEW</div>
                    <div className="text-xl font-serif font-bold italic tracking-tighter text-white/80">데이터 동기화 중...</div>
                    <Link href="/game" className="inline-block px-6 py-2 bg-white/5 hover:bg-white/10 text-xs font-bold border border-white/10 rounded backdrop-blur-sm transition-all">
                      지도 크게 보기
                    </Link>
                  </div>
                </div>

                {/* Decorative Scanlines */}
                <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] pointer-events-none z-10 bg-[length:100%_2px,3px_100%]" />
              </div>

              {/* News/Logs Section */}
              <div className="p-4 bg-black/60 text-[11px] font-mono space-y-2 border-t border-gray-800 max-h-[150px] overflow-y-auto custom-scrollbar">
                <div className="flex gap-2 text-blue-400">
                  <span>[전투]</span>
                  <span className="text-gray-400">조조군이 원소군의 하북 지역을 맹공격하고 있습니다. (197년 7월)</span>
                </div>
                <div className="flex gap-2 text-amber-500">
                  <span>[정치]</span>
                  <span className="text-gray-400">유비군이 서주 지역에서 세력을 확장하며 백성들의 지지를 얻고 있습니다.</span>
                </div>
                <div className="flex gap-2 text-red-500">
                  <span>[재난]</span>
                  <span className="text-gray-400">남비, 관도 일대에 메뚜기 떼가 발생하여 식량 수급에 비상이 걸렸습니다.</span>
                </div>
                <div className="flex gap-2 text-emerald-500">
                  <span>[인재]</span>
                  <span className="text-gray-400">강동의 호랑이 손견의 아들 손책이 새로운 영웅으로 부상하고 있습니다.</span>
                </div>
                <div className="flex gap-2 text-purple-400">
                  <span>[황제]</span>
                  <span className="text-gray-400">낙양의 황궁에서 천하의 영웅들을 소집하는 특별 칙령이 내려졌습니다.</span>
                </div>
              </div>
            </div>

            {/* Bottom Links */}
            <div className="grid grid-cols-3 gap-3">
              <Link href="#" className="p-3 bg-zinc-900/50 hover:bg-zinc-800 border border-white/5 rounded text-center transition-all group">
                <BookOpen className="w-5 h-5 mx-auto mb-2 text-gray-500 group-hover:text-primary transition-colors" />
                <span className="text-[10px] font-bold text-gray-400">게임 위키</span>
              </Link>
              <Link href="#" className="p-3 bg-zinc-900/50 hover:bg-zinc-800 border border-white/5 rounded text-center transition-all group">
                <MessageSquare className="w-5 h-5 mx-auto mb-2 text-gray-500 group-hover:text-primary transition-colors" />
                <span className="text-[10px] font-bold text-gray-400">자유 게시판</span>
              </Link>
              <Link href="#" className="p-3 bg-zinc-900/50 hover:bg-zinc-800 border border-white/5 rounded text-center transition-all group">
                <Trophy className="w-5 h-5 mx-auto mb-2 text-gray-500 group-hover:text-primary transition-colors" />
                <span className="text-[10px] font-bold text-gray-400">명예의 전당</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-black/60 backdrop-blur-md py-12 mt-12">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-2 space-y-4">
            <h4 className="text-lg font-bold font-serif text-primary">삼국지 모의전투 HiDCHe</h4>
            <p className="text-sm text-gray-500 leading-relaxed max-w-sm">
              웹 브라우저에서 즐기는 고품격 텍스트 전략 시뮬레이션.
              역사 속 군주가 되어 천하 통일의 대업을 이루십시오.
            </p>
          </div>
          <div className="space-y-4">
            <h5 className="text-xs font-bold uppercase tracking-widest text-gray-400">Links</h5>
            <ul className="text-sm text-gray-500 space-y-2">
              <li><Link href="#" className="hover:text-white transition-colors">이용약관</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">개인정보처리방침</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">문의하기</Link></li>
            </ul>
          </div>
          <div className="space-y-4 text-right md:text-left">
            <h5 className="text-xs font-bold uppercase tracking-widest text-gray-400">Copyright</h5>
            <p className="text-sm text-gray-500">© 2024 HiDCHe Development Team.<br />All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
