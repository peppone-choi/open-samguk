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
  if (!name || name === "-") return <span className="text-muted-foreground/50">-</span>;

  let color = "text-foreground";
  if (npc === 6) color = "text-emerald-400 font-bold drop-shadow-sm";
  else if (npc === 5) color = "text-teal-400 font-medium";
  else if (npc === 4) color = "text-cyan-400";
  else if (npc >= 2) color = "text-sky-400";
  else if (npc === 1) color = "text-blue-300";

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
    <div className="flex flex-col items-center text-xs w-full max-w-[140px] bg-black/40 border border-white/10 rounded overflow-hidden">
      <div
        className={`w-full px-2 py-1.5 flex justify-between items-center border-b border-white/5 ${
          leftWon
            ? "bg-amber-500/20 text-amber-200 font-bold shadow-[inset_0_0_10px_rgba(245,158,11,0.1)]"
            : "text-muted-foreground"
        }`}
      >
        <span className="truncate">{left ? formatName(left.name, left.npc) : "-"}</span>
      </div>
      <div
        className={`w-full px-2 py-1.5 flex justify-between items-center ${
          rightWon
            ? "bg-amber-500/20 text-amber-200 font-bold shadow-[inset_0_0_10px_rgba(245,158,11,0.1)]"
            : "text-muted-foreground"
        }`}
      >
        <span className="truncate">{right ? formatName(right.name, right.npc) : "-"}</span>
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
    <div className="bg-card/30 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden shadow-lg">
      <div className="bg-gradient-to-r from-white/10 to-transparent px-3 py-2 border-b border-white/10 flex items-center justify-between">
        <span className="font-bold text-amber-500/90 text-sm">Group {GROUP_NAMES[groupIndex]}</span>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-black/20 text-muted-foreground border-b border-white/5">
            <th className="py-2 px-1 font-medium w-6">#</th>
            <th className="py-2 px-1 font-medium text-left">General</th>
            <th className="py-2 px-1 font-medium w-8 text-center">{statLabel}</th>
            <th className="py-2 px-1 font-medium w-6 text-center">G</th>
            <th className="py-2 px-1 font-medium w-6 text-center text-emerald-500/70">W</th>
            <th className="py-2 px-1 font-medium w-6 text-center text-yellow-500/70">D</th>
            <th className="py-2 px-1 font-medium w-6 text-center text-rose-500/70">L</th>
            <th className="py-2 px-1 font-medium w-8 text-center text-cyan-400">Pt</th>
            <th className="py-2 px-1 font-medium w-8 text-center text-muted-foreground/50">+/-</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {Array.from({ length: maxRows }).map((_, idx) => {
            const p = sorted[idx];
            const games = p ? p.win + p.draw + p.lose : 0;
            const points = p ? p.win * 3 + p.draw : 0;
            const promoted = p?.prmt === 1;

            return (
              <tr
                key={idx}
                className={`transition-colors hover:bg-white/5 ${
                  promoted ? "bg-amber-500/5 relative" : ""
                }`}
              >
                <td className="px-1 py-1.5 text-center text-muted-foreground/70 relative">
                  {promoted && (
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                  )}
                  {idx + 1}
                </td>
                <td className="px-1 py-1.5 text-left font-medium">
                  {p ? formatName(p.name, p.npc) : "-"}
                </td>
                <td className="px-1 py-1.5 text-center text-muted-foreground">
                  {p ? getStatValue(p, statType) : "-"}
                </td>
                <td className="px-1 py-1.5 text-center text-muted-foreground">{p ? games : "-"}</td>
                <td className="px-1 py-1.5 text-center text-emerald-400 font-medium">
                  {p?.win ?? "-"}
                </td>
                <td className="px-1 py-1.5 text-center text-amber-400/80 font-medium">
                  {p?.draw ?? "-"}
                </td>
                <td className="px-1 py-1.5 text-center text-rose-400 font-medium">
                  {p?.lose ?? "-"}
                </td>
                <td className="px-1 py-1.5 text-center text-cyan-400 font-bold text-shadow-sm">
                  {p ? points : "-"}
                </td>
                <td className="px-1 py-1.5 text-center text-muted-foreground/50">{p?.gl ?? "-"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
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

      <div className="w-full max-w-[2000px] mx-auto px-4 pb-8 space-y-6 font-sans">
        {toastMessage && (
          <div
            className={`p-4 rounded-xl border flex items-center gap-3 shadow-lg backdrop-blur-md animate-in slide-in-from-top-2 ${
              toastMessage.variant === "success"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-200"
                : toastMessage.variant === "danger"
                  ? "bg-rose-500/10 border-rose-500/20 text-rose-200"
                  : "bg-amber-500/10 border-amber-500/20 text-amber-200"
            }`}
          >
            {toastMessage.message}
          </div>
        )}

        <div className="relative overflow-hidden rounded-2xl bg-card/60 backdrop-blur-xl border border-white/10 shadow-2xl p-6">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl font-black italic tracking-tighter text-white drop-shadow-sm mb-2">
                <span className="bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent">
                  {typeInfo.name}
                </span>
                <span className="text-white/20 ml-2 not-italic text-2xl font-normal">
                  Tournament
                </span>
              </h1>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-muted-foreground uppercase tracking-wider font-medium">
                  {getTournamentStateText(state.tournament)}
                </span>
                <span className="text-muted-foreground/50 text-xs">Phase {state.phase}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleRefresh}
                className="bg-white/5 hover:bg-white/10 border-white/10 text-muted-foreground"
              >
                갱신
              </Button>
              {canJoin && myTournamentState === 0 && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleJoin}
                  className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-bold border-0 shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all hover:shadow-[0_0_25px_rgba(245,158,11,0.5)]"
                >
                  참가 (금 {state.develcost})
                </Button>
              )}
            </div>
          </div>

          {state.tnmtMsg && (
            <div className="mt-6 p-4 rounded-xl bg-amber-500/5 border-l-2 border-amber-500/50 flex gap-4 items-start relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent pointer-events-none" />
              <span className="text-amber-500 font-bold text-xs tracking-widest uppercase py-1">
                Notice
              </span>
              <span className="text-amber-100/90 text-sm leading-relaxed">{state.tnmtMsg}</span>
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-card/40 backdrop-blur-sm border border-white/10 p-1 pb-6 overflow-hidden relative">
          <div className="px-6 py-4 border-b border-white/5 mb-8 bg-black/20 flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="w-1 h-5 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
              Tournament Bracket
            </h2>
            <span className="text-xs text-muted-foreground uppercase tracking-widest">
              Final Stage
            </span>
          </div>

          <div className="px-4 overflow-x-auto custom-scrollbar pb-4">
            <div className="min-w-[1200px] flex flex-col items-center">
              <div className="flex justify-center mb-12 relative group">
                <div className="absolute inset-0 bg-amber-500/20 blur-[60px] rounded-full opacity-50 group-hover:opacity-75 transition-opacity duration-1000" />
                <div className="relative bg-gradient-to-b from-amber-900/80 to-black border border-amber-500/60 px-10 py-5 rounded-2xl text-center shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                  <div className="text-amber-400 text-[10px] font-bold tracking-[0.3em] uppercase mb-2">
                    Grand Champion
                  </div>
                  <div className="text-3xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    {champion ? (
                      formatName(champion.name, champion.npc)
                    ) : (
                      <span className="text-white/20">-</span>
                    )}
                  </div>
                  {champion && (
                    <div className="absolute -top-3 -right-3 text-2xl animate-bounce">👑</div>
                  )}
                </div>
                <div className="absolute top-full left-1/2 w-px h-12 bg-gradient-to-b from-amber-500/60 to-transparent" />
              </div>

              <div className="flex justify-center gap-32 mb-10 relative">
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-64 h-8 border-t border-r border-l border-white/10 rounded-t-xl pointer-events-none -mt-6" />

                {[0, 1].map((i) => (
                  <div key={i} className="text-center relative">
                    <div
                      className={`w-40 py-2.5 px-3 rounded border backdrop-blur-md transition-all duration-300 ${
                        bracketFinal[i]?.win
                          ? "bg-amber-500/10 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.1)] scale-105 z-10"
                          : "bg-black/40 border-white/10 text-muted-foreground"
                      }`}
                    >
                      <div className="text-sm font-medium truncate">
                        {bracketFinal[i]
                          ? formatName(bracketFinal[i].name, bracketFinal[i].npc)
                          : "-"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center gap-10 mb-8">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="text-center">
                    <div
                      className={`w-36 py-2 px-2 rounded border text-sm transition-all ${
                        bracket4[i]?.win
                          ? "bg-amber-500/5 border-amber-500/30 text-amber-100/90"
                          : "bg-black/30 border-white/10 text-muted-foreground"
                      }`}
                    >
                      <div className="truncate">
                        {bracket4[i] ? formatName(bracket4[i].name, bracket4[i].npc) : "-"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center gap-4 mb-6">
                {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div key={i} className="text-center">
                    <div
                      className={`w-32 py-1.5 px-2 rounded border text-xs transition-all ${
                        bracket8[i]?.win
                          ? "bg-amber-500/5 border-amber-500/20 text-amber-100/80"
                          : "bg-black/20 border-white/5 text-muted-foreground/70"
                      }`}
                    >
                      <div className="truncate">
                        {bracket8[i] ? formatName(bracket8[i].name, bracket8[i].npc) : "-"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center gap-2 mb-3">
                {bracket16.map((p, i) => (
                  <div key={i} className="text-center w-[125px]">
                    <div
                      className={`py-1.5 px-2 rounded border text-xs truncate transition-all ${
                        p.win
                          ? "bg-amber-500/5 border-amber-500/20 text-amber-100/80 font-medium"
                          : "bg-black/20 border-white/5 text-muted-foreground/60"
                      }`}
                    >
                      {formatName(p.name, p.npc)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center gap-2 text-[10px] font-mono tracking-tight">
                {bracket16.map((_, i) => (
                  <div key={i} className="text-center w-[125px] flex justify-center">
                    <span className="bg-cyan-950/30 text-cyan-400/80 px-2 py-0.5 rounded border border-cyan-500/10">
                      x{(Math.random() * 10 + 1).toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 text-center text-xs text-muted-foreground/60 border-t border-white/5 bg-black/20 backdrop-blur-md">
            배당률이 낮을수록 베팅된 금액이 많고 유저들이 우승후보로 많이 선택한 장수입니다.
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent flex-1" />
            <h3 className="text-xl font-bold text-amber-100/80 drop-shadow-sm uppercase tracking-widest text-center">
              Main Round Groups
            </h3>
            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent flex-1" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
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

        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-3 px-2">
            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent flex-1" />
            <h3 className="text-xl font-bold text-muted-foreground/60 drop-shadow-sm uppercase tracking-widest text-center">
              Preliminary Groups
            </h3>
            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent flex-1" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
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

        <div className="rounded-xl bg-card/20 border border-white/5 p-6 text-sm text-muted-foreground">
          <h4 className="font-bold text-foreground mb-4 uppercase tracking-wider text-xs">
            Tournament Rules
          </h4>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 list-none">
            {[
              "예선은 홈&어웨이 풀리그로 진행됩니다. (총 14경기)",
              "상위 4명이 본선에 진출하게 되며 조추첨을 통해 조가 배정됩니다.",
              "각 조1위가 시드1로, 각 조2위가 시드2로 랜덤하게 조에 배정됩니다.",
              "남은 3, 4위는 완전 랜덤하게 모든 조에 배정됩니다.",
              "본선은 개인당 3경기를 치르며 승점(승3, 무1, 패0), 득실, 시드 순으로 순위를 매깁니다.",
              "각 조 1, 2위는 16강에 지정된 위치에 배정됩니다.",
              "16강부터는 1경기 토너먼트로 진행됩니다.",
              "참가비는 금20~140이며, 성적에 따라 금과 명성이 포상으로 주어집니다.",
              "상금: 16강(100), 8강(300), 4강(600), 준우승(1200), 우승(2000)",
            ].map((rule, i) => (
              <li key={i} className="flex gap-2 items-start">
                <span className="text-amber-500/50 mt-1.5 text-[8px]">●</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
