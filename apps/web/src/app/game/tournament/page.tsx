"use client";

/**
 * PageTournament - 토너먼트
 * Ported from legacy/hwe/b_tournament.php
 *
 * Features:
 * - Tournament bracket visualization (16강 → 결승)
 * - Group phase standings (조별 예선/본선)
 * - Tournament type display (전력전, 통솔전, 일기토, 설전)
 * - Betting odds display
 * - Participation button
 */

import React, { useState, useCallback, useMemo } from "react";
import { TopBackBar } from "@/components/game";
import { Button } from "@/components/ui/button";
// import { trpc } from "@/utils/trpc"; // TODO: Enable when tournament API is ready
import { useGeneral } from "@/contexts/GeneralContext";

// ============================================================================
// Types
// ============================================================================

interface TournamentParticipant {
  no: number;
  name: string;
  npc: number;
  win: number;
  draw: number;
  lose: number;
  gl: number; // 득실
  grp: number;
  grpNo: number;
  prmt: number; // 진출 여부
  leadership: number;
  strength: number;
  intel: number;
  seq: number;
}

interface TournamentState {
  tournament: number; // 0: 없음, 1: 모집, 2-3: 예선, 4-5: 본선, 6+: 16강~결승
  phase: number;
  tnmtType: number; // 0: 전력전, 1: 통솔전, 2: 일기토, 3: 설전
  tnmtMsg: string;
  develcost: number;
  turnTerm: number;
}

type TournamentType = "total" | "leadership" | "strength" | "intel";

// ============================================================================
// Constants
// ============================================================================

const TOURNAMENT_TYPE_MAP: Record<number, { name: string; type: TournamentType; label: string }> = {
  0: { name: "전력전", type: "total", label: "종합" },
  1: { name: "통솔전", type: "leadership", label: "통솔" },
  2: { name: "일기토", type: "strength", label: "무력" },
  3: { name: "설전", type: "intel", label: "지력" },
};

const GROUP_NAMES = ["一", "二", "三", "四", "五", "六", "七", "八"];

// ============================================================================
// Utility Functions
// ============================================================================

function getTournamentStateText(state: number): string {
  switch (state) {
    case 0:
      return "토너먼트 없음";
    case 1:
      return "참가 모집중";
    case 2:
    case 3:
      return "조별 예선 진행중";
    case 4:
    case 5:
      return "조별 본선 진행중";
    case 6:
      return "16강 진행중";
    case 7:
      return "8강 진행중";
    case 8:
      return "4강 진행중";
    case 9:
      return "결승 진행중";
    case 10:
      return "토너먼트 종료";
    default:
      return "알 수 없음";
  }
}

function formatName(name: string, npc: number): React.ReactNode {
  if (!name || name === "-") return <span className="text-gray-500">-</span>;

  let color = "";
  if (npc === 6) color = "text-[#66cdaa]";
  else if (npc === 5) color = "text-[#008b8b]";
  else if (npc === 4) color = "text-[#00bfff]";
  else if (npc >= 2) color = "text-cyan-400";
  else if (npc === 1) color = "text-sky-300";

  return <span className={color}>{name}</span>;
}

function getStatValue(participant: TournamentParticipant, type: TournamentType): number {
  switch (type) {
    case "total":
      return participant.leadership + participant.strength + participant.intel;
    case "leadership":
      return participant.leadership;
    case "strength":
      return participant.strength;
    case "intel":
      return participant.intel;
  }
}

// ============================================================================
// Mock Data (TODO: Replace with actual API)
// ============================================================================

const MOCK_STATE: TournamentState = {
  tournament: 6,
  phase: 1,
  tnmtType: 2,
  tnmtMsg: "제 15회 삼모전 토너먼트입니다!",
  develcost: 100,
  turnTerm: 10,
};

// Generate mock participants for groups
function generateMockParticipants(): TournamentParticipant[] {
  const participants: TournamentParticipant[] = [];
  const names = [
    "조조",
    "유비",
    "손권",
    "여포",
    "관우",
    "장비",
    "제갈량",
    "사마의",
    "주유",
    "육손",
    "장료",
    "하후돈",
    "마초",
    "황충",
    "조운",
    "위연",
    "강유",
    "등애",
    "종회",
    "곽가",
    "순욱",
    "가후",
    "방통",
    "노숙",
    "감녕",
    "태사자",
    "허저",
    "전위",
    "서황",
    "장합",
    "우금",
    "악진",
    "이전",
    "서서",
    "방덕",
    "문추",
    "안량",
    "원소",
    "원술",
    "공손찬",
    "유표",
    "유장",
    "장로",
    "마등",
    "한수",
    "동탁",
    "이각",
    "곽사",
    "장수",
    "장각",
    "장량",
    "장보",
    "손책",
    "손견",
    "엄백호",
    "왕랑",
    "유요",
    "도겸",
    "공융",
    "진궁",
    "장막",
    "유비표",
    "손정",
    "주환",
  ];

  // 예선 그룹 (0-7), 각 8명
  for (let grp = 0; grp < 8; grp++) {
    for (let i = 0; i < 8; i++) {
      const idx = grp * 8 + i;
      participants.push({
        no: idx + 1,
        name: names[idx] || `장수${idx + 1}`,
        npc: Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 1 : 0,
        win: Math.floor(Math.random() * 7),
        draw: Math.floor(Math.random() * 3),
        lose: Math.floor(Math.random() * 7),
        gl: Math.floor(Math.random() * 20) - 10,
        grp: grp,
        grpNo: i,
        prmt: i < 4 ? 1 : 0,
        leadership: 60 + Math.floor(Math.random() * 40),
        strength: 60 + Math.floor(Math.random() * 40),
        intel: 60 + Math.floor(Math.random() * 40),
        seq: i,
      });
    }
  }

  // 본선 그룹 (10-17), 각 4명
  for (let grp = 0; grp < 8; grp++) {
    for (let i = 0; i < 4; i++) {
      const baseIdx = grp * 8 + i;
      participants.push({
        ...participants[baseIdx],
        grp: grp + 10,
        grpNo: i,
        win: Math.floor(Math.random() * 3),
        draw: Math.floor(Math.random() * 2),
        lose: Math.floor(Math.random() * 3),
        prmt: i < 2 ? 1 : 0,
      });
    }
  }

  // 16강 (grp >= 20)
  for (let i = 0; i < 16; i++) {
    participants.push({
      ...participants[i * 4],
      grp: 20,
      grpNo: i,
      win: Math.random() > 0.5 ? 1 : 0,
    });
  }

  // 8강 (grp >= 30)
  for (let i = 0; i < 8; i++) {
    participants.push({
      ...participants[i * 8],
      grp: 30,
      grpNo: i,
      win: Math.random() > 0.5 ? 1 : 0,
    });
  }

  // 4강 (grp >= 40)
  for (let i = 0; i < 4; i++) {
    participants.push({
      ...participants[i * 16],
      grp: 40,
      grpNo: i,
      win: Math.random() > 0.5 ? 1 : 0,
    });
  }

  // 결승 (grp >= 50)
  for (let i = 0; i < 2; i++) {
    participants.push({
      ...participants[i * 32],
      grp: 50,
      grpNo: i,
      win: Math.random() > 0.5 ? 1 : 0,
    });
  }

  // 우승 (grp >= 60)
  participants.push({
    ...participants[0],
    grp: 60,
    grpNo: 0,
    win: 1,
  });

  return participants;
}

const MOCK_PARTICIPANTS = generateMockParticipants();

// ============================================================================
// Sub Components
// ============================================================================

interface BracketMatchProps {
  left: TournamentParticipant | null;
  right: TournamentParticipant | null;
  winner?: TournamentParticipant | null;
}

// Exported for future use in bracket visualization
export function BracketMatch({ left, right, winner }: BracketMatchProps) {
  const leftWon = winner && left && winner.no === left.no;
  const rightWon = winner && right && winner.no === right.no;

  return (
    <div className="flex flex-col items-center text-xs">
      <div
        className={`px-2 py-0.5 border-b border-gray-600 ${leftWon ? "text-red-400 font-bold" : ""}`}
      >
        {left ? formatName(left.name, left.npc) : "-"}
      </div>
      <div className={`px-2 py-0.5 ${rightWon ? "text-red-400 font-bold" : ""}`}>
        {right ? formatName(right.name, right.npc) : "-"}
      </div>
    </div>
  );
}

interface GroupTableProps {
  groupIndex: number;
  participants: TournamentParticipant[];
  statType: TournamentType;
  statLabel: string;
  isMainRound: boolean;
}

function GroupTable({
  groupIndex,
  participants,
  statType,
  statLabel,
  isMainRound,
}: GroupTableProps) {
  const maxRows = isMainRound ? 4 : 8;
  const sorted = [...participants].sort((a, b) => {
    const aPoints = a.win * 3 + a.draw;
    const bPoints = b.win * 3 + b.draw;
    if (bPoints !== aPoints) return bPoints - aPoints;
    return b.gl - a.gl;
  });

  return (
    <table className="w-full text-xs border-collapse">
      <thead>
        <tr className="bg-black text-white">
          <td colSpan={9} className="text-center py-1">
            {GROUP_NAMES[groupIndex]}조
          </td>
        </tr>
        <tr className="bg1 text-center">
          <td className="px-1">순</td>
          <td className="px-1">장수</td>
          <td className="px-1">{statLabel}</td>
          <td className="px-1">경</td>
          <td className="px-1">승</td>
          <td className="px-1">무</td>
          <td className="px-1">패</td>
          <td className="px-1">점</td>
          <td className="px-1">득</td>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: maxRows }).map((_, idx) => {
          const p = sorted[idx];
          const games = p ? p.win + p.draw + p.lose : 0;
          const points = p ? p.win * 3 + p.draw : 0;
          const promoted = p?.prmt === 1;

          return (
            <tr
              key={idx}
              className={`text-center border-b border-gray-700 ${promoted ? "bg-cyan-900/30" : ""}`}
            >
              <td className="px-1">{idx + 1}</td>
              <td className="px-1 text-left">{p ? formatName(p.name, p.npc) : "-"}</td>
              <td className="px-1">{p ? getStatValue(p, statType) : "-"}</td>
              <td className="px-1">{p ? games : "-"}</td>
              <td className="px-1 text-green-400">{p?.win ?? "-"}</td>
              <td className="px-1 text-yellow-400">{p?.draw ?? "-"}</td>
              <td className="px-1 text-red-400">{p?.lose ?? "-"}</td>
              <td className="px-1 text-cyan-400">{p ? points : "-"}</td>
              <td className="px-1">{p?.gl ?? "-"}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function TournamentPage() {
  const { selectedGeneralId } = useGeneral();
  const [toastMessage, setToastMessage] = useState<{
    message: string;
    variant: "success" | "danger" | "warning";
  } | null>(null);

  // TODO: Replace with actual tRPC queries
  // const { data: tournamentData } = trpc.getTournamentState.useQuery();
  // const { data: participants } = trpc.getTournamentParticipants.useQuery();
  // const joinMutation = trpc.joinTournament.useMutation();

  const state = MOCK_STATE;
  const participants = MOCK_PARTICIPANTS;
  const typeInfo = TOURNAMENT_TYPE_MAP[state.tnmtType] || TOURNAMENT_TYPE_MAP[0];

  // Filter participants by group
  const getParticipantsByGroup = useCallback(
    (minGrp: number, maxGrp?: number) => {
      return participants.filter(
        (p) => p.grp >= minGrp && (maxGrp === undefined || p.grp < maxGrp)
      );
    },
    [participants]
  );

  // Get bracket participants
  const bracket16 = useMemo(
    () => getParticipantsByGroup(20, 30).sort((a, b) => a.grpNo - b.grpNo),
    [getParticipantsByGroup]
  );
  const bracket8 = useMemo(
    () => getParticipantsByGroup(30, 40).sort((a, b) => a.grpNo - b.grpNo),
    [getParticipantsByGroup]
  );
  const bracket4 = useMemo(
    () => getParticipantsByGroup(40, 50).sort((a, b) => a.grpNo - b.grpNo),
    [getParticipantsByGroup]
  );
  const bracketFinal = useMemo(
    () => getParticipantsByGroup(50, 60).sort((a, b) => a.grpNo - b.grpNo),
    [getParticipantsByGroup]
  );
  const champion = useMemo(() => getParticipantsByGroup(60)[0], [getParticipantsByGroup]);

  // Group participants
  const preliminaryGroups = useMemo(() => {
    const groups: TournamentParticipant[][] = Array.from({ length: 8 }, () => []);
    participants.filter((p) => p.grp >= 0 && p.grp < 8).forEach((p) => groups[p.grp]?.push(p));
    return groups;
  }, [participants]);

  const mainGroups = useMemo(() => {
    const groups: TournamentParticipant[][] = Array.from({ length: 8 }, () => []);
    participants
      .filter((p) => p.grp >= 10 && p.grp < 18)
      .forEach((p) => groups[p.grp - 10]?.push(p));
    return groups;
  }, [participants]);

  // Check if user can join
  const canJoin = state.tournament === 1;
  const myTournamentState = 0; // TODO: Get from API

  const handleJoin = useCallback(() => {
    if (!selectedGeneralId) {
      setToastMessage({ message: "장수를 선택해주세요.", variant: "warning" });
      return;
    }
    // TODO: Call joinMutation
    setToastMessage({ message: "토너먼트에 참가하였습니다!", variant: "success" });
  }, [selectedGeneralId]);

  const handleRefresh = useCallback(() => {
    // TODO: Refetch data
    window.location.reload();
  }, []);

  return (
    <>
      <TopBackBar title="토너먼트" type="close" reloadable onReload={handleRefresh} />

      <div className="w-full max-w-[2000px] mx-auto px-2 pb-4">
        {/* Toast Message */}
        {toastMessage && (
          <div
            className={`p-2 text-center text-sm mb-2 ${
              toastMessage.variant === "success"
                ? "bg-green-800"
                : toastMessage.variant === "danger"
                  ? "bg-red-800"
                  : "bg-yellow-800"
            }`}
          >
            {toastMessage.message}
          </div>
        )}

        {/* Header */}
        <div className="bg0 border border-gray-600 mb-4">
          <div className="p-2 flex flex-wrap gap-2 items-center justify-between">
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={handleRefresh}>
                갱신
              </Button>
              {canJoin && myTournamentState === 0 && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleJoin}
                  className="bg-cyan-700 hover:bg-cyan-600"
                >
                  참가 (금 {state.develcost})
                </Button>
              )}
            </div>
          </div>

          {/* Admin Message */}
          {state.tnmtMsg && (
            <div className="px-4 py-2 border-t border-gray-600">
              운영자 메세지: <span className="text-orange-400 text-lg">{state.tnmtMsg}</span>
            </div>
          )}

          {/* Tournament Info */}
          <div className="px-4 py-3 border-t border-gray-600 text-center">
            <span className="text-2xl">
              <span className="text-cyan-400">{typeInfo.name}</span>
              <span className="text-white ml-2">({getTournamentStateText(state.tournament)})</span>
            </span>
          </div>
        </div>

        {/* 16강 승자전 Bracket */}
        <div className="bg0 border border-gray-600 mb-4">
          <div className="bg2 p-2 text-center text-lg text-magenta-400">
            <span className="text-fuchsia-400">16강 승자전</span>
          </div>

          <div className="p-4 overflow-x-auto">
            <div className="min-w-[1000px]">
              {/* Champion */}
              <div className="flex justify-center mb-4">
                <div className="bg-yellow-900/50 border border-yellow-500 px-4 py-2 text-center">
                  <div className="text-yellow-400 text-sm mb-1">우승</div>
                  <div className="text-lg">
                    {champion ? formatName(champion.name, champion.npc) : "-"}
                  </div>
                </div>
              </div>

              {/* Finals */}
              <div className="flex justify-center gap-8 mb-4">
                {[0, 1].map((i) => (
                  <div key={i} className="text-center">
                    <div
                      className={`px-3 py-1 border ${bracketFinal[i]?.win ? "border-red-500 text-red-400" : "border-gray-600"}`}
                    >
                      {bracketFinal[i]
                        ? formatName(bracketFinal[i].name, bracketFinal[i].npc)
                        : "-"}
                    </div>
                  </div>
                ))}
              </div>

              {/* Semi-finals (4강) */}
              <div className="flex justify-center gap-4 mb-4">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="text-center">
                    <div
                      className={`px-3 py-1 border text-sm ${bracket4[i]?.win ? "border-red-500 text-red-400" : "border-gray-600"}`}
                    >
                      {bracket4[i] ? formatName(bracket4[i].name, bracket4[i].npc) : "-"}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quarter-finals (8강) */}
              <div className="flex justify-center gap-2 mb-4">
                {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div key={i} className="text-center">
                    <div
                      className={`px-2 py-1 border text-xs ${bracket8[i]?.win ? "border-red-500 text-red-400" : "border-gray-600"}`}
                    >
                      {bracket8[i] ? formatName(bracket8[i].name, bracket8[i].npc) : "-"}
                    </div>
                  </div>
                ))}
              </div>

              {/* Round of 16 (16강) */}
              <div className="flex justify-center gap-1 mb-2">
                {bracket16.map((p, i) => (
                  <div key={i} className="text-center" style={{ width: "125px" }}>
                    <div
                      className={`px-1 py-1 border text-xs truncate ${p.win ? "border-red-500 text-red-400" : "border-gray-600"}`}
                    >
                      {formatName(p.name, p.npc)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Betting Odds */}
              <div className="flex justify-center gap-1 text-xs text-sky-400">
                {bracket16.map((_, i) => (
                  <div key={i} className="text-center" style={{ width: "125px" }}>
                    {(Math.random() * 10 + 1).toFixed(1)}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-2 text-center text-sm text-sky-400 border-t border-gray-600">
            배당률이 낮을수록 베팅된 금액이 많고 유저들이 우승후보로 많이 선택한 장수입니다.
          </div>
        </div>

        {/* 조별 본선 순위 */}
        <div className="bg0 border border-gray-600 mb-4">
          <div className="bg2 p-2 text-center">
            <span className="text-orange-400 text-lg">조별 본선 순위</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-2 p-2">
            {mainGroups.map((group, idx) => (
              <GroupTable
                key={idx}
                groupIndex={idx}
                participants={group}
                statType={typeInfo.type}
                statLabel={typeInfo.label}
                isMainRound={true}
              />
            ))}
          </div>
        </div>

        {/* 조별 예선 순위 */}
        <div className="bg0 border border-gray-600 mb-4">
          <div className="bg2 p-2 text-center">
            <span className="text-yellow-400 text-lg">조별 예선 순위</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-2 p-2">
            {preliminaryGroups.map((group, idx) => (
              <GroupTable
                key={idx}
                groupIndex={idx}
                participants={group}
                statType={typeInfo.type}
                statLabel={typeInfo.label}
                isMainRound={false}
              />
            ))}
          </div>
        </div>

        {/* 규칙 설명 */}
        <div className="bg0 border border-gray-600 p-4 text-sm text-gray-300">
          <ul className="list-disc list-inside space-y-1">
            <li>예선은 홈&어웨이 풀리그로 진행됩니다. (총 14경기)</li>
            <li>상위 4명이 본선에 진출하게 되며 조추첨을 통해 조가 배정됩니다.</li>
            <li>
              각 조1위가 시드1로 랜덤하게 조에 배정되며, 역시 각 조2위가 시드2로 랜덤하게 조에
              배정됩니다.
            </li>
            <li>그후 남은 3, 4위는 완전 랜덤하게 모든 조에 랜덤하게 배정됩니다.</li>
            <li>
              본선은 개인당 3경기를 치르게 되며 승점(승3, 무1, 패0), 득실, 참가순서(시드)에 따라
              순위를 매깁니다.
            </li>
            <li>각 조 1, 2위는 16강에 지정된 위치에 배정됩니다.</li>
            <li>16강부터는 1경기 토너먼트로 진행됩니다.</li>
            <li>참가비는 금20~140이며, 성적에 따라 금과 약간의 명성이 포상으로 주어집니다.</li>
            <li>16강자 100, 8강자 300, 4강자 600, 준우승자 1200, 우승자 2000 (220년 기준)</li>
          </ul>
        </div>
      </div>
    </>
  );
}
