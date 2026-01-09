"use client";

import React, { useState, useEffect, useMemo } from "react";
import { TopBackBar } from "@/components/game";
import { Button } from "@/components/ui/button";
import { trpc } from "@/utils/trpc";
import { useGeneral } from "@/contexts/GeneralContext";

// ============================================================================
// Utility Functions
// ============================================================================

function cutDateTime(dateTime: string | Date, showSecond = false): string {
  const d = typeof dateTime === "string" ? new Date(dateTime) : dateTime;
  const iso = d.toISOString(); // Use ISO for consistency
  if (showSecond) {
    return iso.slice(5, 19).replace("T", " ");
  }
  return iso.slice(5, 16).replace("T", " ");
}

// ============================================================================
// Resource Auction Component
// ============================================================================

function AuctionResource() {
  const { selectedGeneral } = useGeneral();
  const generalId = selectedGeneral?.no;

  const { data: auctions, isLoading, refetch } = trpc.getActiveResourceAuctionList.useQuery();
  const { data: finished } = trpc.getFinishedAuctions.useQuery({ limit: 20 });

  const bidBuyRice = trpc.bidAuction.useMutation(); // Reuse same mutation
  const openBuyRice = trpc.openBuyRiceAuction.useMutation();
  const openSellRice = trpc.openSellRiceAuction.useMutation();

  const [selectedAuctionID, setSelectedAuctionID] = useState<number | null>(null);
  const [bidAmount, setBidAmount] = useState(0);

  const selectedAuction = useMemo(() => {
    return (auctions as any[] | undefined)?.find((a) => a.id === selectedAuctionID);
  }, [auctions, selectedAuctionID]);

  useEffect(() => {
    if (selectedAuction) {
      const highestBid = selectedAuction.bids[0]?.amount;
      const startBid = (selectedAuction.detail as any).startBidAmount;
      setBidAmount(highestBid ? highestBid + 10 : startBid);
    }
  }, [selectedAuction]);

  // Open auction form state
  const [openAuctionType, setOpenAuctionType] = useState<"buyRice" | "sellRice">("buyRice");
  const [openAmount, setOpenAmount] = useState(1000);
  const [openStartBid, setOpenStartBid] = useState(500);
  const [openFinishBid, setOpenFinishBid] = useState(2000);
  const [openCloseTurnCnt, setOpenCloseTurnCnt] = useState(24);

  const handleBid = async () => {
    if (!selectedAuction || !generalId) return;
    try {
      await bidBuyRice.mutateAsync({
        auctionId: selectedAuction.id,
        generalId,
        amount: bidAmount,
      });
      alert("입찰 완료");
      refetch();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleOpenAuction = async () => {
    if (!generalId) return;
    try {
      if (openAuctionType === "buyRice") {
        await openBuyRice.mutateAsync({
          generalId,
          amount: openAmount,
          closeTurnCnt: openCloseTurnCnt,
          startBidAmount: openStartBid,
          finishBidAmount: openFinishBid,
        });
      } else {
        await openSellRice.mutateAsync({
          generalId,
          amount: openAmount,
          closeTurnCnt: openCloseTurnCnt,
          startBidAmount: openStartBid,
          finishBidAmount: openFinishBid,
        });
      }
      alert("경매 등록 완료");
      refetch();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const buyRiceAuctions = (auctions as any[] | undefined)?.filter((a) => a.type === "BuyRice") || [];
  const sellRiceAuctions = (auctions as any[] | undefined)?.filter((a) => a.type === "SellRice") || [];

  if (isLoading) return <div className="p-8 text-center text-gray-500">로딩 중...</div>;

  return (
    <div className="bg0 text-sm">
      <div className="bg2 text-center p-2 font-semibold">거래장</div>

      <div className="bg-orange-500 text-black text-center p-1 font-semibold">
        쌀 구매 (쌀 판매자 목록)
      </div>
      <ResourceGrid
        auctions={buyRiceAuctions}
        onSelect={setSelectedAuctionID}
        resLabel="쌀"
        bidLabel="금"
      />

      <div className="bg-sky-400 text-black text-center p-1 font-semibold mt-2">
        쌀 판매 (쌀 구매자 목록)
      </div>
      <ResourceGrid
        auctions={sellRiceAuctions}
        onSelect={setSelectedAuctionID}
        resLabel="금"
        bidLabel="쌀"
      />

      {selectedAuction && (
        <div className="grid grid-cols-12 gap-1 p-2 items-center bg-zinc-800 border-y border-gray-600">
          <div className="col-span-12 lg:col-span-4 text-center lg:text-right font-mono text-xs">
            {selectedAuction.id}번 {selectedAuction.type === "BuyRice" ? "쌀" : "금"}{" "}
            {(selectedAuction.detail as any).amount.toLocaleString()} 경매에{" "}
            {selectedAuction.type === "BuyRice" ? "금" : "쌀"}
          </div>
          <div className="col-span-8 lg:col-span-3">
            <input
              type="number"
              className="w-full px-2 py-1 bg-zinc-700 border border-gray-600 rounded text-white text-sm"
              value={bidAmount}
              onChange={(e) => setBidAmount(parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="col-span-4 lg:col-span-2">
            <Button size="sm" className="w-full" onClick={handleBid}>
              입찰
            </Button>
          </div>
          <button
            className="col-span-12 lg:col-span-3 text-[10px] text-gray-500 hover:underline"
            onClick={() => setSelectedAuctionID(null)}
          >
            닫기
          </button>
        </div>
      )}

      <div className="bg1 text-center p-1 mt-2">경매 등록</div>
      <div className="grid grid-cols-12 gap-2 p-2 items-center text-xs">
        <div className="col-span-3 lg:col-span-2">
          <div className="mb-1">거래종류</div>
          <select
            className="w-full bg-zinc-800 border border-gray-600 rounded p-1"
            value={openAuctionType}
            onChange={(e) => setOpenAuctionType(e.target.value as any)}
          >
            <option value="buyRice">쌀 판매 (금 입찰)</option>
            <option value="sellRice">쌀 구매 (쌀 입찰)</option>
          </select>
        </div>
        <div className="col-span-3 lg:col-span-2">
          <div className="mb-1">수량 ({openAuctionType === "buyRice" ? "쌀" : "금"})</div>
          <input
            type="number"
            className="w-full px-2 py-1 bg-zinc-800 border border-gray-600 rounded"
            value={openAmount}
            onChange={(e) => setOpenAmount(parseInt(e.target.value) || 0)}
          />
        </div>
        <div className="col-span-2 lg:col-span-1">
          <div className="mb-1">종료(턴)</div>
          <input
            type="number"
            className="w-full px-2 py-1 bg-zinc-800 border border-gray-600 rounded"
            value={openCloseTurnCnt}
            onChange={(e) => setOpenCloseTurnCnt(parseInt(e.target.value) || 0)}
          />
        </div>
        <div className="col-span-2 lg:col-span-2">
          <div className="mb-1">시작가</div>
          <input
            type="number"
            className="w-full px-2 py-1 bg-zinc-800 border border-gray-600 rounded"
            value={openStartBid}
            onChange={(e) => setOpenStartBid(parseInt(e.target.value) || 0)}
          />
        </div>
        <div className="col-span-2 lg:col-span-2">
          <div className="mb-1">즉시낙찰</div>
          <input
            type="number"
            className="w-full px-2 py-1 bg-zinc-800 border border-gray-600 rounded"
            value={openFinishBid}
            onChange={(e) => setOpenFinishBid(parseInt(e.target.value) || 0)}
          />
        </div>
        <div className="col-span-12 lg:col-span-1">
          <Button size="sm" className="w-full lg:mt-5" onClick={handleOpenAuction}>
            등록
          </Button>
        </div>
      </div>

      <div className="bg1 text-center p-1 mt-2 font-semibold">최근 종료된 경매</div>
      <div className="p-2 space-y-1">
        {(finished as any[] | undefined)?.map((a) => {
          const highest = a.bids[0];
          const detail = a.detail as any;
          return (
            <div key={a.id} className="text-xs border-b border-gray-700 pb-1">
              <span className="text-gray-500 mr-2">[{cutDateTime(a.closeDate)}]</span>
              {a.id}번 {detail.title}:
              {highest ? (
                <span className="ml-1 text-green-400">
                  {highest.general?.name ?? "익명"}님에게 {highest.amount.toLocaleString()}에 낙찰
                </span>
              ) : (
                <span className="ml-1 text-red-500">유찰되었습니다.</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ResourceGrid({ auctions, onSelect, resLabel, bidLabel }: any) {
  return (
    <>
      <div className="grid grid-cols-[50px_2fr_2fr_2fr_2fr_1.5fr_3fr_2fr] text-center border-b border-gray-600 bg-zinc-800 text-[10px] font-bold">
        <div className="p-1">번호</div>
        <div className="p-1">판매자</div>
        <div className="p-1">매물</div>
        <div className="p-1">입찰자</div>
        <div className="p-1">현재가</div>
        <div className="p-1">단가</div>
        <div className="p-1">즉시마감</div>
        <div className="p-1 uppercase">Close</div>
      </div>
      {auctions.map((a: any) => {
        const detail = a.detail as any;
        const highest = a.bids[0];
        const currentPrice = highest?.amount ?? detail.startBidAmount;
        const unitPrice = (currentPrice / detail.amount).toFixed(2);
        return (
          <div
            key={a.id}
            className="grid grid-cols-[50px_2fr_2fr_2fr_2fr_1.5fr_3fr_2fr] text-center border-b border-gray-800 cursor-pointer hover:bg-zinc-700 items-center text-xs h-9"
            onClick={() => onSelect(a.id)}
          >
            <div className="p-1 font-mono text-gray-400">{a.id}</div>
            <div className="p-1 truncate">{a.hostGeneral?.name ?? "NPC"}</div>
            <div className="p-1 font-mono whitespace-nowrap">
              {resLabel} {detail.amount.toLocaleString()}
            </div>
            <div className="p-1 truncate">{highest?.general?.name ?? "-"}</div>
            <div className={`p-1 font-mono ${!highest ? "text-gray-500" : "text-yellow-400"}`}>
              {bidLabel} {currentPrice.toLocaleString()}
            </div>
            <div className="p-1 font-mono text-[10px]">{unitPrice}</div>
            <div className="p-1 font-mono text-cyan-400">
              {bidLabel} {detail.finishBidAmount.toLocaleString()}
            </div>
            <div className="p-1 font-mono text-[10px]">{cutDateTime(a.closeDate)}</div>
          </div>
        );
      })}
    </>
  );
}

// ============================================================================
// Unique Item Auction Component
// ============================================================================

function AuctionUniqueItem() {
  const { selectedGeneral } = useGeneral();
  const generalId = selectedGeneral?.no;

  const { data: auctions, isLoading, refetch } = trpc.getUniqueItemAuctionList.useQuery();
  const [selectedAuctionID, setSelectedAuctionID] = useState<number | null>(null);

  const { data: detailData } = trpc.getUniqueItemAuctionDetail.useQuery(
    { auctionId: selectedAuctionID ?? 0 },
    { enabled: !!selectedAuctionID }
  );

  const detail = detailData as any;

  const bidUnique = trpc.bidAuction.useMutation();
  const [bidAmount, setBidAmount] = useState(0);

  useEffect(() => {
    if (detail) {
      const highest = detail.bids?.[0]?.amount ?? detail.detail?.startBidAmount ?? 0;
      setBidAmount(Math.ceil(highest * 1.01));
    }
  }, [detail]);

  const handleBid = async () => {
    if (!selectedAuctionID || !generalId) return;
    try {
      await bidUnique.mutateAsync({
        auctionId: selectedAuctionID,
        generalId,
        amount: bidAmount,
        tryExtend: true,
      });
      alert("입찰 완료");
      refetch();
    } catch (e: any) {
      alert(e.message);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">로딩 중...</div>;

  return (
    <div className="bg0 text-sm">
      <div className="bg2 text-center p-2 font-semibold">유니크 아이템 경매장</div>

      {detail && (
        <div className="p-2 border-b border-gray-600 bg-zinc-900">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-cyan-400">경매 #{detail.id} 상세</h3>
            <button
              className="text-xs text-gray-500 hover:underline"
              onClick={() => setSelectedAuctionID(null)}
            >
              닫기
            </button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-xs mb-4">
            <div className="bg1 p-1">품명</div>
            <div>{detail.target}</div>
            <div className="bg1 p-1">주최</div>
            <div>{detail.hostGeneral?.name ?? "시스템"}</div>
            <div className="bg1 p-1">종료예정</div>
            <div className="font-mono">{cutDateTime(detail.closeDate, true)}</div>
            <div className="bg1 p-1">연장횟수</div>
            <div>{detail.detail?.remainCloseDateExtensionCnt ?? "무제한"}</div>
          </div>

          <div className="bg-zinc-800 p-2 rounded">
            <div className="text-xs text-gray-400 mb-1">입찰 기록 (상위 5건)</div>
            {(detail.bids as any[]).slice(0, 5).map((bid: any, i: number) => (
              <div
                key={i}
                className="flex justify-between font-mono text-[11px] border-b border-gray-700 py-1"
              >
                <span className={i === 0 ? "text-yellow-400" : "text-gray-300"}>
                  {bid.aux?.obfuscatedName || "익명"}
                </span>
                <span>{bid.amount.toLocaleString()} P</span>
              </div>
            ))}
          </div>

          {!detail.finished && (
            <div className="mt-4 flex gap-2 items-center">
              <span className="text-xs">내 입찰가:</span>
              <input
                type="number"
                className="bg-zinc-800 border border-gray-600 rounded p-1 text-sm flex-1"
                value={bidAmount}
                onChange={(e) => setBidAmount(parseInt(e.target.value) || 0)}
              />
              <Button size="sm" onClick={handleBid}>
                입찰하기
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-[50px_4fr_2fr_3fr_2fr_3fr] text-center border-b border-gray-600 bg-zinc-800 text-[10px] font-bold">
        <div className="p-1">번호</div>
        <div className="p-1">아이템</div>
        <div className="p-1">주최자</div>
        <div className="p-1">마감일시</div>
        <div className="p-1">연장</div>
        <div className="p-1 text-right pr-2">현재최고가</div>
      </div>
      {(auctions as any[] | undefined)?.map((a) => {
        const highest = a.bids[0];
        const detail = a.detail as any;
        return (
          <div
            key={a.id}
            className="grid grid-cols-[50px_4fr_2fr_3fr_2fr_3fr] text-center border-b border-gray-800 cursor-pointer hover:bg-zinc-700 items-center text-xs h-9"
            onClick={() => setSelectedAuctionID(a.id)}
          >
            <div className="p-1 font-mono text-gray-500">{a.id}</div>
            <div className="p-1 font-bold">{a.target}</div>
            <div className="p-1 truncate">{a.hostGeneral?.name ?? "시스템"}</div>
            <div className="p-1 font-mono text-[10px]">{cutDateTime(a.closeDate)}</div>
            <div className="p-1 text-[10px]">{detail.remainCloseDateExtensionCnt ?? "무"}</div>
            <div className="p-1 text-right pr-2 font-mono text-yellow-400">
              {(highest?.amount ?? detail.startBidAmount).toLocaleString()} P
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

export default function AuctionPage() {
  const [isResAuction, setIsResAuction] = useState(true);

  return (
    <>
      <TopBackBar title={isResAuction ? "경매장" : "유니크 경매장"} type="close" reloadable>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant={isResAuction ? "default" : "secondary"}
            onClick={() => setIsResAuction(true)}
            className="h-7 text-xs"
          >
            금/쌀
          </Button>
          <Button
            size="sm"
            variant={!isResAuction ? "default" : "secondary"}
            onClick={() => setIsResAuction(false)}
            className="h-7 text-xs"
          >
            유니크
          </Button>
        </div>
      </TopBackBar>

      <div className="w-full max-w-[1000px] mx-auto border border-gray-600 bg0 min-h-screen">
        {isResAuction ? <AuctionResource /> : <AuctionUniqueItem />}
      </div>
    </>
  );
}
