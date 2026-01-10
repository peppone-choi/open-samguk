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
    <div className="min-h-[calc(100vh-56px)] py-8">
      <div className="game-container px-4">
        {/* Notice Banner */}
        {notice && (
          <div className="text-center mb-6">
            <span className="text-orange-400 text-2xl">{notice}</span>
          </div>
        )}

        {/* Server List Table */}
        <div className="mb-8">
          <div className="bg2 section_title with_border text-center">서 버 선 택</div>
          <table className="tb_layout w-full">
            <colgroup>
              <col style={{ width: "100px" }} />
              <col style={{ width: "375px" }} />
              <col style={{ width: "66px" }} />
              <col />
              <col style={{ width: "120px" }} />
            </colgroup>
            <thead>
              <tr>
                <th className="bg1 p-2">서 버</th>
                <th className="bg1 p-2">정 보</th>
                <th className="bg1 p-2" colSpan={2}>
                  캐 릭 터
                </th>
                <th className="bg1 p-2">선 택</th>
              </tr>
            </thead>
            <tbody>
              {servers?.map((server) => (
                <tr key={server.id}>
                  {/* Server Name */}
                  <td className="bg0 p-3 text-center">
                    <span className={serverTypeColors[server.id] || "text-white"}>
                      {server.name.toUpperCase()}
                    </span>
                    <div className="mt-1">{getStatusBadge(server.status)}</div>
                  </td>

                  {/* Server Info */}
                  <td className="bg0 p-3">
                    <div className="text-sm space-y-1">
                      <div>
                        <span className="text-gray-400">시나리오:</span>{" "}
                        <span className="text-white">{server.scenario}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">현재:</span>{" "}
                        <span className="text-white">{server.year}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">턴 시간:</span>{" "}
                        <span className="text-white">{server.turnTime}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">참가자:</span>{" "}
                        <span className="text-white">
                          {server.players}/{server.maxPlayers}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Character Icon */}
                  <td className="bg0 p-3 text-center">
                    {server.hasCharacter ? (
                      <Users className="w-8 h-8 mx-auto text-amber-400" />
                    ) : (
                      <Users className="w-8 h-8 mx-auto text-gray-600" />
                    )}
                  </td>

                  {/* Character Name */}
                  <td className="bg0 p-3">
                    {server.hasCharacter ? (
                      <span className="text-amber-400">{server.characterName}</span>
                    ) : (
                      <span className="text-gray-500">캐릭터 없음</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="bg0 p-3 text-center">
                    {server.status === "running" || server.status === "waiting" ? (
                      server.hasCharacter ? (
                        <button
                          onClick={() => handleEnterServer(server.id)}
                          className="w-full px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded transition-colors text-sm font-semibold"
                        >
                          입장
                        </button>
                      ) : (
                        <button
                          onClick={() => handleCreateCharacter(server.id)}
                          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors text-sm font-semibold"
                        >
                          등록
                        </button>
                      )
                    ) : (
                      <span className="text-gray-500 text-sm">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={5} className="bg0 p-4 text-left text-sm">
                  <p className="text-orange-400 mb-2">
                    ★ 1명이 2개 이상의 계정을 사용하거나 타 유저의 턴을 대신 입력하는 것이 적발될
                    경우 차단 될 수 있습니다.
                  </p>
                  <p className="text-gray-300 mb-4">
                    계정은 한번 등록으로 계속 사용합니다. 각 서버 리셋시 캐릭터만 새로 생성하면
                    됩니다.
                  </p>
                  <div className="space-y-1">
                    {serverDescriptions.map((desc) => (
                      <p key={desc.name}>
                        <span className={desc.colorClass}>{desc.name}</span>
                        <span className="text-gray-300"> : {desc.desc}</span>
                      </p>
                    ))}
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Account Management Section */}
        <div>
          <div className="bg2 section_title with_border text-center">계 정 관 리</div>
          <div className="center_ordered_items with_border bg0">
            <Link
              href="/auth/account"
              className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded transition-colors"
            >
              <Settings size={18} />
              비밀번호 &amp; 전콘 &amp; 탈퇴
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded transition-colors"
            >
              <LogOut size={18} />로 그 아 웃
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
