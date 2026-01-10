"use client";

/**
 * PageNationBetting - 국가 베팅장
 * Ported from legacy/hwe/ts/PageNationBetting.vue
 *
 * Features:
 * - Betting list with year/month info
 * - Betting detail with candidates grid
 * - Bet placement form
 * - Dividend ranking table
 */

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { TopBackBar } from "@/components/game";
import { Button } from "@/components/ui/button";
import { trpc } from "@/utils/trpc";
import { useGeneral } from "@/contexts/GeneralContext";
import { useAuth } from "@/contexts/AuthContext";

// useAuth is used in BettingDetail component

// ============================================================================
// Types
// ============================================================================

interface BettingCandidate {
  id: number;
  name: string;
  aux?: Record<string, unknown>;
}

interface BettingInfo {
  id: number;
  name: string;
  type: string;
  closeDate: string;
  isFinished: boolean;
  reqInheritancePoint: boolean;
  minAmount: number;
  candidates: BettingCandidate[];
  winnerType?: number[];
}

interface BettingListItem {
  id: number;
  name: string;
  type: string;
  closeDate: string;
  isFinished: boolean;
  totalAmount: number;
}

// ============================================================================
// Utility Functions
// ============================================================================

// ============================================================================
// BettingDetail Component
// ============================================================================

interface BettingDetailProps {
  bettingId: number;
  onToast: (message: string, variant: "success" | "danger" | "warning") => void;
  onRefresh: () => void;
}

function BettingDetail({ bettingId, onToast, onRefresh }: BettingDetailProps) {
  const { selectedGeneralId } = useGeneral();
  const { user } = useAuth();
  const [pickedCandidates, setPickedCandidates] = useState<Set<number>>(new Set());
  const [betPoint, setBetPoint] = useState(100);

  const {
    data: detailData,
    isLoading,
    refetch,
  } = trpc.getBettingDetail.useQuery(
    { bettingId, userId: user?.id ?? 0 },
    { enabled: !!user?.id && bettingId > 0 }
  );

  const betMutation = trpc.bet.useMutation({
    onSuccess: () => {
      onToast("베팅했습니다", "success");
      setPickedCandidates(new Set());
      refetch();
      onRefresh();
    },
    onError: (error) => {
      onToast(error.message || "베팅 실패", "danger");
    },
  });

  // Reset picked candidates when betting changes
  useEffect(() => {
    setPickedCandidates(new Set());
  }, [bettingId]);

  const info = detailData?.bettingInfo as BettingInfo | undefined;
  const bettingDetail = (detailData?.bettingDetail ?? []) as [string | number[], number][];
  const myBetting = (detailData?.myBetting ?? []) as [string | number[], number][];
  const remainPoint = detailData?.remainPoint ?? 0;

  // Calculate betting amounts
  const bettingAmount = useMemo(() => {
    return bettingDetail.reduce((sum, [, amount]) => sum + (amount || 0), 0);
  }, [bettingDetail]);

  const partialBet = useMemo(() => {
    if (!info) return new Map<number, number>();
    const map = new Map<number, number>();
    for (const [typeData, amount] of bettingDetail) {
      const indices = Array.isArray(typeData)
        ? typeData
        : (JSON.parse(String(typeData)) as number[]);
      for (const idx of indices) {
        if (idx >= 0) {
          map.set(idx, (map.get(idx) ?? 0) + (amount || 0));
        }
      }
    }
    return map;
  }, [bettingDetail, info]);

  const myBettings = useMemo(() => {
    const map = new Map<string, number>();
    for (const [typeData, amount] of myBetting) {
      const key = Array.isArray(typeData) ? JSON.stringify(typeData) : String(typeData);
      map.set(key, (map.get(key) ?? 0) + (amount || 0));
    }
    return map;
  }, [myBetting]);

  const winner = useMemo(() => {
    if (!info?.winnerType) return new Set<number>();
    return new Set(info.winnerType);
  }, [info]);

  // Get type string from JSON key or array
  const getTypeStr = useCallback(
    (typeData: string | number[]): string => {
      if (!info) return "";
      try {
        const indices = Array.isArray(typeData)
          ? typeData
          : (JSON.parse(String(typeData)) as number[]);
        return indices.map((idx) => info.candidates[idx]?.name ?? "?").join(", ");
      } catch {
        return "Invalid";
      }
    },
    [info]
  );

  // Toggle candidate selection
  const toggleCandidate = useCallback(
    (idx: number) => {
      if (!info) return;
      if (info.isFinished) return;
      if (new Date(info.closeDate) < new Date()) return;

      // For now, assume selectCnt = 1 (single selection)
      setPickedCandidates(new Set([idx]));
    },
    [info]
  );

  // Submit bet
  const handleSubmitBet = useCallback(async () => {
    if (!info || !selectedGeneralId || !user) return;
    if (pickedCandidates.size === 0) {
      onToast("베팅 대상을 선택해주세요.", "warning");
      return;
    }

    betMutation.mutate({
      bettingId: info.id,
      generalId: selectedGeneralId,
      userId: user.id,
      bettingType: Array.from(pickedCandidates),
      amount: betPoint,
    });
  }, [info, selectedGeneralId, user, pickedCandidates, betPoint, onToast, betMutation]);

  // Sorted detail bet for ranking
  const sortedDetailBet = useMemo(() => {
    return [...bettingDetail].sort(([, a], [, b]) => (b || 0) - (a || 0));
  }, [bettingDetail]);

  // Determine betting status text
  const getBettingStatus = useCallback(() => {
    if (!info) return "";
    if (info.isFinished) return "(종료)";
    const closeDate = new Date(info.closeDate);
    if (closeDate < new Date()) return "(베팅 마감)";
    return `(${closeDate.toLocaleDateString()}까지)`;
  }, [info]);

  // Check if betting is open
  const isBettingOpen = useMemo(() => {
    if (!info) return false;
    return !info.isFinished && new Date(info.closeDate) > new Date();
  }, [info]);

  if (isLoading) {
    return <div className="p-4 text-center text-gray-400">로딩 중...</div>;
  }

  if (!info) {
    return <div className="p-4 text-center text-gray-400">베팅 정보를 불러올 수 없습니다.</div>;
  }

  return (
    <div className="glass p-6 rounded-xl animate-fade-in mb-6">
      {/* Betting Title */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-primary/20 to-transparent p-4 mb-6 border border-primary/10">
        <div className="text-center">
          <h2 className="text-xl font-bold text-primary mb-1">{info.name}</h2>
          <div className="text-sm text-muted-foreground flex justify-center items-center gap-2">
            <span>{getBettingStatus()}</span>
            <span className="w-1 h-1 rounded-full bg-white/20"></span>
            <span className="text-foreground">
              총액: <span className="text-primary font-mono">{bettingAmount.toLocaleString()}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Candidates Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {info.candidates.map((candidate, idx) => {
          const isPicked = pickedCandidates.has(idx);
          const isWinner = info.isFinished && winner.has(idx);
          const pickRate =
            bettingAmount > 0 ? ((partialBet.get(idx) ?? 0) / bettingAmount) * 100 : 0;

          return (
            <div
              key={idx}
              className={`relative group cursor-pointer transition-all duration-300 rounded-xl overflow-hidden border ${
                isPicked || isWinner
                  ? "border-primary bg-primary/20 shadow-[0_0_20px_rgba(234,179,8,0.2)]"
                  : "border-white/10 bg-black/20 hover:border-primary/50 hover:bg-black/40 hover:-translate-y-1"
              }`}
              onClick={() => toggleCandidate(idx)}
            >
              <div
                className={`p-2 text-center text-sm font-bold border-b border-white/5 ${
                  isPicked || isWinner
                    ? "bg-primary/20 text-primary-foreground"
                    : "bg-white/5 text-primary"
                }`}
              >
                {candidate.name}
              </div>
              <div className="p-3 text-center space-y-2">
                <div className="text-xs text-muted-foreground min-h-[1.5em]">
                  {(candidate.aux?.info as string) || "-"}
                </div>
                <div className="text-xs font-mono text-primary/80">{pickRate.toFixed(1)}%</div>
              </div>
              {/* Selection Indicator */}
              {(isPicked || isWinner) && (
                <div className="absolute inset-0 border-2 border-primary rounded-xl pointer-events-none box-border animate-pulse-glow"></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bet Form (only if betting is open) */}
      {isBettingOpen && (
        <div className="bg-black/20 rounded-xl p-4 border border-white/10 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center text-sm">
            <div className="lg:col-span-3 flex flex-col">
              <span className="text-xs text-muted-foreground mb-1">잔여 자산</span>
              <span className="text-lg font-mono text-emerald-400">
                {remainPoint.toLocaleString()}{" "}
                <span className="text-xs text-muted-foreground">
                  {info.reqInheritancePoint ? "P" : "금"}
                </span>
              </span>
            </div>
            <div className="lg:col-span-3 flex flex-col">
              <span className="text-xs text-muted-foreground mb-1">사용 금액</span>
              <span className="text-lg font-mono text-red-400">
                {Array.from(myBettings.values())
                  .reduce((a, b) => a + b, 0)
                  .toLocaleString()}
              </span>
            </div>
            <div className="lg:col-span-3 flex flex-col">
              <span className="text-xs text-muted-foreground mb-1">베팅 대상</span>
              <span className="text-base text-primary font-medium truncate">
                {pickedCandidates.size > 0 ? getTypeStr(Array.from(pickedCandidates)) : "-"}
              </span>
            </div>
            <div className="lg:col-span-3 flex gap-2 items-end">
              <div className="flex-1">
                <input
                  type="number"
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-mono"
                  value={betPoint}
                  min={info.minAmount || 10}
                  max={1000}
                  step={10}
                  onChange={(e) => setBetPoint(parseInt(e.target.value) || 0)}
                />
              </div>
              <Button
                size="sm"
                onClick={handleSubmitBet}
                disabled={betMutation.isPending}
                className="btn-primary h-[38px]"
              >
                베팅
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Dividend Ranking */}
      <div className="rounded-xl overflow-hidden border border-white/10 bg-black/20">
        <div className="bg-white/5 p-3 text-sm font-bold text-primary border-b border-white/10 flex items-center gap-2">
          <span className="w-1 h-4 bg-primary rounded-full shadow-[0_0_10px_rgba(234,179,8,0.5)]"></span>
          배당 순위
        </div>

        {/* Header */}
        <div className="grid grid-cols-12 text-center text-xs border-b border-white/10 bg-black/40 text-muted-foreground py-2">
          <div className="col-span-5">대상</div>
          <div className="col-span-2">베팅액</div>
          <div className="col-span-3">내 베팅</div>
          <div className="col-span-2">{info.isFinished ? "배율" : "기대 배율"}</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-white/5">
          {sortedDetailBet.map(([typeData, amount], idx) => {
            const typeKey = Array.isArray(typeData) ? JSON.stringify(typeData) : String(typeData);
            const myBet = myBettings.get(typeKey) ?? 0;
            const multiplier = amount > 0 ? bettingAmount / amount : 0;

            // Determine color for finished bettings
            let textColor = "text-muted-foreground";
            if (info.isFinished) {
              try {
                const indices = Array.isArray(typeData)
                  ? typeData
                  : (JSON.parse(String(typeData)) as number[]);
                const matchCount = indices.filter((i) => winner.has(i)).length;
                if (matchCount === indices.length) {
                  textColor = "text-emerald-400 font-bold";
                } else if (matchCount > 0) {
                  textColor = "text-amber-400";
                } else {
                  textColor = "text-red-400";
                }
              } catch {
                /* ignore */
              }
            }

            return (
              <div
                key={idx}
                className={`grid grid-cols-12 text-center text-xs py-3 hover:bg-white/5 transition-colors items-center ${textColor}`}
              >
                <div className={`col-span-5 p-1 ${myBet > 0 ? "font-bold text-primary" : ""}`}>
                  {getTypeStr(typeData)}
                </div>
                <div className="col-span-2 p-1 text-right pr-4 font-mono">
                  {(amount || 0).toLocaleString()}
                </div>
                <div className="col-span-3 p-1 text-center font-mono">
                  {myBet > 0 && (
                    <span className="text-primary">
                      {myBet.toLocaleString()} -&gt;{" "}
                      <span className="text-emerald-400">{(myBet * multiplier).toFixed(1)}</span>
                    </span>
                  )}
                </div>
                <div className="col-span-2 p-1 text-right pr-4 font-mono">
                  {multiplier.toFixed(1)}배
                </div>
              </div>
            );
          })}
        </div>

        {sortedDetailBet.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">아직 베팅이 없습니다.</div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

export default function BettingPage() {
  const [selectedBettingId, setSelectedBettingId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<{
    message: string;
    variant: "success" | "danger" | "warning";
  } | null>(null);

  const {
    data: listData,
    isLoading,
    refetch,
  } = trpc.getBettingList.useQuery({ type: "bettingNation" }, { enabled: true });

  const bettingList = useMemo(() => {
    if (!listData?.bettingList) return [];
    return Object.values(listData.bettingList) as BettingListItem[];
  }, [listData]);

  const handleToast = useCallback((message: string, variant: "success" | "danger" | "warning") => {
    setToastMessage({ message, variant });
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  const handleReload = useCallback(() => {
    refetch();
  }, [refetch]);

  const getBettingStatus = useCallback((item: BettingListItem) => {
    if (item.isFinished) return "(종료)";
    const closeDate = new Date(item.closeDate);
    if (closeDate < new Date()) return "(베팅 마감)";
    return `(${closeDate.toLocaleDateString()}까지)`;
  }, []);

  return (
    <>
      <TopBackBar title="국가 베팅장" type="close" reloadable onReload={handleReload} />

      <div className="w-full max-w-[1000px] mx-auto space-y-6 pb-20">
        {/* Toast Message */}
        {toastMessage && (
          <div
            className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-2xl backdrop-blur-md border animate-slide-in flex items-center gap-3 ${
              toastMessage.variant === "success"
                ? "bg-emerald-950/80 border-emerald-500/30 text-emerald-400"
                : toastMessage.variant === "danger"
                  ? "bg-red-950/80 border-red-500/30 text-red-400"
                  : "bg-amber-950/80 border-amber-500/30 text-amber-400"
            }`}
          >
            {toastMessage.message}
          </div>
        )}

        {/* Betting Detail (if selected) */}
        {selectedBettingId !== null && (
          <BettingDetail
            bettingId={selectedBettingId}
            onToast={handleToast}
            onRefresh={handleReload}
          />
        )}

        {/* Betting List */}
        <div className="glass rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-gradient-to-r from-primary/10 to-transparent">
            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-glow"></span>
              베팅 목록
            </h3>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground animate-pulse">로딩 중...</div>
          ) : bettingList.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">등록된 베팅이 없습니다.</div>
          ) : (
            <div className="p-2 space-y-2">
              {[...bettingList].reverse().map((item) => {
                const closeDate = new Date(item.closeDate);
                const isFinished = item.isFinished;
                const isClosed = closeDate < new Date();
                const isSelected = selectedBettingId === item.id;

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-lg cursor-pointer transition-all duration-300 border ${
                      isSelected
                        ? "bg-primary/10 border-primary/50 shadow-[inset_0_0_20px_rgba(234,179,8,0.1)]"
                        : "bg-black/20 border-white/5 hover:bg-black/40 hover:border-white/20 hover:translate-x-1"
                    }`}
                    onClick={() => setSelectedBettingId(item.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/5 text-muted-foreground border border-white/10">
                          {closeDate.toLocaleDateString()}
                        </span>
                        <span
                          className={`font-medium ${
                            isSelected ? "text-primary" : "text-foreground"
                          }`}
                        >
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground hidden sm:inline-block">
                          총액:{" "}
                          <span className="text-foreground font-mono">
                            {item.totalAmount?.toLocaleString() ?? 0}
                          </span>
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-bold border ${
                            isFinished
                              ? "border-white/10 text-muted-foreground bg-white/5"
                              : isClosed
                                ? "border-amber-500/30 text-amber-400 bg-amber-950/30"
                                : "border-emerald-500/30 text-emerald-400 bg-emerald-950/30 shadow-glow-sm"
                          }`}
                        >
                          {getBettingStatus(item)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
