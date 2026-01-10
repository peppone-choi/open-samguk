"use client";

import React, { useState, useEffect, useMemo } from "react";
import { TopBackBar } from "@/components/game";
import { Button } from "@/components/ui/button";
import { trpc } from "@/utils/trpc";
import { useGeneral } from "@/contexts/GeneralContext";

function cutDateTime(dateTime: string | Date, showSecond = false): string {
  const d = typeof dateTime === "string" ? new Date(dateTime) : dateTime;
  const iso = d.toISOString();
  if (showSecond) {
    return iso.slice(5, 19).replace("T", " ");
  }
  return iso.slice(5, 16).replace("T", " ");
}

function AuctionResource() {
  const { selectedGeneral } = useGeneral();
  const generalId = selectedGeneral?.no;

  const { data: auctions, isLoading, refetch } = trpc.getActiveResourceAuctionList.useQuery();
  const { data: finished } = trpc.getFinishedAuctions.useQuery({ limit: 20 });

  const bidBuyRice = trpc.bidAuction.useMutation();
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

  const buyRiceAuctions =
    (auctions as any[] | undefined)?.filter((a) => a.type === "BuyRice") || [];
  const sellRiceAuctions =
    (auctions as any[] | undefined)?.filter((a) => a.type === "SellRice") || [];

  if (isLoading)
    return (
      <div className="p-8 text-center text-gray-500 animate-pulse">
        거래소 데이터를 불러오는 중...
      </div>
    );

  return (
    <div className="glass text-sm p-4 rounded-b-xl space-y-6">
      <section className="space-y-2">
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-orange-500/30">
          <div className="w-1 h-4 bg-orange-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)]"></div>
          <h3 className="font-bold text-orange-400">
            쌀 구매{" "}
            <span className="text-xs text-muted-foreground font-normal">(쌀 판매자 목록)</span>
          </h3>
        </div>
        <div className="rounded-lg overflow-hidden border border-white/5 bg-black/20">
          <ResourceGrid
            auctions={buyRiceAuctions}
            onSelect={setSelectedAuctionID}
            resLabel="쌀"
            bidLabel="금"
          />
        </div>
      </section>

      <section className="space-y-2">
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-sky-400/30">
          <div className="w-1 h-4 bg-sky-400 rounded-full shadow-[0_0_10px_rgba(56,189,248,0.5)]"></div>
          <h3 className="font-bold text-sky-400">
            쌀 판매{" "}
            <span className="text-xs text-muted-foreground font-normal">(쌀 구매자 목록)</span>
          </h3>
        </div>
        <div className="rounded-lg overflow-hidden border border-white/5 bg-black/20">
          <ResourceGrid
            auctions={sellRiceAuctions}
            onSelect={setSelectedAuctionID}
            resLabel="금"
            bidLabel="쌀"
          />
        </div>
      </section>

      {selectedAuction && (
        <div className="premium-card !p-4 border-l-4 !border-l-primary animate-in fade-in slide-in-from-right-4">
          <div className="grid grid-cols-12 gap-4 items-center">
            <div className="col-span-12 lg:col-span-4 text-center lg:text-right font-mono text-sm">
              <span className="text-muted-foreground mr-2">#{selectedAuction.id}</span>
              <span className="text-primary font-bold">
                {selectedAuction.type === "BuyRice" ? "쌀" : "금"}{" "}
                {(selectedAuction.detail as any).amount.toLocaleString()}
              </span>
              <span className="mx-2 text-muted-foreground">경매에</span>
              <span className="text-cyan-400 font-bold">
                {selectedAuction.type === "BuyRice" ? "금" : "쌀"}
              </span>
            </div>
            <div className="col-span-8 lg:col-span-3">
              <input
                type="number"
                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded focus:border-primary/50 focus:ring-1 focus:ring-primary/50 text-white text-sm transition-all"
                value={bidAmount}
                onChange={(e) => setBidAmount(parseInt(e.target.value) || 0)}
                placeholder="입찰가 입력"
              />
            </div>
            <div className="col-span-4 lg:col-span-2">
              <Button size="sm" className="w-full btn-primary" onClick={handleBid}>
                입찰하기
              </Button>
            </div>
            <button
              className="col-span-12 lg:col-span-3 text-xs text-muted-foreground hover:text-white transition-colors"
              onClick={() => setSelectedAuctionID(null)}
            >
              닫기
            </button>
          </div>
        </div>
      )}

      <section className="bg-white/5 rounded-xl p-4 border border-white/5">
        <h3 className="text-base font-bold text-primary mb-4 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
          경매 등록
        </h3>
        <div className="grid grid-cols-12 gap-3 items-end text-xs">
          <div className="col-span-6 lg:col-span-2 space-y-1">
            <div className="text-muted-foreground">거래종류</div>
            <select
              className="w-full bg-black/40 border border-white/10 rounded p-2 text-white focus:border-primary/50 outline-none"
              value={openAuctionType}
              onChange={(e) => setOpenAuctionType(e.target.value as any)}
            >
              <option value="buyRice">쌀 판매 (금 입찰)</option>
              <option value="sellRice">쌀 구매 (쌀 입찰)</option>
            </select>
          </div>
          <div className="col-span-6 lg:col-span-2 space-y-1">
            <div className="text-muted-foreground">
              수량 ({openAuctionType === "buyRice" ? "쌀" : "금"})
            </div>
            <input
              type="number"
              className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded focus:border-primary/50 outline-none"
              value={openAmount}
              onChange={(e) => setOpenAmount(parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="col-span-6 lg:col-span-2 space-y-1">
            <div className="text-muted-foreground">종료(턴)</div>
            <input
              type="number"
              className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded focus:border-primary/50 outline-none"
              value={openCloseTurnCnt}
              onChange={(e) => setOpenCloseTurnCnt(parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="col-span-6 lg:col-span-2 space-y-1">
            <div className="text-muted-foreground">시작가</div>
            <input
              type="number"
              className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded focus:border-primary/50 outline-none"
              value={openStartBid}
              onChange={(e) => setOpenStartBid(parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="col-span-6 lg:col-span-2 space-y-1">
            <div className="text-muted-foreground">즉시낙찰</div>
            <input
              type="number"
              className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded focus:border-primary/50 outline-none"
              value={openFinishBid}
              onChange={(e) => setOpenFinishBid(parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="col-span-12 lg:col-span-2">
            <Button size="sm" className="w-full btn-primary" onClick={handleOpenAuction}>
              물품 등록
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-black/20 rounded-xl p-4 border border-white/5">
        <h3 className="text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider">
          Recent Transactions
        </h3>
        <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
          {(finished as any[] | undefined)?.map((a) => {
            const highest = a.bids[0];
            const detail = a.detail as any;
            return (
              <div
                key={a.id}
                className="text-xs py-1 border-b border-white/5 last:border-0 flex items-center justify-between group hover:bg-white/5 px-2 rounded transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground font-mono">
                    [{cutDateTime(a.closeDate)}]
                  </span>
                  <span className="font-medium text-white group-hover:text-primary transition-colors">
                    #{a.id} {detail.title}
                  </span>
                </div>
                {highest ? (
                  <span className="text-emerald-400 font-mono">
                    {highest.general?.name ?? "익명"} ➜ {highest.amount.toLocaleString()}
                  </span>
                ) : (
                  <span className="text-red-500/70 italic">유찰</span>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function ResourceGrid({ auctions, onSelect, resLabel, bidLabel }: any) {
  return (
    <>
      <div className="grid grid-cols-[50px_2fr_2fr_2fr_2fr_1.5fr_3fr_2fr] text-center border-b border-white/10 bg-white/5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
        <div className="p-2">No.</div>
        <div className="p-2">Seller</div>
        <div className="p-2">Item</div>
        <div className="p-2">Bidder</div>
        <div className="p-2">Price</div>
        <div className="p-2">Unit</div>
        <div className="p-2">Buyout</div>
        <div className="p-2">Close</div>
      </div>
      <div className="max-h-[300px] overflow-y-auto custom-scrollbar bg-black/20">
        {auctions.map((a: any) => {
          const detail = a.detail as any;
          const highest = a.bids[0];
          const currentPrice = highest?.amount ?? detail.startBidAmount;
          const unitPrice = (currentPrice / detail.amount).toFixed(2);
          return (
            <div
              key={a.id}
              className="grid grid-cols-[50px_2fr_2fr_2fr_2fr_1.5fr_3fr_2fr] text-center border-b border-white/5 cursor-pointer hover:bg-white/10 items-center text-xs h-10 transition-colors duration-200"
              onClick={() => onSelect(a.id)}
            >
              <div className="p-1 font-mono text-muted-foreground">{a.id}</div>
              <div className="p-1 truncate text-white">{a.hostGeneral?.name ?? "NPC"}</div>
              <div className="p-1 font-mono whitespace-nowrap text-primary/90">
                {resLabel} {detail.amount.toLocaleString()}
              </div>
              <div className="p-1 truncate text-muted-foreground">
                {highest?.general?.name ?? "-"}
              </div>
              <div
                className={`p-1 font-mono font-bold ${!highest ? "text-gray-500" : "text-amber-400"}`}
              >
                {bidLabel} {currentPrice.toLocaleString()}
              </div>
              <div className="p-1 font-mono text-[10px] text-muted-foreground">{unitPrice}</div>
              <div className="p-1 font-mono text-cyan-400">
                {bidLabel} {detail.finishBidAmount.toLocaleString()}
              </div>
              <div className="p-1 font-mono text-[10px] text-muted-foreground">
                {cutDateTime(a.closeDate)}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

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

  if (isLoading)
    return (
      <div className="p-8 text-center text-gray-500 animate-pulse">명품 경매장 로딩 중...</div>
    );

  return (
    <div className="glass text-sm p-4 rounded-b-xl space-y-6">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-purple-500/30">
        <div className="w-1 h-4 bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
        <h3 className="font-bold text-purple-400">유니크 아이템 경매장</h3>
      </div>

      {detail && (
        <div className="premium-card !p-0 overflow-hidden mb-6 border-purple-500/30 animate-in fade-in slide-in-from-top-4">
          <div className="p-3 bg-white/5 border-b border-white/5 flex justify-between items-center">
            <h3 className="font-bold text-cyan-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              경매 #{detail.id} 상세 정보
            </h3>
            <button
              className="text-xs text-muted-foreground hover:text-white transition-colors"
              onClick={() => setSelectedAuctionID(null)}
            >
              닫기
            </button>
          </div>

          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="bg-black/30 p-2 rounded border border-white/5">
                <span className="text-muted-foreground block mb-1">품명</span>
                <span className="text-white font-medium text-sm">{detail.target}</span>
              </div>
              <div className="bg-black/30 p-2 rounded border border-white/5">
                <span className="text-muted-foreground block mb-1">주최</span>
                <span className="text-white font-medium text-sm">
                  {detail.hostGeneral?.name ?? "시스템"}
                </span>
              </div>
              <div className="bg-black/30 p-2 rounded border border-white/5">
                <span className="text-muted-foreground block mb-1">종료예정</span>
                <span className="text-orange-400 font-mono">
                  {cutDateTime(detail.closeDate, true)}
                </span>
              </div>
              <div className="bg-black/30 p-2 rounded border border-white/5">
                <span className="text-muted-foreground block mb-1">연장횟수</span>
                <span className="text-white">
                  {detail.detail?.remainCloseDateExtensionCnt ?? "무제한"}
                </span>
              </div>
            </div>

            <div className="bg-black/40 p-3 rounded-lg border border-white/5">
              <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wide font-semibold">
                Bid History (Top 5)
              </div>
              <div className="space-y-1">
                {(detail.bids as any[]).slice(0, 5).map((bid: any, i: number) => (
                  <div
                    key={i}
                    className="flex justify-between font-mono text-xs border-b border-white/5 pb-1 last:border-0"
                  >
                    <span className={i === 0 ? "text-yellow-400 font-bold" : "text-gray-400"}>
                      {i + 1}. {bid.aux?.obfuscatedName || "익명"}
                    </span>
                    <span className="text-white">{bid.amount.toLocaleString()} P</span>
                  </div>
                ))}
              </div>
            </div>

            {!detail.finished && (
              <div className="flex gap-2 items-center bg-primary/5 p-3 rounded-lg border border-primary/20">
                <span className="text-xs font-bold text-primary">내 입찰가:</span>
                <input
                  type="number"
                  className="bg-black/40 border border-white/10 rounded px-3 py-1.5 text-sm flex-1 focus:border-primary/50 text-white outline-none"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(parseInt(e.target.value) || 0)}
                />
                <Button size="sm" onClick={handleBid} className="btn-primary">
                  입찰하기
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="rounded-lg overflow-hidden border border-white/5 bg-black/20">
        <div className="grid grid-cols-[50px_4fr_2fr_3fr_2fr_3fr] text-center border-b border-white/10 bg-white/5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          <div className="p-2">No.</div>
          <div className="p-2">Item</div>
          <div className="p-2">Host</div>
          <div className="p-2">Deadline</div>
          <div className="p-2">Ext.</div>
          <div className="p-2 text-right pr-4">Current High</div>
        </div>
        <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
          {(auctions as any[] | undefined)?.map((a) => {
            const highest = a.bids[0];
            const detail = a.detail as any;
            return (
              <div
                key={a.id}
                className="grid grid-cols-[50px_4fr_2fr_3fr_2fr_3fr] text-center border-b border-white/5 cursor-pointer hover:bg-white/10 items-center text-xs h-12 transition-colors duration-200"
                onClick={() => setSelectedAuctionID(a.id)}
              >
                <div className="p-1 font-mono text-muted-foreground">{a.id}</div>
                <div className="p-1 font-bold text-purple-300">{a.target}</div>
                <div className="p-1 truncate text-gray-400">{a.hostGeneral?.name ?? "시스템"}</div>
                <div className="p-1 font-mono text-[10px] text-muted-foreground">
                  {cutDateTime(a.closeDate)}
                </div>
                <div className="p-1 text-[10px] text-gray-500">
                  {detail.remainCloseDateExtensionCnt ?? "∞"}
                </div>
                <div className="p-1 text-right pr-4 font-mono text-yellow-400 font-bold text-sm">
                  {(highest?.amount ?? detail.startBidAmount).toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function AuctionPage() {
  const [isResAuction, setIsResAuction] = useState(true);

  return (
    <>
      <TopBackBar title={isResAuction ? "거래소" : "명품 경매장"} type="close" reloadable>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={isResAuction ? "default" : "secondary"}
            onClick={() => setIsResAuction(true)}
            className={`h-8 text-xs font-bold transition-all ${isResAuction ? "bg-primary text-black shadow-glow" : "bg-white/10 text-gray-400 hover:text-white"}`}
          >
            금/쌀 거래소
          </Button>
          <Button
            size="sm"
            variant={!isResAuction ? "default" : "secondary"}
            onClick={() => setIsResAuction(false)}
            className={`h-8 text-xs font-bold transition-all ${!isResAuction ? "bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]" : "bg-white/10 text-gray-400 hover:text-white"}`}
          >
            유니크 경매
          </Button>
        </div>
      </TopBackBar>

      <div className="w-full max-w-[1000px] mx-auto min-h-screen">
        {isResAuction ? <AuctionResource /> : <AuctionUniqueItem />}
      </div>
    </>
  );
}
