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

import React, { useState, useMemo, useEffect } from "react";
import { TopBackBar } from "@/components/game";
import { Button } from "@/components/ui/button";
import { trpc } from "@/utils/trpc";
import { useGeneral } from "@/contexts/GeneralContext";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, RefreshCw, Save, History, Layers } from "lucide-react";

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
        "grid grid-cols-[100px_60px_1fr] border-b border-white/5 cursor-pointer transition-all duration-300 group",
        isSelected
          ? "bg-primary/10 border-primary/20 shadow-[inset_0_0_20px_rgba(234,179,8,0.1)]"
          : "hover:bg-white/5",
        isMe && !isSelected && "bg-blue-500/5"
      )}
    >
      <div className="p-3 flex flex-col items-center justify-center border-r border-white/5 relative overflow-hidden">
        {/* Active Indicator Strip */}
        {isSelected && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary shadow-[0_0_10px_#eab308]" />
        )}

        <span
          className={cn(
            "text-[10px] uppercase tracking-wider mb-1 font-medium",
            isSelected
              ? "text-primary"
              : "text-muted-foreground group-hover:text-primary/70 transition-colors"
          )}
        >
          {levelName}
        </span>
        <span
          className={cn(
            "text-sm font-bold truncate w-full text-center",
            isEmpty ? "text-muted-foreground/50" : "text-foreground",
            officer?.npc === 1 && "text-muted-foreground",
            officer?.npc === 5 && "text-amber-400",
            isSelected &&
              !isEmpty &&
              "text-primary-foreground drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]"
          )}
        >
          {isEmpty ? "- 공석 -" : officer.name}
        </span>
      </div>

      <div className="p-2 border-r border-white/5 flex items-center justify-center bg-black/20">
        <span className="text-[10px] font-mono text-muted-foreground/70 group-hover:text-muted-foreground transition-colors">
          {officer?.turnTime ? officer.turnTime.slice(11, 16) : "-"}
        </span>
      </div>

      <div className="p-2 px-3 overflow-x-auto flex items-center gap-1.5 scrollbar-hide mask-linear-fade">
        {Array.from({ length: MAX_CHIEF_TURN }).map((_, idx) => {
          const turn = officer?.turn?.[idx];
          const isRest = !turn || turn.action === "rest" || turn.action === "휴식";
          return (
            <div
              key={idx}
              className={cn(
                "flex-shrink-0 w-16 h-8 text-center rounded flex flex-col items-center justify-center border transition-all duration-200",
                isRest
                  ? "bg-black/20 border-white/5 text-muted-foreground/40"
                  : "bg-secondary/50 border-white/10 text-foreground shadow-sm group-hover:border-white/20"
              )}
            >
              <span className="text-[8px] opacity-30 leading-none mb-0.5">{idx + 1}</span>
              <span className={cn("text-[10px] truncate w-full px-1", !isRest && "font-medium")}>
                {isRest ? "-" : turn.brief}
              </span>
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
      <div className="min-h-screen bg-background text-foreground">
        <TopBackBar title="사령부" type="normal" />
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground animate-pulse gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
          <span className="text-sm font-medium tracking-widest uppercase">
            Loading Command Center...
          </span>
        </div>
      </div>
    );
  }

  const isMe = data.officerLevel === selectedLevel;
  const currentOfficer = data.chiefList[selectedLevel];

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 relative overflow-x-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[500px] bg-primary/5 blur-[100px] rounded-full opacity-50" />
      </div>

      <TopBackBar title="사령부" type="normal" reloadable onReload={() => refetch()} />

      <div className="max-w-[1000px] mx-auto p-4 space-y-6 relative z-10">
        {/* Game Env Info */}
        <div className="glass flex justify-between items-center text-xs text-muted-foreground p-3 rounded-lg border-white/5">
          <div className="flex gap-6 items-center">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_#eab308]" />
              <span className="font-bold text-foreground">
                {data.year}년 {data.month}월
              </span>
            </div>
            <span className="bg-white/5 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider border border-white/5">
              Turn Interval: {data.turnTerm}m
            </span>
          </div>
          <div className="font-mono opacity-50 text-[10px]">
            SYNC: {new Date().toLocaleTimeString()}
          </div>
        </div>

        {/* Officers List Table */}
        <div className="glass rounded-2xl overflow-hidden shadow-2xl border-white/10 ring-1 ring-white/5">
          <div className="bg-white/5 p-3 px-4 flex justify-between items-center border-b border-white/5">
            <div className="text-sm font-bold text-primary tracking-widest uppercase flex items-center gap-2">
              <Layers className="w-4 h-4" />
              수뇌부 명령 현황
            </div>
            <div className="flex gap-4 text-[10px] text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-primary rounded-full shadow-[0_0_5px_#eab308]" />
                <span>선택됨</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-blue-500 rounded-full opacity-50" />
                <span>내 관직</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-[100px_60px_1fr] bg-black/40 text-[10px] text-center text-muted-foreground/70 border-b border-white/5 uppercase tracking-wider font-medium">
            <div className="p-2 border-r border-white/5">Rank / Name</div>
            <div className="p-2 border-r border-white/5">Last Act</div>
            <div className="p-2">Command Queue (1-12)</div>
          </div>

          <div className="divide-y divide-white/5">
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
        </div>

        {/* Command Editor Panel */}
        {currentOfficer && (
          <div
            className={cn(
              "rounded-2xl overflow-hidden transition-all duration-500 border border-white/10",
              isMe
                ? "bg-card/80 backdrop-blur-xl shadow-[0_0_40px_-10px_rgba(234,179,8,0.1)] ring-1 ring-primary/20"
                : "bg-black/40 backdrop-blur-sm grayscale-[0.8] opacity-70"
            )}
          >
            {/* Editor Header */}
            <div className="bg-gradient-to-r from-white/5 to-transparent p-4 flex justify-between items-center border-b border-white/5">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-primary uppercase tracking-widest drop-shadow-[0_0_10px_rgba(234,179,8,0.3)]">
                  {OFFICER_LEVEL_NAMES[selectedLevel]}
                </span>
                <span className="text-lg font-bold text-white tracking-tight">
                  {currentOfficer.name}
                </span>
                {isMe && (
                  <span className="text-[10px] font-bold text-black bg-primary px-2 py-0.5 rounded shadow-[0_0_10px_#eab308]">
                    EDIT MODE
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 border-white/10 bg-black/20 hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
                  onClick={() => handlePush(-1)}
                  disabled={!isMe || !data.editable}
                >
                  <ChevronLeft className="w-3 h-3 mr-1" /> 당기기
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 border-white/10 bg-black/20 hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
                  onClick={() => handlePush(1)}
                  disabled={!isMe || !data.editable}
                >
                  미루기 <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>

            {/* Turn Interaction Grid */}
            <div className="p-4 bg-black/20">
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-2">
                {Array.from({ length: MAX_CHIEF_TURN }).map((_, idx) => {
                  const turn = currentOfficer.turn?.[idx];
                  const isRest = !turn || turn.action === "rest" || turn.action === "휴식";
                  const isActive = activeTurnIdx === idx;

                  return (
                    <button
                      key={idx}
                      disabled={!isMe || !data.editable}
                      onClick={() =>
                        isMe && data.editable && setActiveTurnIdx(isActive ? null : idx)
                      }
                      className={cn(
                        "group relative flex flex-col items-center justify-center p-2 rounded-lg border transition-all duration-300 overflow-hidden",
                        isActive
                          ? "bg-primary border-primary text-black scale-105 shadow-[0_0_20px_rgba(234,179,8,0.4)] z-10"
                          : isRest
                            ? "bg-white/5 border-white/5 text-muted-foreground/50 hover:bg-white/10 hover:border-white/10"
                            : "bg-secondary/60 border-white/10 text-foreground hover:bg-secondary hover:border-white/20 hover:shadow-lg"
                      )}
                    >
                      {isActive && <div className="absolute inset-0 bg-white/20 animate-pulse" />}
                      <span
                        className={cn(
                          "text-[9px] font-mono mb-1 transition-colors",
                          isActive ? "opacity-70 text-black font-bold" : "opacity-30"
                        )}
                      >
                        {idx + 1}
                      </span>
                      <span
                        className={cn(
                          "text-[11px] font-bold truncate w-full tracking-tight",
                          isActive && "scale-105"
                        )}
                      >
                        {isRest ? "-" : turn.brief}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Command Picker */}
            {activeTurnIdx !== null && isMe && (
              <div className="p-5 border-t border-white/10 bg-gradient-to-b from-card/95 to-background animate-in slide-in-from-top-4 fade-in duration-300">
                <div className="flex justify-between items-center mb-5">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
                        Target Turn
                      </span>
                      <span className="text-xl font-bold text-primary drop-shadow-md">
                        TURN {activeTurnIdx + 1}
                      </span>
                    </div>
                    <div className="h-8 w-px bg-white/10 mx-2" />
                    <span className="text-sm text-muted-foreground">Select a command below</span>
                  </div>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleClear}
                    className="bg-red-900/20 text-red-400 border border-red-900/50 hover:bg-red-900/40 hover:text-red-300"
                  >
                    Clear Slot
                  </Button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide mask-linear-fade">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={cn(
                        "px-4 py-2 text-xs font-bold rounded-lg border transition-all duration-300 min-w-[80px]",
                        activeCategory === cat
                          ? "bg-primary text-black border-primary shadow-[0_0_15px_rgba(234,179,8,0.3)] transform -translate-y-0.5"
                          : "bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {filteredCommands.map((cmd) => (
                    <button
                      key={cmd.key}
                      onClick={() => handleReserve(cmd.key)}
                      className="group relative text-left p-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-primary/30 rounded-lg transition-all duration-300 hover:shadow-[0_0_15px_rgba(234,179,8,0.1)] hover:-translate-y-0.5 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:to-primary/5 transition-all duration-500" />
                      <div className="relative z-10">
                        <div className="text-sm font-bold text-foreground group-hover:text-primary transition-colors flex justify-between items-center">
                          {cmd.name}
                          <div className="w-1.5 h-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_5px_#eab308]" />
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-1 leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity">
                          {cmd.info}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!isMe && (
              <div className="p-4 bg-amber-950/20 border-t border-amber-900/30 flex items-start gap-3">
                <div className="mt-0.5 text-amber-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                    <path d="M12 9v4" />
                    <path d="M12 17h.01" />
                  </svg>
                </div>
                <div className="text-xs text-amber-500/90 leading-relaxed">
                  Viewing <strong>{OFFICER_LEVEL_NAMES[selectedLevel]}</strong>'s reserved commands.{" "}
                  <br />
                  You can only modify your own commands ({OFFICER_LEVEL_NAMES[data.officerLevel]}).
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Utilities */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4">
          <Button
            variant="outline"
            className="h-auto py-4 bg-card/40 border-white/5 hover:bg-primary/10 hover:border-primary/30 group transition-all duration-300"
            disabled={!data.editable}
            onClick={() => handleRepeat(1)}
          >
            <div className="text-center space-y-2">
              <RefreshCw className="w-6 h-6 mx-auto text-muted-foreground group-hover:text-primary group-hover:rotate-180 transition-all duration-500" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                  Repeat Command
                </span>
                <span className="text-[9px] text-muted-foreground/60">Fill empty slots</span>
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-auto py-4 bg-card/40 border-white/5 hover:bg-primary/10 hover:border-primary/30 group transition-all duration-300"
          >
            <div className="text-center space-y-2">
              <Save className="w-6 h-6 mx-auto text-muted-foreground group-hover:text-primary transition-colors" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                  Saved Sets
                </span>
                <span className="text-[9px] text-muted-foreground/60">Load presets</span>
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-auto py-4 bg-card/40 border-white/5 hover:bg-primary/10 hover:border-primary/30 group transition-all duration-300"
          >
            <div className="text-center space-y-2">
              <History className="w-6 h-6 mx-auto text-muted-foreground group-hover:text-primary transition-colors" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                  History Log
                </span>
                <span className="text-[9px] text-muted-foreground/60">View past actions</span>
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-auto py-4 bg-card/40 border-white/5 hover:bg-primary/10 hover:border-primary/30 group transition-all duration-300"
          >
            <div className="text-center space-y-2">
              <Layers className="w-6 h-6 mx-auto text-muted-foreground group-hover:text-primary transition-colors" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                  Batch Tool
                </span>
                <span className="text-[9px] text-muted-foreground/60">Advanced edits</span>
              </div>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
