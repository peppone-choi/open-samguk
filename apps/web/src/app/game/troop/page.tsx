"use client";

/**
 * PageTroop - 부대 편성 (Troop Management)
 * Ported from legacy/hwe/ts/PageTroop.vue
 *
 * Features:
 * - List all troops in the current nation
 * - Join / Leave / Disband troops
 * - Create new troop (if not in a troop)
 * - Kick member / Change troop name (if leader or admin)
 */

import React, { useState, useCallback, useMemo } from "react";
import { TopBackBar } from "@/components/game";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/utils/trpc";
import { useGeneral } from "@/contexts/GeneralContext";
import { useCity, useGameConst } from "@/contexts/GameConstContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ============================================================================
// Types
// ============================================================================

interface TroopMember {
  no: number;
  name: string;
  officerLevel: number;
  cityId: number;
  crew: number;
  crewType: number;
  turnTime?: string | null;
}

interface TroopInfo {
  id: number; // Leader ID
  name: string;
  nationId: number;
  leader: TroopMember | null;
  members: TroopMember[];
  memberCount: number;
  turnTime: string | null;
  reservedCommandBrief: string[];
}

// ============================================================================
// Main Component
// ============================================================================

export default function PageTroop() {
  const { selectedGeneral, selectedGeneralId, isLoading: isGeneralLoading } = useGeneral();
  useGameConst(); // Keep hook call for potential side effects

  const [newTroopName, setNewTroopName] = useState("");

  // Queries
  const {
    data: rawTroops,
    isLoading: isTroopsLoading,
    refetch,
  } = trpc.getTroops.useQuery(
    { nationId: selectedGeneral?.nationId ?? 0 },
    { enabled: !!selectedGeneral?.nationId }
  );

  const troops = useMemo(() => {
    if (!rawTroops) return undefined;
    return [...(rawTroops as TroopInfo[])].sort((a, b) => {
      if (!a.turnTime && !b.turnTime) return a.id - b.id;
      if (!a.turnTime) return 1;
      if (!b.turnTime) return -1;
      if (a.turnTime < b.turnTime) return -1;
      if (a.turnTime > b.turnTime) return 1;
      return a.id - b.id;
    });
  }, [rawTroops]);

  // Mutations
  const createTroopMutation = trpc.createTroop.useMutation();
  const joinTroopMutation = trpc.joinTroop.useMutation();
  const exitTroopMutation = trpc.exitTroop.useMutation();
  const kickFromTroopMutation = trpc.kickFromTroop.useMutation();
  const setTroopNameMutation = trpc.setTroopName.useMutation();

  // Edit states
  const [editingTroopId, setEditingTroopId] = useState<number | null>(null);
  const [editNameValue, setEditNameValue] = useState("");
  const [kickMemberId, setKickMemberId] = useState<number | null>(null);

  const loadData = useCallback(() => {
    refetch();
  }, [refetch]);

  // Actions
  const handleCreateTroop = async () => {
    if (!newTroopName.trim() || !selectedGeneralId) return;
    try {
      await createTroopMutation.mutateAsync({
        generalId: selectedGeneralId,
        name: newTroopName,
      });
      setNewTroopName("");
      toast.success(`${newTroopName} 부대를 창설했습니다.`);
      refetch();
    } catch (e: any) {
      toast.error(e.message || "부대 창설에 실패했습니다.");
    }
  };

  const handleJoin = async (id: number, troopName: string) => {
    if (!confirm(`${troopName} 부대에 가입하시겠습니까?`) || !selectedGeneralId) return;
    try {
      await joinTroopMutation.mutateAsync({
        generalId: selectedGeneralId,
        troopLeaderId: id,
      });
      toast.success(`${troopName} 부대에 가입했습니다.`);
      refetch();
    } catch (e: any) {
      toast.error(e.message || "부대 가입에 실패했습니다.");
    }
  };

  const handleLeaveOrDisband = async () => {
    if (!selectedGeneral || !selectedGeneralId) return;
    const isLeader = selectedGeneral.troopId === selectedGeneralId;
    const msg = isLeader ? "정말 부대를 해산하시겠습니까?" : "부대에서 탈퇴하시겠습니까?";

    if (!confirm(msg)) return;

    try {
      await exitTroopMutation.mutateAsync({
        generalId: selectedGeneralId,
      });
      toast.success(isLeader ? "부대를 해산했습니다." : "부대에서 탈퇴했습니다.");
      refetch();
    } catch (e: any) {
      toast.error(e.message || "처리에 실패했습니다.");
    }
  };

  const handleKick = async (_troopId: number) => {
    if (!kickMemberId || !selectedGeneralId) return;
    try {
      await kickFromTroopMutation.mutateAsync({
        leaderId: selectedGeneralId,
        targetGeneralId: kickMemberId,
      });
      toast.success("부대원을 추방했습니다.");
      setKickMemberId(null);
      refetch();
    } catch (e: any) {
      toast.error(e.message || "추방에 실패했습니다.");
    }
  };

  const handleUpdateName = async (troopId: number) => {
    if (!selectedGeneralId) return;
    try {
      await setTroopNameMutation.mutateAsync({
        leaderId: troopId, // Note: Mutation expects leaderId of the troop
        name: editNameValue,
      });
      toast.success("부대명을 변경했습니다.");
      setEditingTroopId(null);
      refetch();
    } catch (e: any) {
      toast.error(e.message || "명칭 변경에 실패했습니다.");
    }
  };

  if (isGeneralLoading || (isTroopsLoading && !troops)) {
    return (
      <div className="min-h-screen bg0 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const myGeneralId = selectedGeneralId ?? 0;
  const myTroopId = selectedGeneral?.troopId ?? 0;

  return (
    <div className="min-h-screen bg0">
      <TopBackBar title="부대 편성" reloadable onReload={loadData} />

      <div className="w-full max-w-[1000px] mx-auto border border-gray-600 bg0 md:p-2 min-h-[calc(100vh-60px)] flex flex-col">
        {/* Helper Text */}
        <div className="p-3 text-sm text-gray-400 bg-zinc-900/50 border-b border-gray-700">
          * 부대장은 부대원을 추방하거나 부대명을 변경할 수 있습니다.
          <br />* 같은 도시, 같은 턴의 부대원들과 함께 이동하거나 전투할 수 있습니다.
        </div>

        {/* Troop List */}
        <div className="flex-1 space-y-4 p-4">
          {!troops || troops.length === 0 ? (
            <div className="text-center py-12 text-gray-500 border border-dashed border-gray-700 rounded-lg">
              현재 세력 내에 생성된 부대가 없습니다.
            </div>
          ) : (
            troops.map((troop) => (
              <TroopItem
                key={troop.id}
                troop={troop}
                myGeneralId={myGeneralId}
                myTroopId={myTroopId}
                onJoin={handleJoin}
                onLeaveOrDisband={handleLeaveOrDisband}
                onKick={handleKick}
                onUpdateName={handleUpdateName}
                editingTroopId={editingTroopId}
                setEditingTroopId={setEditingTroopId}
                editNameValue={editNameValue}
                setEditNameValue={setEditNameValue}
                kickMemberId={kickMemberId}
                setKickMemberId={setKickMemberId}
                myPermission={selectedGeneral?.officerLevel ?? 0}
              />
            ))
          )}
        </div>

        {/* Create Troop Section */}
        {myTroopId === 0 && (
          <div className="sticky bottom-0 p-4 border-t border-gray-600 bg-zinc-950/90 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-center max-w-2xl mx-auto">
              <div className="font-bold whitespace-nowrap">신규 부대 창설</div>
              <Input
                className="flex-1 bg-zinc-800 border-gray-600 focus:border-primary"
                placeholder="새 부대 이름을 입력하세요"
                value={newTroopName}
                onChange={(e) => setNewTroopName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateTroop()}
              />
              <Button
                onClick={handleCreateTroop}
                disabled={!newTroopName.trim() || createTroopMutation.isLoading}
              >
                {createTroopMutation.isLoading ? "창설 중..." : "창설하기"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface TroopItemProps {
  troop: TroopInfo;
  myGeneralId: number;
  myTroopId: number;
  onJoin: (id: number, name: string) => void;
  onLeaveOrDisband: () => void;
  onKick: (id: number) => void;
  onUpdateName: (id: number) => void;
  editingTroopId: number | null;
  setEditingTroopId: (id: number | null) => void;
  editNameValue: string;
  setEditNameValue: (val: string) => void;
  kickMemberId: number | null;
  setKickMemberId: (id: number | null) => void;
  myPermission: number;
}

function TroopItem({
  troop,
  myGeneralId,
  myTroopId,
  onJoin,
  onLeaveOrDisband,
  onKick,
  onUpdateName,
  editingTroopId,
  setEditingTroopId,
  editNameValue,
  setEditNameValue,
  kickMemberId,
  setKickMemberId,
  myPermission,
}: TroopItemProps) {
  const isMyTroop = myTroopId === troop.id;
  const isLeader = troop.id === myGeneralId;
  const leaderCity = useCity(troop.leader?.cityId ?? 0);

  return (
    <div
      className={cn(
        "border border-gray-600 bg-zinc-900 rounded-lg overflow-hidden transition-all",
        isMyTroop && "ring-1 ring-primary border-primary shadow-[0_0_15px_rgba(var(--primary),0.1)]"
      )}
    >
      <div className="grid md:grid-cols-[160px_100px_100px_1fr_180px] grid-cols-1 divide-y md:divide-y-0 md:divide-x divide-gray-700">
        {/* Troop Title (Group 1) */}
        <div className="bg-zinc-800/50 p-3 flex flex-col justify-center text-center">
          <div className="font-bold text-lg text-primary">{troop.name}</div>
          <div className="text-xs text-secondary mt-1">【 {leaderCity?.name ?? "???"} 】</div>
        </div>

        {/* Turn Time */}
        <div className="hidden md:flex flex-col justify-center items-center p-3 text-center bg-zinc-900/30">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">다음 턴</div>
          <div className="font-mono text-lg font-semibold text-yellow-500">
            {troop.turnTime ? troop.turnTime.slice(11, 16) : "--:--"}
          </div>
        </div>

        {/* Leader Info */}
        <div className="p-3 flex flex-col items-center justify-center bg-zinc-800/20">
          <div className="w-14 h-14 bg-zinc-700 rounded-full flex items-center justify-center mb-2 border-2 border-zinc-600 overflow-hidden shadow-inner">
            <span className="text-2xl font-bold text-white leading-none">
              {troop.leader?.name?.charAt(0) ?? "?"}
            </span>
          </div>
          <div className="text-xs font-medium text-zinc-300 truncate w-full text-center">
            {troop.leader?.name ?? "..."}
          </div>
        </div>

        {/* Middle Area: Reserved commands + Members */}
        <div className="p-3 flex flex-col gap-3 min-w-0">
          {/* Members List */}
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-[10px] text-gray-500 font-medium block w-full uppercase tracking-tighter mb-1">
              부대원 리스트 ({troop.memberCount}명)
            </span>
            {troop.members.map((member) => (
              <MemberItem
                key={member.no}
                member={member}
                isLeader={member.no === troop.id}
                leaderCityId={troop.leader?.cityId ?? 0}
              />
            ))}
          </div>

          {/* Reserved Commands Bar */}
          {troop.reservedCommandBrief && troop.reservedCommandBrief.length > 0 && (
            <div className="flex gap-2 items-center text-[11px] bg-zinc-950/50 p-1.5 rounded border border-zinc-800">
              <span className="text-gray-500 font-bold whitespace-nowrap">예약:</span>
              <div className="flex gap-2 min-w-0 overflow-hidden">
                {troop.reservedCommandBrief.slice(0, 3).map((cmd, idx) => (
                  <div key={idx} className="truncate text-zinc-400">
                    <span className="text-zinc-600 mr-1">{idx + 1}.</span>
                    {cmd}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions Area */}
        <div className="p-3 bg-zinc-800/40 flex flex-col gap-2 justify-center">
          {!isMyTroop && !myTroopId && (
            <Button size="sm" className="w-full" onClick={() => onJoin(troop.id, troop.name)}>
              부대 가입
            </Button>
          )}

          {isMyTroop && (
            <Button size="sm" variant="destructive" className="w-full" onClick={onLeaveOrDisband}>
              {isLeader ? "부대 해산" : "부대 탈퇴"}
            </Button>
          )}

          {(isLeader || myPermission >= 4) && (
            <div className="space-y-2 pt-2 border-t border-zinc-700">
              {/* Name Editor */}
              {editingTroopId === troop.id ? (
                <div className="space-y-1">
                  <Input
                    className="h-8 text-xs bg-zinc-950 border-zinc-700"
                    value={editNameValue}
                    onChange={(e) => setEditNameValue(e.target.value)}
                    autoFocus
                  />
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      className="h-7 flex-1 text-[10px]"
                      onClick={() => onUpdateName(troop.id)}
                    >
                      저장
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 flex-1 text-[10px]"
                      onClick={() => setEditingTroopId(null)}
                    >
                      취소
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full h-8 text-[11px]"
                  onClick={() => {
                    setEditingTroopId(troop.id);
                    setEditNameValue(troop.name);
                  }}
                >
                  부대명 변경
                </Button>
              )}

              {/* Kick Member */}
              {isLeader && troop.memberCount > 1 && (
                <div className="flex gap-1 items-center">
                  <select
                    className="bg-zinc-800 border border-zinc-700 text-[10px] h-8 rounded px-2 flex-1 min-w-0 appearance-none"
                    onChange={(e) => setKickMemberId(Number(e.target.value))}
                    value={kickMemberId || ""}
                  >
                    <option value="">멤버 추방...</option>
                    {troop.members
                      .filter((m) => m.no !== troop.id)
                      .map((m) => (
                        <option key={m.no} value={m.no}>
                          {m.name}
                        </option>
                      ))}
                  </select>
                  {kickMemberId && (
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-8 px-2"
                      onClick={() => onKick(troop.id)}
                    >
                      추방
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MemberItem({
  member,
  isLeader,
  leaderCityId,
}: {
  member: TroopMember;
  isLeader: boolean;
  leaderCityId: number;
}) {
  const memberCity = useCity(member.cityId);
  const isDiffCity = member.cityId !== leaderCityId;

  return (
    <span
      className={cn(
        "px-2.5 py-1 rounded text-[11px] border transition-colors relative group whitespace-nowrap",
        isLeader
          ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/30 font-bold"
          : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500",
        isDiffCity && !isLeader && "text-red-400 border-red-900/50 bg-red-950/10"
      )}
    >
      {isLeader && <span className="mr-1 inline-block w-2 h-2 rounded-full bg-yellow-500" />}
      {member.name}
      {isDiffCity && !isLeader && (
        <span className="ml-1 text-[9px] opacity-60">({memberCity?.name ?? "..."})</span>
      )}

      {/* Tooltip-like detail on hover */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 hidden group-hover:block bg-zinc-950 border border-zinc-800 p-2 rounded shadow-xl z-10 text-center">
        <div className="text-zinc-50 font-bold mb-1">{member.name}</div>
        <div className="text-[10px] text-zinc-500">도시: {memberCity?.name ?? "???"}</div>
        <div className="text-[10px] text-zinc-500">병력: {member.crew.toLocaleString()}</div>
        <div className="w-2 h-2 bg-zinc-950 border-r border-b border-zinc-800 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2"></div>
      </div>
    </span>
  );
}
