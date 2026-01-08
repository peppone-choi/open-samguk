import Link from "next/link";
import { Swords, Users, Crown, Map } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Hero Section */}
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="text-center space-y-8 max-w-4xl">
          <h1 className="text-6xl font-bold tracking-tight">삼국지 모의전투</h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            중원 평정을 위한 위대한 여정을 시작하세요. 전략적 사고와 외교적 수완으로 천하를
            통일하십시오.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link
              href="/game"
              className="inline-flex items-center gap-2 px-8 py-4 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg transition-colors text-lg"
            >
              <Swords className="h-5 w-5" />
              게임 시작
            </Link>
            <Link
              href="/game/join"
              className="inline-flex items-center gap-2 px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors text-lg"
            >
              <Users className="h-5 w-5" />
              장수 생성
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-5xl w-full px-4">
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <Crown className="h-10 w-10 text-amber-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">세력 경쟁</h3>
            <p className="text-slate-400">
              위, 촉, 오 세 나라의 패권 다툼에 참여하여 천하 통일을 노리세요.
            </p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <Swords className="h-10 w-10 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">전략적 전투</h3>
            <p className="text-slate-400">
              지형과 병종을 활용한 깊이 있는 전투 시스템을 경험하세요.
            </p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <Map className="h-10 w-10 text-emerald-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">영토 확장</h3>
            <p className="text-slate-400">도시를 점령하고 발전시켜 강력한 세력을 구축하세요.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
