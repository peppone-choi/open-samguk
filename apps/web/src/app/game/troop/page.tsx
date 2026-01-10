"use client";

import React, { useState, useCallback, useMemo } from "react";
import { TopBackBar } from "@/components/game";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/utils/trpc";
import { useGeneral } from "@/contexts/GeneralContext";
import { useCity, useGameConst } from "@/contexts/GameConstContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
  id: number;
  name: string;
  nationId: number;
  leader: TroopMember | null;
  members: TroopMember[];
  memberCount: number;
  turnTime: string | null;
  reservedCommandBrief: string[];
}

export default function PageTroop() {
  const { selectedGeneral, selectedGeneralId, isLoading: isGeneralLoading } = useGeneral();
  useGameConst();

  const [newTroopName, setNewTroopName] = useState("");

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

  const createTroopMutation = trpc.createTroop.useMutation();
  const joinTroopMutation = trpc.joinTroop.useMutation();
  const exitTroopMutation = trpc.exitTroop.useMutation();
  const kickFromTroopMutation = trpc.kickFromTroop.useMutation();
  const setTroopNameMutation = trpc.setTroopName.useMutation();

  const [editingTroopId, setEditingTroopId] = useState<number | null>(null);
  const [editNameValue, setEditNameValue] = useState("");
  const [kickMemberId, setKickMemberId] = useState<number | null>(null);

  const loadData = useCallback(() => {
    refetch();
  }, [refetch]);

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
        leaderId: troopId,
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]"></div>
      </div>
    );
  }

  const myGeneralId = selectedGeneralId ?? 0;
  const myTroopId = selectedGeneral?.troopId ?? 0;

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <TopBackBar title="부대 편성" reloadable onReload={loadData} />

      <div className="w-full max-w-5xl mx-auto md:p-6 p-2 space-y-6 animate-fadeIn">
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 backdrop-blur-sm shadow-lg">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-primary/10 mt-0.5">
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
                className="text-primary"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
            </div>
            <div className="text-sm text-muted-foreground/90 space-y-1">
              <p className="text-foreground/90 font-medium mb-1">도움말</p>
              <p>• 부대장은 부대원을 추방하거나 부대명을 변경할 수 있습니다.</p>
              <p>• 같은 도시, 같은 턴의 부대원들과 함께 이동하거나 전투할 수 있습니다.</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {!troops || troops.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border-2 border-dashed border-white/10 rounded-2xl bg-white/5 backdrop-blur-sm">
              <div className="text-4xl mb-4 opacity-20">🛡️</div>
              <p>현재 세력 내에 생성된 부대가 없습니다.</p>
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
      </div>

      {myTroopId === 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-background/80 backdrop-blur-xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-40">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-center max-w-2xl mx-auto w-full">
            <div className="font-bold whitespace-nowrap text-primary flex items-center gap-2">
              <span className="text-lg">⚔️</span> 신규 부대 창설
            </div>
            <div className="flex-1 w-full flex gap-2">
              <Input
                className="flex-1 bg-white/5 border-white/10 focus:border-primary/50 text-foreground placeholder:text-muted-foreground/50 h-11"
                placeholder="멋진 부대 이름을 입력하세요"
                value={newTroopName}
                onChange={(e) => setNewTroopName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateTroop()}
              />
              <Button
                onClick={handleCreateTroop}
                disabled={!newTroopName.trim() || createTroopMutation.isLoading}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-11 px-6 shadow-[0_0_20px_rgba(var(--primary),0.3)]"
              >
                {createTroopMutation.isLoading ? "창설 중..." : "창설하기"}
              </Button>
            </div>
          </div>
        </div>
      )}
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
        "group relative overflow-hidden rounded-xl transition-all duration-300",
        "bg-card/60 backdrop-blur-xl border border-white/10 shadow-lg",
        isMyTroop
          ? "border-primary/50 shadow-[0_0_30px_rgba(var(--primary),0.15)] bg-gradient-to-br from-primary/5 to-transparent"
          : "hover:border-white/20 hover:shadow-xl hover:bg-card/80"
      )}
    >
      <div
        className={cn(
          "absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-[80px] pointer-events-none transition-opacity",
          isMyTroop ? "opacity-40" : "opacity-0 group-hover:opacity-20"
        )}
      />

      <div className="grid md:grid-cols-[180px_100px_120px_1fr_200px] grid-cols-1 divide-y md:divide-y-0 md:divide-x divide-white/10 relative z-10">
        <div className="bg-gradient-to-br from-white/5 to-transparent p-5 flex flex-col justify-center text-center relative group-hover:from-white/10 transition-colors">
          <div className="font-bold text-xl text-primary drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
            {troop.name}
          </div>
          <div className="text-xs text-muted-foreground mt-2 flex items-center justify-center gap-1.5 bg-black/40 py-1 px-2 rounded-full mx-auto w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            {leaderCity?.name ?? "???"}
          </div>
        </div>

        <div className="hidden md:flex flex-col justify-center items-center p-3 text-center bg-black/20">
          <div className="text-[10px] text-muted-foreground/70 uppercase tracking-widest mb-1.5">
            NEXT TURN
          </div>
          <div className="font-mono text-lg font-bold text-primary tabular-nums tracking-tight">
            {troop.turnTime ? troop.turnTime.slice(11, 16) : "--:--"}
          </div>
        </div>

        <div className="p-4 flex flex-col items-center justify-center bg-white/5">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mb-2 overflow-hidden shadow-[0_0_15px_rgba(var(--primary),0.2)] bg-gradient-to-br from-zinc-800 to-zinc-950 border border-primary/30 relative">
            <span className="text-2xl font-bold text-primary leading-none relative z-10">
              {troop.leader?.name?.charAt(0) ?? "?"}
            </span>
            <div className="absolute inset-0 bg-primary/10 mix-blend-overlay"></div>
          </div>
          <div className="text-xs font-medium text-foreground/90 truncate w-full text-center px-2">
            {troop.leader?.name ?? "..."}
          </div>
        </div>

        <div className="p-4 flex flex-col justify-center gap-3 min-w-0 bg-transparent">
          <div>
            <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
              <span className="w-1 h-3 bg-primary/50 rounded-full"></span>
              SQUAD MEMBERS ({troop.memberCount})
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              {troop.members.map((member) => (
                <MemberItem
                  key={member.no}
                  member={member}
                  isLeader={member.no === troop.id}
                  leaderCityId={troop.leader?.cityId ?? 0}
                />
              ))}
            </div>
          </div>

          {troop.reservedCommandBrief && troop.reservedCommandBrief.length > 0 && (
            <div className="mt-1">
              <div className="flex gap-2 items-center text-[11px] bg-black/30 p-2 rounded-lg border border-white/5">
                <span className="text-primary/70 font-bold whitespace-nowrap px-1">Orders:</span>
                <div className="flex gap-3 min-w-0 overflow-hidden">
                  {troop.reservedCommandBrief.slice(0, 3).map((cmd, idx) => (
                    <div key={idx} className="truncate text-muted-foreground flex items-center">
                      <span className="text-primary/40 mr-1 font-mono">{idx + 1}.</span>
                      {cmd}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-black/20 flex flex-col gap-2 justify-center backdrop-blur-sm">
          {!isMyTroop && !myTroopId && (
            <Button
              size="sm"
              className="w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 hover:border-primary/50 shadow-[0_0_10px_rgba(var(--primary),0.05)] transition-all"
              onClick={() => onJoin(troop.id, troop.name)}
            >
              부대 가입
            </Button>
          )}

          {isMyTroop && (
            <Button
              size="sm"
              variant="destructive"
              className="w-full bg-red-950/30 hover:bg-red-900/50 text-red-400 border border-red-900/50"
              onClick={onLeaveOrDisband}
            >
              {isLeader ? "부대 해산" : "부대 탈퇴"}
            </Button>
          )}

          {(isLeader || myPermission >= 4) && (
            <div className="space-y-2 pt-3 border-t border-white/5">
              {editingTroopId === troop.id ? (
                <div className="space-y-2">
                  <Input
                    className="h-8 text-xs bg-black/50 border-white/10 focus:border-primary/50"
                    value={editNameValue}
                    onChange={(e) => setEditNameValue(e.target.value)}
                    autoFocus
                  />
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      className="h-7 flex-1 text-[10px] bg-primary/80 hover:bg-primary text-primary-foreground"
                      onClick={() => onUpdateName(troop.id)}
                    >
                      저장
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 flex-1 text-[10px] hover:bg-white/10"
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
                  className="w-full h-8 text-[11px] bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-muted-foreground"
                  onClick={() => {
                    setEditingTroopId(troop.id);
                    setEditNameValue(troop.name);
                  }}
                >
                  부대명 변경
                </Button>
              )}

              {isLeader && troop.memberCount > 1 && (
                <div className="flex gap-1 items-center">
                  <div className="relative flex-1">
                    <select
                      className="w-full bg-black/50 border border-white/10 text-[10px] h-8 rounded px-2 appearance-none text-muted-foreground focus:border-primary/50 outline-none"
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
                  </div>
                  {kickMemberId && (
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-8 px-2 bg-red-950/30 hover:bg-red-900/50 text-red-400 border border-red-900/50"
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
        "px-3 py-1.5 rounded-md text-[11px] border transition-all relative group whitespace-nowrap cursor-default select-none",
        isLeader
          ? "bg-primary/20 text-primary border-primary/30 font-bold shadow-[0_0_10px_rgba(var(--primary),0.1)]"
          : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10 hover:border-white/20 hover:text-foreground",
        isDiffCity && !isLeader && "text-red-400 border-red-900/30 bg-red-950/10"
      )}
    >
      <div className="flex items-center gap-1.5">
        {isLeader && (
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_5px_var(--primary)]" />
        )}
        {member.name}
        {isDiffCity && !isLeader && (
          <span className="text-[9px] opacity-60 ml-0.5">({memberCity?.name ?? "..."})</span>
        )}
      </div>

      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-40 hidden group-hover:block z-50 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-popover/95 backdrop-blur-xl border border-white/10 p-3 rounded-xl shadow-2xl text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
          <div className="text-primary font-bold mb-1.5 text-sm">{member.name}</div>
          <div className="space-y-1">
            <div className="text-[10px] text-muted-foreground flex justify-between px-2">
              <span>위치:</span>
              <span className="text-foreground">{memberCity?.name ?? "???"}</span>
            </div>
            <div className="text-[10px] text-muted-foreground flex justify-between px-2">
              <span>병력:</span>
              <span className="text-foreground font-mono">{member.crew.toLocaleString()}</span>
            </div>
          </div>
          <div className="w-3 h-3 bg-popover/95 border-r border-b border-white/10 rotate-45 absolute -bottom-1.5 left-1/2 -translate-x-1/2"></div>
        </div>
      </div>
    </span>
  );
}
