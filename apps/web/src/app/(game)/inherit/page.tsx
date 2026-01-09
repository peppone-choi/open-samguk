"use client";

/**
 * PageInheritPoint - 유산 관리
 * Ported from legacy/hwe/ts/PageInheritPoint.vue
 *
 * Features:
 * - View & use inheritance points
 * - Buy random unique items
 * - Reset turn time, special war, stats
 * - Buy hidden buffs
 * - Check general owner
 */

import React, { useState } from "react";
import { TopBackBar } from "@/components/game";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/utils/trpc";
import { useGeneral } from "@/contexts/GeneralContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ============================================================================
// Types
// ============================================================================



// ============================================================================
// Constants
// ============================================================================

const BUFF_TYPES: Record<string, { title: string; desc: string }> = {
  leadership: { title: "통솔 보너스", desc: "명예 통솔 등급을 올립니다." },
  strength: { title: "무력 보너스", desc: "명예 무력 등급을 올립니다." },
  intel: { title: "지력 보너스", desc: "명예 지력 등급을 올립니다." },
  dex: { title: "숙련 보너스", desc: "모든 병종 숙련도 등급을 올립니다." },
  warMastery: { title: "전투 숙련 보너스", desc: "전투 숙련 등급을 올립니다." },
};

const AVAILABLE_SPECIALS = [
  { key: "None", name: "없음" },
  { key: "chungBo", name: "첩보" },
  { key: "gungSin", name: "궁신" },
  { key: "geukNobi", name: "극노비" },
  { key: "changGi", name: "창기" },
  { key: "gungSu", name: "궁수" },
  { key: "saBok", name: "사복" },
];

// ============================================================================
// Page Component
// ============================================================================

export default function PageInheritPoint() {
  const { selectedGeneral, isLoading: isGeneralLoading } = useGeneral();
  const generalId = selectedGeneral?.no;
  const userId = selectedGeneral?.owner;

  // Queries
  const { data: pointsData, refetch: refetchPoints } = trpc.getInheritPoints.useQuery(
    { userId: userId ?? 0 },
    { enabled: !!userId }
  );

  const { data: historyData, refetch: refetchHistory } = trpc.getInheritHistory.useQuery(
    { userId: userId ?? 0 },
    { enabled: !!userId }
  );

  const refresh = () => {
    refetchPoints();
    refetchHistory();
  };

  // Mutations
  const buyRandomUniqueMutation = trpc.buyRandomUnique.useMutation();
  const buyHiddenBuffMutation = trpc.buyHiddenBuff.useMutation();
  const resetTurnTimeMutation = trpc.resetTurnTime.useMutation();
  const resetSpecialWarMutation = trpc.resetSpecialWar.useMutation();
  const setNextSpecialWarMutation = trpc.setNextSpecialWar.useMutation();
  const checkOwnerMutation = trpc.checkOwner.useMutation();
  const resetStatMutation = trpc.resetStat.useMutation();

  // Local Form States
  const [nextSpecial, setNextSpecial] = useState("None");
  const [resetStatArgs, setResetStatArgs] = useState({ L: 50, S: 50, I: 60 });
  const [bonusStat, setBonusStat] = useState({ L: 0, S: 0, I: 0 });
  const [checkOwnerId, setCheckOwnerId] = useState("");

  const handleBuyRandomUnique = async () => {
    if (!userId || !generalId || !confirm("600 포인트로 랜덤 유니크를 구입하시겠습니까?")) return;
    try {
      const res = await buyRandomUniqueMutation.mutateAsync({ userId, generalId });
      if (res.success) {
        alert("구입했습니다. 다음 턴에 획득합니다.");
        refresh();
      } else {
        alert(res.message);
      }
    } catch (e: any) {
      alert("오류: " + e.message);
    }
  };

  const handleResetTurnTime = async () => {
    if (
      !userId ||
      !generalId ||
      !confirm("포인트를 사용하여 턴 시간을 무작위로 변경하시겠습니까? (비용: 가변)")
    )
      return;
    try {
      const res = await resetTurnTimeMutation.mutateAsync({ userId, generalId });
      if (res.success) {
        alert("변경 예약되었습니다. 다다음 턴부터 적용됩니다.");
        refresh();
      } else {
        alert(res.message);
      }
    } catch (e: any) {
      alert("오류: " + e.message);
    }
  };

  const handleResetSpecial = async () => {
    if (
      !userId ||
      !generalId ||
      !confirm("포인트를 사용하여 전투 특기를 초기화하시겠습니까? (비용: 가변)")
    )
      return;
    try {
      const res = await resetSpecialWarMutation.mutateAsync({ userId, generalId });
      if (res.success) {
        alert("초기화했습니다.");
        refresh();
      } else {
        alert(res.message);
      }
    } catch (e: any) {
      alert("오류: " + e.message);
    }
  };

  const handleSetNextSpecial = async () => {
    if (nextSpecial === "None" || !userId || !generalId) return;
    const specialName = AVAILABLE_SPECIALS.find((s) => s.key === nextSpecial)?.name;
    if (!confirm(`800 포인트로 다음 전투 특기를 ${specialName}(으)로 지정하시겠습니까?`)) return;
    try {
      const res = await setNextSpecialWarMutation.mutateAsync({
        userId,
        generalId,
        specialType: nextSpecial,
      });
      if (res.success) {
        alert("지정했습니다. 다음 전투 특기 획득 시 적용됩니다.");
        refresh();
      } else {
        alert(res.message);
      }
    } catch (e: any) {
      alert("오류: " + e.message);
    }
  };

  const handleCheckOwner = async () => {
    const destId = parseInt(checkOwnerId);
    if (!userId || !generalId || isNaN(destId)) return;
    if (!confirm(`1000 포인트로 장수 No.${destId}의 소유자를 확인하시겠습니까?`)) return;
    try {
      const res = await checkOwnerMutation.mutateAsync({
        userId,
        generalId,
        destGeneralId: destId,
      });
      if (res.success) {
        alert(`장수 No.${destId}의 소유자: ${res.ownerName}`);
        refresh();
      } else {
        alert(res.message);
      }
    } catch (e: any) {
      alert("오류: " + e.message);
    }
  };

  const handleResetStat = async () => {
    if (!userId || !generalId) return;
    const total = resetStatArgs.L + resetStatArgs.S + resetStatArgs.I;
    if (total !== 160) {
      alert(`능력치 합계가 ${total}입니다. 160이어야 합니다.`);
      return;
    }
    const bonusTotal = bonusStat.L + bonusStat.S + bonusStat.I;
    if (bonusTotal > 0 && (bonusTotal < 3 || bonusTotal > 5)) {
      alert("보너스 스탯 합계는 3~5 사이여야 합니다.");
      return;
    }

    const cost = bonusTotal > 0 ? 300 : 0;
    if (!confirm(`능력치를 재설정하시겠습니까? (비용: ${cost}P)`)) return;

    try {
      const res = await resetStatMutation.mutateAsync({
        userId,
        generalId,
        leadership: resetStatArgs.L,
        strength: resetStatArgs.S,
        intel: resetStatArgs.I,
        inheritBonusStat: bonusTotal > 0 ? [bonusStat.L, bonusStat.S, bonusStat.I] : undefined,
      });
      if (res.success) {
        alert("재설정 완료되었습니다.");
        refresh();
      } else {
        alert(res.message);
      }
    } catch (e: any) {
      alert("오류: " + e.message);
    }
  };

  const handleUpgradeBuff = async (key: string) => {
    if (!userId || !generalId) return;
    // In actual implementation, we'd need current level.
    // Usually user would pick level or it's always prevLevel + 1
    // The service handles detection, but we need to pass a target level.
    const aux = selectedGeneral?.aux as any;
    const currentLevel = aux?.inheritBuff?.[key] ?? 0;
    const nextLevel = currentLevel + 1;

    if (nextLevel > 4) {
      alert("이미 최대 등급입니다.");
      return;
    }

    if (!confirm(`${BUFF_TYPES[key].title} ${nextLevel}단계를 구입하시겠습니까?`)) return;
    try {
      const res = await buyHiddenBuffMutation.mutateAsync({
        userId,
        generalId,
        buffType: key,
        level: nextLevel,
      });
      if (res.success) {
        alert("구입했습니다.");
        refresh();
      } else {
        alert(res.message);
      }
    } catch (e: any) {
      alert("오류: " + e.message);
    }
  };

  if (isGeneralLoading || !selectedGeneral) {
    return (
      <div className="bg0 min-h-screen text-white">
        <TopBackBar title="유산 관리" type="close" />
        <div className="flex items-center justify-center p-20 text-gray-500">로딩 중...</div>
      </div>
    );
  }

  const historyLogs = (historyData?.logs ?? []) as Array<{ id: number; date: string | Date; text: string }>;
  const points = pointsData?.points ?? 0;

  return (
    <div className="bg0 min-h-screen text-white pb-20">
      <TopBackBar title="유산 관리" type="close" reloadable onReload={refresh} />

      <div className="w-full max-w-[1000px] mx-auto p-2 md:p-4 space-y-4">
        {/* Points Display */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-sm text-center shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-600 via-amber-400 to-yellow-600" />
          <div className="text-xs text-zinc-500 uppercase tracking-widest mb-1">
            AVAILABLE INHERITANCE POINTS
          </div>
          <div className="text-4xl font-black text-yellow-500 font-mono tracking-tighter">
            {points.toLocaleString()}{" "}
            <span className="text-sm font-normal text-zinc-400 ml-1">POINTS</span>
          </div>
        </div>

        {/* Shop Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="group bg-zinc-900 border border-zinc-800 p-4 rounded-sm flex flex-col hover:border-zinc-600 transition-colors">
            <div className="font-bold text-zinc-200 mb-1 group-hover:text-amber-400 transition-colors">
              랜덤 유니크 획득
            </div>
            <p className="text-[11px] text-zinc-500 flex-1 leading-relaxed border-l-2 border-zinc-800 pl-3 mb-4">
              신비한 보물 상자를 엽니다. 다음 턴에 무작위 유니크 아이템이 장수에게 지급됩니다.
            </p>
            <Button
              size="sm"
              onClick={handleBuyRandomUnique}
              className="w-full bg-zinc-800 hover:bg-zinc-700"
            >
              600P 소모
            </Button>
          </div>

          <div className="group bg-zinc-900 border border-zinc-800 p-4 rounded-sm flex flex-col hover:border-zinc-600 transition-colors">
            <div className="font-bold text-zinc-200 mb-1 group-hover:text-amber-400 transition-colors">
              턴 시간 변경
            </div>
            <p className="text-[11px] text-zinc-500 flex-1 leading-relaxed border-l-2 border-zinc-800 pl-3 mb-4">
              운명의 시간을 비틉니다. 다다음 턴부터 무작위 턴 시간으로 자동 변경됩니다.
            </p>
            <Button
              size="sm"
              onClick={handleResetTurnTime}
              className="w-full bg-zinc-800 hover:bg-zinc-700"
            >
              가변P 소모
            </Button>
          </div>

          <div className="group bg-zinc-900 border border-zinc-800 p-4 rounded-sm flex flex-col hover:border-zinc-600 transition-colors">
            <div className="font-bold text-zinc-200 mb-1 group-hover:text-amber-400 transition-colors">
              전투 특기 초기화
            </div>
            <p className="text-[11px] text-zinc-500 flex-1 leading-relaxed border-l-2 border-zinc-800 pl-3 mb-4">
              무공을 초기화합니다. 현재 보유한 전투 특기를 즉시 삭제하여 공란으로 만듭니다.
            </p>
            <Button
              size="sm"
              onClick={handleResetSpecial}
              className="w-full bg-zinc-800 hover:bg-zinc-700"
            >
              가변P 소모
            </Button>
          </div>
        </div>

        {/* Configuration Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-sm space-y-3">
            <div className="text-xs font-bold text-zinc-400 border-b border-zinc-800 pb-2 flex justify-between">
              <span>다음 전투 특기 지정</span>
              <span className="text-amber-500">800P</span>
            </div>
            <div className="flex gap-2">
              <select
                className="bg-zinc-950 border border-zinc-800 h-9 px-3 flex-1 text-sm rounded-sm focus:ring-1 ring-amber-500 outline-none"
                value={nextSpecial}
                onChange={(e) => setNextSpecial(e.target.value)}
              >
                {AVAILABLE_SPECIALS.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.name}
                  </option>
                ))}
              </select>
              <Button size="sm" onClick={handleSetNextSpecial} className="bg-zinc-800">
                지정하기
              </Button>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-sm space-y-3">
            <div className="text-xs font-bold text-zinc-400 border-b border-zinc-800 pb-2 flex justify-between">
              <span>장수 소유자 실명 확인</span>
              <span className="text-amber-500">1000P</span>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="대상 장수 번호 입력"
                value={checkOwnerId}
                onChange={(e) => setCheckOwnerId(e.target.value)}
                className="bg-zinc-950 border-zinc-800 h-9 text-sm rounded-sm"
              />
              <Button size="sm" onClick={handleCheckOwner} className="bg-zinc-800">
                확인하기
              </Button>
            </div>
          </div>
        </div>

        {/* Stat Reset Panel */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden ring-1 ring-inset ring-white/5">
          <div className="bg-zinc-800/50 p-3 px-5 border-b border-zinc-800 flex justify-between items-center text-sm font-bold">
            <span>능력치 초기화 및 보너스 스탯</span>
            <span className="text-[10px] text-zinc-500 font-normal">정상 합계 160</span>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-3 gap-6">
              {["L", "S", "I"].map((stat) => (
                <div key={stat} className="space-y-2">
                  <div className="text-center text-[10px] font-bold text-zinc-500">
                    {stat === "L" ? "통솔" : stat === "S" ? "무력" : "지력"}
                  </div>
                  <Input
                    type="number"
                    value={resetStatArgs[stat as keyof typeof resetStatArgs]}
                    onChange={(e) =>
                      setResetStatArgs({ ...resetStatArgs, [stat]: +e.target.value })
                    }
                    className="text-center bg-zinc-950 border-zinc-800 h-10 font-bold"
                  />
                  <div className="flex gap-1">
                    <Input
                      type="number"
                      placeholder="+B"
                      value={bonusStat[stat as keyof typeof bonusStat]}
                      onChange={(e) => setBonusStat({ ...bonusStat, [stat]: +e.target.value })}
                      className="text-center text-[11px] bg-zinc-950 border-zinc-800 h-8 text-amber-500"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-amber-950/20 p-3 rounded-sm border border-amber-900/30">
              <p className="text-[10px] text-amber-500 leading-relaxed">
                * 보너스 스탯(통+무+지)이 3~5인 경우 300P가 소모되며, 보너스 없이 초기화하면
                무료입니다.
                <br />* 이번 기수 동안 사용한 적이 없어야 합니다. 합계 160을 엄수해주세요.
              </p>
            </div>

            <Button
              className="w-full h-11 bg-gradient-to-r from-zinc-800 to-zinc-950 hover:from-white hover:to-white hover:text-black transition-all font-bold"
              onClick={handleResetStat}
            >
              능력치 초기화 및 보너스 적용
            </Button>
          </div>
        </div>

        {/* Buff List */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-sm">
          <div className="bg-zinc-800/30 p-2 px-5 text-xs font-bold text-zinc-400 border-b border-zinc-800 uppercase tracking-tight">
            명예 훈장 (히든 버프)
          </div>
          <div className="divide-y divide-zinc-800">
            {Object.keys(BUFF_TYPES).map((key) => {
              const currentLevel = (selectedGeneral?.aux as any)?.inheritBuff?.[key] ?? 0;
              return (
                <div
                  key={key}
                  className="flex justify-between items-center p-4 px-6 hover:bg-zinc-800/20 transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                      {BUFF_TYPES[key].title}
                      <span className="text-[10px] text-amber-500 bg-amber-950/40 px-1.5 rounded">
                        {currentLevel}/4 LV
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-500">{BUFF_TYPES[key].desc}</div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-zinc-950 border-zinc-800 hover:bg-white hover:text-black transition-all px-4"
                    onClick={() => handleUpgradeBuff(key)}
                    disabled={currentLevel >= 4}
                  >
                    {currentLevel >= 4 ? "MAX" : "UPGRADE"}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        {/* History Log */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden">
          <div className="bg-zinc-800/30 p-2 px-5 text-xs font-bold text-zinc-400 border-b border-zinc-800 uppercase tracking-tight">
            유산 사용 로그 (최근 30개)
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            <Table>
              <TableHeader className="bg-zinc-950/50">
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="w-[150px] text-[10px] uppercase font-bold text-zinc-500 pl-6">
                    일시
                  </TableHead>
                  <TableHead className="text-[10px] uppercase font-bold text-zinc-500">
                    내역
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyLogs.length === 0 ? (
                  <TableRow className="border-none">
                    <TableCell
                      colSpan={2}
                      className="text-center py-20 text-zinc-600 text-sm italic"
                    >
                      사용 내역이 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  historyLogs.map((log) => (
                    <TableRow key={log.id} className="border-zinc-800/50 hover:bg-zinc-800/10">
                      <TableCell className="text-[11px] text-zinc-400 pl-6">
                        {new Date(log.date).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-xs text-zinc-300 font-medium">
                        {log.text}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
