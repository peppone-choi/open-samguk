"use client";

import { useState } from "react";
import Link from "next/link";
import { LogOut, Settings, Users } from "lucide-react";
import { trpc } from "@/utils/trpc";

// Server type colors matching legacy CSS
const serverTypeColors: Record<string, string> = {
  che: "text-red-500 font-bold",
  kwe: "text-blue-400 font-bold",
  pwe: "text-green-400 font-bold",
  twe: "text-yellow-400 font-bold",
  nya: "text-pink-400 font-bold",
  pya: "text-purple-400 font-bold",
  hwe: "text-orange-400 font-bold",
};

const serverDescriptions = [
  {
    name: "체섭",
    colorClass: "Entrance_Che",
    desc: "메인서버입니다. 천하통일에 도전하여 왕조일람과 명예의전당에 올라봅시다! (주로 1턴=60분)",
  },
  {
    name: "퀘섭",
    colorClass: "Entrance_Kwe",
    desc: "마이너 서버 그룹1. 비교적 느린 시간으로 운영됩니다.",
  },
  {
    name: "풰섭",
    colorClass: "Entrance_Pwe",
    desc: "마이너 서버 그룹1. 비교적 느린 시간으로 운영됩니다.",
  },
  {
    name: "퉤섭",
    colorClass: "Entrance_Twe",
    desc: "마이너 서버 그룹2. 비교적 빠른 시간으로 운영됩니다.",
  },
  {
    name: "냐섭",
    colorClass: "Entrance_Nya",
    desc: "마이너 서버 그룹3. 독특한 컨셉 위주로 운영됩니다.",
  },
  {
    name: "퍄섭",
    colorClass: "Entrance_Pya",
    desc: "마이너 서버 그룹3. 독특한 컨셉 위주로 운영됩니다.",
  },
  {
    name: "훼섭",
    colorClass: "Entrance_Hwe",
    desc: "운영자 테스트 서버입니다. 기습적으로 열리고, 닫힐 수 있습니다.",
  },
];

export default function ServersPage() {
  const [notice] = useState("현재 서버가 운영중입니다.");
  const { data: servers, isLoading, error } = trpc.getServerList.useQuery();

  const handleLogout = () => {
    console.log("Logout clicked");
    localStorage.removeItem("token");
    window.location.href = "/auth/login";
  };

  const handleEnterServer = (serverId: string) => {
    console.log("Entering server:", serverId);
    // TODO: 세션 설정 및 게임 페이지 이동
    window.location.href = "/game";
  };

  const handleCreateCharacter = (serverId: string) => {
    console.log("Creating character on server:", serverId);
    // TODO: 캐릭터 생성 페이지 이동
    window.location.href = `/game/join`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "running":
        return <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">운영중</span>;
      case "waiting":
        return <span className="px-2 py-1 bg-yellow-600 text-white text-xs rounded">대기중</span>;
      case "closed":
        return <span className="px-2 py-1 bg-gray-600 text-white text-xs rounded">종료</span>;
      default:
        return null;
    }
  };

  if (isLoading) return <div className="p-8 text-center">서버 정보를 불러오는 중...</div>;
  if (error) return <div className="p-8 text-center text-red-500">에러 발생: {error.message}</div>;

  return (
    <div className="min-h-[calc(100vh-56px)] py-8 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
      </div>

      <div className="game-container px-4 relative z-10">
        {/* Notice Banner */}
        {notice && (
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-300 text-sm backdrop-blur-sm shadow-[0_0_15px_rgba(245,158,11,0.1)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              {notice}
            </div>
          </div>
        )}

        {/* Server List Table */}
        <div className="mb-10 premium-card p-0 overflow-hidden border-white/10">
          <div className="bg-black/40 border-b border-white/10 p-4 flex items-center justify-between backdrop-blur-md">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-primary rounded-full shadow-[0_0_10px_hsl(var(--primary))]"></div>
              <span className="font-bold text-lg text-primary/90">서버 선택</span>
            </div>
            <div className="text-xs text-muted-foreground">접속 가능한 서버 목록</div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <colgroup>
                <col style={{ width: "100px" }} />
                <col style={{ width: "375px" }} />
                <col style={{ width: "66px" }} />
                <col />
                <col style={{ width: "120px" }} />
              </colgroup>
              <thead>
                <tr className="bg-white/5 border-b border-white/10 text-muted-foreground uppercase text-xs tracking-wider">
                  <th className="p-3 font-medium">서 버</th>
                  <th className="p-3 font-medium text-left">정 보</th>
                  <th className="p-3 font-medium" colSpan={2}>
                    캐 릭 터
                  </th>
                  <th className="p-3 font-medium">선 택</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {servers?.map((server) => (
                  <tr key={server.id} className="hover:bg-white/5 transition-colors group">
                    {/* Server Name */}
                    <td className="p-4 text-center">
                      <div
                        className={`text-base mb-1 ${serverTypeColors[server.id] || "text-white"}`}
                      >
                        {server.name.toUpperCase()}
                      </div>
                      <div className="flex justify-center">{getStatusBadge(server.status)}</div>
                    </td>

                    {/* Server Info */}
                    <td className="p-4">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-400">
                        <div className="flex justify-between">
                          <span>시나리오:</span>
                          <span className="text-gray-200">{server.scenario}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>현재:</span>
                          <span className="text-gray-200">{server.year}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>턴 시간:</span>
                          <span className="text-gray-200">{server.turnTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>참가자:</span>
                          <span className="text-gray-200">
                            {server.players}/{server.maxPlayers}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Character Icon */}
                    <td className="p-4 text-center">
                      <div className="w-10 h-10 rounded-full bg-black/30 flex items-center justify-center border border-white/10 mx-auto group-hover:border-primary/30 transition-colors">
                        {server.hasCharacter ? (
                          <Users className="w-5 h-5 text-amber-400" />
                        ) : (
                          <Users className="w-5 h-5 text-gray-600" />
                        )}
                      </div>
                    </td>

                    {/* Character Name */}
                    <td className="p-4">
                      {server.hasCharacter ? (
                        <div>
                          <div className="text-amber-400 font-medium">{server.characterName}</div>
                          <div className="text-xs text-gray-500 mt-0.5">군주: 조조</div>
                        </div>
                      ) : (
                        <span className="text-gray-600 text-xs italic">캐릭터 없음</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-center">
                      {server.status === "running" || server.status === "waiting" ? (
                        server.hasCharacter ? (
                          <button
                            onClick={() => handleEnterServer(server.id)}
                            className="w-full px-4 py-2 bg-amber-600/20 hover:bg-amber-600 text-amber-400 hover:text-white border border-amber-600/50 rounded-lg transition-all duration-300 text-sm font-bold shadow-[0_0_10px_rgba(217,119,6,0.1)] hover:shadow-[0_0_15px_rgba(217,119,6,0.4)]"
                          >
                            입장
                          </button>
                        ) : (
                          <button
                            onClick={() => handleCreateCharacter(server.id)}
                            className="w-full px-4 py-2 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-600/50 rounded-lg transition-all duration-300 text-sm font-bold shadow-[0_0_10px_rgba(37,99,235,0.1)] hover:shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                          >
                            등록
                          </button>
                        )
                      ) : (
                        <span className="text-gray-600 text-sm">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={5} className="p-6 bg-black/20 border-t border-white/5">
                    <div className="flex flex-col gap-4">
                      <div className="p-4 rounded-lg bg-orange-950/20 border border-orange-500/20 text-sm text-orange-200/80">
                        <p className="flex items-center gap-2 mb-2 font-bold text-orange-400">
                          <span className="text-lg">⚠️</span> 주의사항
                        </p>
                        <p className="leading-relaxed opacity-90">
                          1명이 2개 이상의 계정을 사용하거나 타 유저의 턴을 대신 입력하는 것이
                          적발될 경우 차단 될 수 있습니다. 계정은 한번 등록으로 계속 사용합니다. 각
                          서버 리셋시 캐릭터만 새로 생성하면 됩니다.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-400">
                        {serverDescriptions.map((desc) => (
                          <div
                            key={desc.name}
                            className="flex gap-2 items-start p-2 rounded hover:bg-white/5 transition-colors"
                          >
                            <span
                              className={`shrink-0 font-bold ${desc.colorClass.replace("Entrance_", "text-").replace("Che", "red-500").replace("Kwe", "blue-400").replace("Pwe", "green-400").replace("Twe", "yellow-400").replace("Nya", "pink-400").replace("Pya", "purple-400").replace("Hwe", "orange-400")}`}
                            >
                              {desc.name}
                            </span>
                            <span className="opacity-80">{desc.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Account Management Section */}
        <div className="premium-card p-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Settings size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">계정 관리</h3>
              <p className="text-xs text-gray-400">비밀번호 변경, 전용 아이콘 설정, 회원 탈퇴</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              href="/auth/account"
              className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg transition-all duration-300 text-sm font-medium hover:border-white/20"
            >
              설정으로 이동
            </Link>
            <button
              onClick={handleLogout}
              className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-all duration-300 text-sm font-medium flex items-center gap-2"
            >
              <LogOut size={16} />
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
