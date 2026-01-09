"use client";

/**
 * PageChiefCenter - 사령부
 * Ported from legacy/hwe/ts/PageChiefCenter.vue
 *
 * Features:
 * - Display all officers with their reserved commands
 * - Command selection and reservation for the current officer
 * - Push/Pull commands (shift turns)
 * - View other officers' reserved commands (read-only)
 */

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { TopBackBar } from "@/components/game";
import { Button } from "@/components/ui/button";
import { trpc } from "@/utils/trpc";
import { useGeneral } from "@/contexts/GeneralContext";
import { cn } from "@/lib/utils";

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
// Types
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

interface TurnObj {
  action: string;
  brief: string;
  arg?: Record<string, unknown>;
}

interface OfficerInfo {
  no: number;
  name: string;
  officerLevel: number;
  officerLevelText: string;
  turnTime: string;
  npc: number;
  turn: Record<number, TurnObj>;
}

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
// Constants
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

const OFFICER_LEVEL_NAMES: Record<number, string> = {
  12: "군주",
  11: "군사",
  10: "태수",
  9: "일반장",
  8: "외교장",
  7: "종사관",
  6: "참모",
  5: "서기",
};

const CHIEF_LEVELS = [12, 10, 8, 6, 11, 9, 7, 5];
const MAX_CHIEF_TURN = 12;

// Available Nation Commands (Basic Set)
const NATION_COMMANDS = [
  { key: "rest", name: "휴식", cat: "일반", info: "아무것도 하지 않음" },
  { key: "reward", name: "포상", cat: "일반", info: "장수에게 금/쌀 포상" },
  { key: "dispatch", name: "발령", cat: "일반", info: "장수를 다른 도시로 발령" },
  { key: "confiscate", name: "몰수", cat: "일반", info: "장수에게서 금/쌀 몰수" },
  { key: "appoint", name: "임명", cat: "인사", info: "관직 임명" },
  { key: "dismiss", name: "해임", cat: "인사", info: "관직 해임" },
  { key: "declareWar", name: "선전포고", cat: "외교", info: "타국에 전쟁 선포" },
  { key: "proposePeace", name: "휴전제의", cat: "외교", info: "타국에 휴전 제의" },
  { key: "proposeAlliance", name: "동맹제의", cat: "외교", info: "타국에 동맹 제의" },
  { key: "proposeNonAggression", name: "불가침제의", cat: "외교", info: "타국에 불가침 제의" },
];

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
// Sub Components
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

function OfficerRow({
  level,
  officer,
  isMe,
  isSelected,
  onSelect,
}: {
  level: number;
  officer?: OfficerInfo;
  isMe: boolean;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const levelName = OFFICER_LEVEL_NAMES[level];
  const isEmpty = !officer || officer.no === 0;

  return (
    <div
      onClick={onSelect}
      className={cn(
        "grid grid-cols-[100px_60px_1fr] border-b border-zinc-800 cursor-pointer transition-colors",
        isSelected ? "bg-blue-900/30 ring-1 ring-inset ring-blue-700" : "hover:bg-zinc-800/50",
        isMe && !isSelected && "bg-cyan-900/10"
      )}
    >
      <div className="bg-zinc-900/80 p-2 flex flex-col items-center justify-center border-r border-zinc-800">
        <span className="text-[10px] text-gray-500 uppercase">{levelName}</span>
        <span
          className={cn(
            "text-sm font-bold truncate w-full text-center",
            isEmpty ? "text-zinc-700" : "text-zinc-200",
            officer?.npc === 1 && "text-zinc-500",
            officer?.npc === 5 && "text-amber-400"
          )}
        >
          {isEmpty ? "- 공석 -" : officer.name}
        </span>
      </div>

      <div className="p-2 border-r border-zinc-800 flex items-center justify-center bg-zinc-950/30">
        <span className="text-[10px] font-mono text-gray-400">
          {officer?.turnTime ? officer.turnTime.slice(11, 16) : "-"}
        </span>
      </div>

      <div className="p-1 px-2 overflow-x-auto flex items-center gap-1 scrollbar-hide">
        {Array.from({ length: MAX_CHIEF_TURN }).map((_, idx) => {
          const turn = officer?.turn?.[idx];
          const isRest = !turn || turn.action === "rest" || turn.action === "휴식";
          return (
            <div
              key={idx}
              className={cn(
                "flex-shrink-0 w-16 h-8 text-center rounded-sm flex flex-col items-center justify-center border",
                isRest
                  ? "bg-zinc-800/30 border-zinc-800 text-zinc-600"
                  : "bg-zinc-700 border-zinc-600 text-zinc-100 shadow-sm"
              )}
            >
              <span className="text-[8px] opacity-40 leading-none mb-0.5">{idx + 1}</span>
              <span className="text-[10px] truncate w-full px-1">{isRest ? "-" : turn.brief}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
// Main Component
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

export default function ChiefPage() {
  const { selectedGeneral } = useGeneral();
  const generalId = selectedGeneral?.no;

  const { data, isLoading, refetch } = trpc.getReservedNationCommand.useQuery(
    { generalId: generalId ?? 0 },
    { enabled: !!generalId }
  );

  const reserveMutation = trpc.reserveNationCommand.useMutation();
  const pushMutation = trpc.pushNationCommand.useMutation();
  const clearMutation = trpc.clearNationCommand.useMutation();
  const repeatMutation = trpc.repeatNationCommand.useMutation();

  const [selectedLevel, setSelectedLevel] = useState<number>(0);
  const [activeTurnIdx, setActiveTurnIdx] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState("일반");

  useEffect(() => {
    if (data && selectedLevel === 0) {
      setSelectedLevel(data.officerLevel >= 5 ? data.officerLevel : 12);
    }
  }, [data, selectedLevel]);

  const categories = useMemo(() => Array.from(new Set(NATION_COMMANDS.map((c) => c.cat))), []);
  const filteredCommands = useMemo(
    () => NATION_COMMANDS.filter((c) => c.cat === activeCategory),
    [activeCategory]
  );

  const handleReserve = async (action: string) => {
    if (!generalId || activeTurnIdx === null) return;
    try {
      await reserveMutation.mutateAsync({
        generalId,
        action,
        turnList: [activeTurnIdx],
        arg: {},
      });
      setActiveTurnIdx(null);
      refetch();
    } catch (e) {
      alert("예약 실패: " + e);
    }
  };

  const handlePush = async (amount: number) => {
    if (!generalId) return;
    try {
      await pushMutation.mutateAsync({ generalId, amount });
      refetch();
    } catch (e) {
      alert("변경 실패: " + e);
    }
  };

  const handleClear = async () => {
    if (!generalId || activeTurnIdx === null) return;
    try {
      await clearMutation.mutateAsync({ generalId, turnList: [activeTurnIdx] });
      setActiveTurnIdx(null);
      refetch();
    } catch (e) {
      alert("삭제 실패: " + e);
    }
  };

  const handleRepeat = async (amount: number) => {
    if (!generalId) return;
    try {
      await repeatMutation.mutateAsync({ generalId, amount });
      refetch();
    } catch (e) {
      alert("반복 실패: " + e);
    }
  };

  if (isLoading || !data) {
    return (
      <div className="bg0 min-h-screen">
        <TopBackBar title="사령부" type="normal" />
        <div className="flex items-center justify-center p-20 text-gray-500">로딩 중...</div>
      </div>
    );
  }

  const isMe = data.officerLevel === selectedLevel;
  const currentOfficer = data.chiefList[selectedLevel];

  return (
    <div className="bg0 min-h-screen text-white pb-20">
      <TopBackBar title="사령부" type="normal" reloadable onReload={() => refetch()} />

      <div className="max-w-[1000px] mx-auto p-2 md:p-4 space-y-4">
        {/* Game Env Info */}
        <div className="flex justify-between items-center text-[11px] text-zinc-500 bg-zinc-900/50 p-2 rounded-sm border border-zinc-800/50">
          <div className="flex gap-4">
            <span>
              {data.year}년 {data.month}월
            </span>
            <span>턴 간격: {data.turnTerm}분</span>
          </div>
          <div className="font-mono opacity-60">REFRESHED: {new Date().toLocaleTimeString()}</div>
        </div>

        {/* Officers List Table */}
        <div className="border border-zinc-800 bg-zinc-900 rounded-sm overflow-hidden shadow-xl">
          <div className="bg-zinc-800/80 p-2 text-center text-xs font-bold text-zinc-400 border-b border-zinc-700 uppercase tracking-widest">
            수뇌부 명령 현황
          </div>
          <div className="grid grid-cols-[100px_60px_1fr] bg-zinc-950/40 text-[10px] text-center text-gray-500 border-b border-zinc-800 uppercase">
            <div className="p-1 border-r border-zinc-800">관직/이름</div>
            <div className="p-1 border-r border-zinc-800">턴 시각</div>
            <div className="p-1">명령 예약 (1~12턴)</div>
          </div>
          {CHIEF_LEVELS.map((level) => (
            <OfficerRow
              key={level}
              level={level}
              officer={data.chiefList[level]}
              isMe={level === data.officerLevel}
              isSelected={level === selectedLevel}
              onSelect={() => setSelectedLevel(level)}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="flex gap-4 text-[10px] text-zinc-500 px-1">
          <div className="flex items-center gap-1.5 font-medium">
            <div className="w-2.5 h-2.5 bg-blue-900/40 border border-blue-700 rounded-sm" />
            <span>선택됨</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <div className="w-2.5 h-2.5 bg-cyan-900/10 border border-cyan-700/30 rounded-sm" />
            <span>내 관직</span>
          </div>
        </div>

        {/* Command Editor Panel */}
        {currentOfficer && (
          <div
            className={cn(
              "border border-zinc-800 rounded-sm overflow-hidden transition-all duration-300",
              isMe
                ? "bg-zinc-900 ring-1 ring-inset ring-cyan-900/20"
                : "bg-zinc-900/50 grayscale-[0.5] opacity-90"
            )}
          >
            {/* Editor Header */}
            <div className="bg-zinc-800/50 p-2 px-4 flex justify-between items-center border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  {OFFICER_LEVEL_NAMES[selectedLevel]}
                </span>
                <span className="text-sm font-bold text-white">{currentOfficer.name}</span>
                <span className="text-[10px] text-zinc-500 bg-zinc-950 px-1.5 py-0.5 rounded ml-2">
                  명령 편집
                </span>
              </div>
              <div className="flex gap-1.5">
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => handlePush(-1)}
                  disabled={!isMe || !data.editable}
                >
                  ← 당기기
                </Button>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => handlePush(1)}
                  disabled={!isMe || !data.editable}
                >
                  미루기 →
                </Button>
              </div>
            </div>

            {/* Turn Interaction Grid */}
            <div className="p-3 bg-zinc-950/30">
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-1.5">
                {Array.from({ length: MAX_CHIEF_TURN }).map((_, idx) => {
                  const turn = currentOfficer.turn?.[idx];
                  const isRest = !turn || turn.action === "rest" || turn.action === "휴식";
                  const isActive = activeTurnIdx === idx;

                  return (
                    <button
                      key={idx}
                      onClick={() =>
                        isMe && data.editable && setActiveTurnIdx(isActive ? null : idx)
                      }
                      className={cn(
                        "flex flex-col items-center justify-center p-1.5 rounded-sm border transition-all text-center",
                        isActive
                          ? "bg-cyan-600 border-cyan-400 ring-2 ring-cyan-500/50 scale-105 z-10"
                          : isRest
                            ? "bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-600"
                            : "bg-zinc-800 border-zinc-700 hover:border-zinc-600 text-zinc-200"
                      )}
                    >
                      <span className="text-[9px] font-mono opacity-50 mb-0.5">{idx + 1}</span>
                      <span className="text-[10px] font-bold truncate w-full">
                        {isRest ? "-" : turn.brief}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Command Picker */}
            {activeTurnIdx !== null && isMe && (
              <div className="p-4 border-t border-zinc-800 bg-zinc-900/80 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold text-zinc-400 uppercase">
                    <span className="text-cyan-400 mr-1">{activeTurnIdx + 1}턴</span> 명령 선택
                  </span>
                  <Button size="xs" variant="destructive" onClick={handleClear}>
                    명령 초기화
                  </Button>
                </div>

                {/* Tabs */}
                <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 scrollbar-hide">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={cn(
                        "px-3 py-1 text-xs font-bold rounded-sm border transition-colors whitespace-nowrap",
                        activeCategory === cat
                          ? "bg-cyan-600 border-cyan-500 text-white"
                          : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {filteredCommands.map((cmd) => (
                    <button
                      key={cmd.key}
                      onClick={() => handleReserve(cmd.key)}
                      className="text-left p-2 bg-zinc-800/60 hover:bg-zinc-700 border border-zinc-700/50 rounded-sm group transition-all"
                    >
                      <div className="text-xs font-bold text-zinc-200 group-hover:text-cyan-400">
                        {cmd.name}
                      </div>
                      <div className="text-[9px] text-zinc-500 mt-0.5 leading-tight">
                        {cmd.info}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!isMe && (
              <div className="p-3 bg-amber-950/20 border-t border-amber-900/30 text-[11px] text-amber-500 px-4">
                ⚠️ 다른 관직자의 예약 명령을 열람 중입니다. 자신의 관직(
                {OFFICER_LEVEL_NAMES[data.officerLevel]})만 수정 가능합니다.
              </div>
            )}
          </div>
        )}

        {/* Quick Utilities */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 opacity-60 hover:opacity-100 transition-opacity">
          <Button
            variant="outline"
            className="h-auto py-3 bg-zinc-900/50 border-zinc-800"
            disabled={!data.editable}
            onClick={() => handleRepeat(1)}
          >
            <div className="text-center space-y-1">
              <span className="block text-lg">♻️</span>
              <span className="block text-[10px] font-bold text-zinc-400">명령 반복</span>
            </div>
          </Button>
          <Button variant="outline" className="h-auto py-3 bg-zinc-900/50 border-zinc-800">
            <div className="text-center space-y-1">
              <span className="block text-lg">💾</span>
              <span className="block text-[10px] font-bold text-zinc-400">보관함</span>
            </div>
          </Button>
          <Button variant="outline" className="h-auto py-3 bg-zinc-900/50 border-zinc-800">
            <div className="text-center space-y-1">
              <span className="block text-lg">🕒</span>
              <span className="block text-[10px] font-bold text-zinc-400">로그 확인</span>
            </div>
          </Button>
          <Button variant="outline" className="h-auto py-3 bg-zinc-900/50 border-zinc-800">
            <div className="text-center space-y-1">
              <span className="block text-lg">📜</span>
              <span className="block text-[10px] font-bold text-zinc-400">명령 묶음</span>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
