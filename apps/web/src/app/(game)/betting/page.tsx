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
    <div className="bg0 border border-gray-600 mb-2">
      {/* Betting Title */}
      <div className="bg2 p-2 text-center font-semibold">
        {info.name} {getBettingStatus()} (총액: {bettingAmount.toLocaleString()})
      </div>

      {/* Candidates Grid */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-1 p-2">
        {info.candidates.map((candidate, idx) => {
          const isPicked = pickedCandidates.has(idx);
          const isWinner = info.isFinished && winner.has(idx);
          const pickRate =
            bettingAmount > 0 ? ((partialBet.get(idx) ?? 0) / bettingAmount) * 100 : 0;

          return (
            <div
              key={idx}
              className={`cursor-pointer border rounded transition-colors ${
                isPicked || isWinner
                  ? "border-cyan-400 bg-cyan-900/30"
                  : "border-gray-600 hover:border-gray-400"
              }`}
              onClick={() => toggleCandidate(idx)}
            >
              <div className="bg1 p-1 text-center text-sm font-semibold">{candidate.name}</div>
              <div className="p-2 text-xs text-center">
                {(candidate.aux?.info as string) || "-"}
              </div>
              <div className="p-1 text-xs text-center text-gray-400">
                선택율: {pickRate.toFixed(1)}%
              </div>
            </div>
          );
        })}
      </div>

      {/* Bet Form (only if betting is open) */}
      {isBettingOpen && (
        <div className="grid grid-cols-12 gap-1 p-2 items-center text-sm border-t border-gray-600">
          <div className="col-span-6 lg:col-span-3">
            잔여 {info.reqInheritancePoint ? "포인트" : "금"}: {remainPoint.toLocaleString()}
          </div>
          <div className="col-span-6 lg:col-span-3">
            사용:{" "}
            {Array.from(myBettings.values())
              .reduce((a, b) => a + b, 0)
              .toLocaleString()}
          </div>
          <div className="col-span-6 lg:col-span-3">
            대상: {pickedCandidates.size > 0 ? getTypeStr(Array.from(pickedCandidates)) : "-"}
          </div>
          <div className="col-span-4 lg:col-span-2">
            <input
              type="number"
              className="w-full px-2 py-1 bg-zinc-700 border border-gray-600 rounded text-white text-sm"
              value={betPoint}
              min={info.minAmount || 10}
              max={1000}
              step={10}
              onChange={(e) => setBetPoint(parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="col-span-2 lg:col-span-1">
            <Button size="sm" onClick={handleSubmitBet} disabled={betMutation.isPending}>
              베팅
            </Button>
          </div>
        </div>
      )}

      {/* Dividend Ranking */}
      <div className="border-t border-gray-600">
        <div className="bg2 p-1 text-center text-sm">배당 순위</div>

        {/* Header */}
        <div className="grid grid-cols-12 text-center text-xs border-b border-gray-600 bg-zinc-800">
          <div className="col-span-5 p-1">대상</div>
          <div className="col-span-2 p-1">베팅액</div>
          <div className="col-span-3 p-1">내 베팅</div>
          <div className="col-span-2 p-1">{info.isFinished ? "배율" : "기대 배율"}</div>
        </div>

        {/* Rows */}
        {sortedDetailBet.map(([typeData, amount], idx) => {
          const typeKey = Array.isArray(typeData) ? JSON.stringify(typeData) : String(typeData);
          const myBet = myBettings.get(typeKey) ?? 0;
          const multiplier = amount > 0 ? bettingAmount / amount : 0;

          // Determine color for finished bettings
          let textColor = "";
          if (info.isFinished) {
            try {
              const indices = Array.isArray(typeData)
                ? typeData
                : (JSON.parse(String(typeData)) as number[]);
              const matchCount = indices.filter((i) => winner.has(i)).length;
              if (matchCount === indices.length) {
                textColor = "text-green-400";
              } else if (matchCount > 0) {
                textColor = "text-yellow-400";
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
              className={`grid grid-cols-12 text-center text-xs border-b border-gray-700 ${textColor}`}
            >
              <div className={`col-span-5 p-1 ${myBet > 0 ? "font-bold" : ""}`}>
                {getTypeStr(typeData)}
              </div>
              <div className="col-span-2 p-1 text-right pr-2 font-mono">
                {(amount || 0).toLocaleString()}
              </div>
              <div className="col-span-3 p-1 text-center">
                {myBet > 0 && (
                  <>
                    ({myBet.toLocaleString()} -&gt; {(myBet * multiplier).toFixed(1)})
                  </>
                )}
              </div>
              <div className="col-span-2 p-1 text-right pr-2 font-mono">
                {multiplier.toFixed(1)}배
              </div>
            </div>
          );
        })}

        {sortedDetailBet.length === 0 && (
          <div className="p-4 text-center text-gray-400">아직 베팅이 없습니다.</div>
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

      <div className="w-full max-w-[1000px] mx-auto border border-gray-600">
        {/* Toast Message */}
        {toastMessage && (
          <div
            className={`p-2 text-center text-sm ${
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

        {/* Betting Detail (if selected) */}
        {selectedBettingId !== null && (
          <BettingDetail
            bettingId={selectedBettingId}
            onToast={handleToast}
            onRefresh={handleReload}
          />
        )}

        {/* Betting List */}
        <div className="bg0">
          <div className="bg2 p-2 text-center font-semibold">베팅 목록</div>

          {isLoading ? (
            <div className="p-4 text-center text-gray-400">로딩 중...</div>
          ) : bettingList.length === 0 ? (
            <div className="p-4 text-center text-gray-400">등록된 베팅이 없습니다.</div>
          ) : (
            <div className="divide-y divide-gray-700">
              {[...bettingList].reverse().map((item) => {
                const closeDate = new Date(item.closeDate);
                const isFinished = item.isFinished;
                const isClosed = closeDate < new Date();

                return (
                  <div
                    key={item.id}
                    className={`p-2 cursor-pointer hover:bg-zinc-700 transition-colors ${
                      selectedBettingId === item.id ? "bg-zinc-700" : ""
                    }`}
                    onClick={() => setSelectedBettingId(item.id)}
                  >
                    <span className="text-cyan-300">[{closeDate.toLocaleDateString()}]</span>{" "}
                    {item.name}{" "}
                    <span
                      className={`text-sm ${
                        isFinished
                          ? "text-gray-400"
                          : isClosed
                            ? "text-yellow-400"
                            : "text-green-400"
                      }`}
                    >
                      {getBettingStatus(item)}
                    </span>
                    <span className="text-gray-400 ml-2">
                      (총액: {item.totalAmount?.toLocaleString() ?? 0})
                    </span>
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
