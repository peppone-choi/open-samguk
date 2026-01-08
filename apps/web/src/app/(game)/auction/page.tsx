"use client";

import React, { useState } from "react";
import { trpc } from "@/utils/trpc";
import { useGeneral } from "@/contexts/GeneralContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const AUCTION_TYPE_LABELS: Record<string, string> = {
  UniqueItem: "유니크 아이템",
  BuyRice: "쌀 판매",
  SellRice: "쌀 구매",
};

const RESOURCE_LABELS: Record<string, string> = {
  gold: "금",
  rice: "쌀",
  inheritancePoint: "유산 포인트",
};

function formatTimeRemaining(closeDate: string | Date): string {
  const end = new Date(closeDate).getTime();
  const now = Date.now();
  const diff = end - now;

  if (diff <= 0) return "종료됨";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}일 ${hours % 24}시간 남음`;
  }
  if (hours > 0) {
    return `${hours}시간 ${minutes}분 남음`;
  }
  return `${minutes}분 남음`;
}

interface AuctionItem {
  id: number;
  type: string;
  target: string;
  finished: boolean;
  closeDate: string;
  reqResource: string;
  detail: {
    title: string;
    hostName: string;
    isReverse: boolean;
    startBidAmount: number;
    finishBidAmount: number | null;
    amount: number | null;
  };
  hostGeneral: {
    no: number;
    name: string;
    nationId: number;
  } | null;
  _count: {
    bids: number;
  };
}

interface BidInfo {
  id: number;
  amount: number;
  date: string;
  general: {
    no: number;
    name: string;
  };
}

interface AuctionDetail {
  id: number;
  type: string;
  target: string;
  finished: boolean;
  closeDate: string;
  reqResource: string;
  detail: {
    title: string;
    hostName: string;
    isReverse: boolean;
    startBidAmount: number;
    finishBidAmount: number | null;
    amount: number | null;
  };
  hostGeneral: {
    no: number;
    name: string;
    nationId: number;
  } | null;
  bids: BidInfo[];
}

function AuctionList({
  auctions,
  onSelect,
  selectedId,
}: {
  auctions: AuctionItem[];
  onSelect: (id: number) => void;
  selectedId: number | null;
}) {
  if (auctions.length === 0) {
    return <div className="text-muted-foreground text-center py-12">진행 중인 경매가 없습니다</div>;
  }

  return (
    <div className="space-y-3">
      {auctions.map((auction) => {
        const isSelected = selectedId === auction.id;
        const timeRemaining = formatTimeRemaining(auction.closeDate);
        const isEnding = timeRemaining.includes("분") && !timeRemaining.includes("시간");

        return (
          <div
            key={auction.id}
            onClick={() => onSelect(auction.id)}
            className={`p-4 rounded-lg border cursor-pointer transition-colors ${isSelected
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-muted/50"
              }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 text-xs rounded bg-muted">
                    {AUCTION_TYPE_LABELS[auction.type] || auction.type}
                  </span>
                  {auction.detail.isReverse && (
                    <span className="px-2 py-0.5 text-xs rounded bg-yellow-500/20 text-yellow-600">
                      역경매
                    </span>
                  )}
                </div>
                <div className="font-medium truncate">{auction.detail.title}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  주최: {auction.hostGeneral?.name || auction.detail.hostName}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className={`text-sm font-medium ${isEnding ? "text-red-500" : ""}`}>
                  {timeRemaining}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  입찰 {auction._count.bids}건
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between text-sm">
              <div>
                <span className="text-muted-foreground">시작가: </span>
                <span className="font-medium">
                  {auction.detail.startBidAmount.toLocaleString()}{" "}
                  {RESOURCE_LABELS[auction.reqResource]}
                </span>
              </div>
              {auction.detail.finishBidAmount && (
                <div>
                  <span className="text-muted-foreground">즉시낙찰: </span>
                  <span className="font-medium text-primary">
                    {auction.detail.finishBidAmount.toLocaleString()}{" "}
                    {RESOURCE_LABELS[auction.reqResource]}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AuctionDetailPanel({
  auctionId,
  onBidSuccess,
}: {
  auctionId: number;
  onBidSuccess: () => void;
  selectedGeneralId: number | null;
}) {
  const [bidAmount, setBidAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const detailQuery = trpc.getAuctionDetail.useQuery({ id: auctionId });
  const bidMutation = trpc.bidAuction.useMutation({
    onSuccess: () => {
      setBidAmount("");
      setIsSubmitting(false);
      detailQuery.refetch();
      onBidSuccess();
    },
    onError: () => {
      setIsSubmitting(false);
    },
  });

  const auction = detailQuery.data as AuctionDetail | undefined;

  if (detailQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">경매 정보를 불러올 수 없습니다</div>
      </div>
    );
  }

  const highestBid = auction.bids?.[0];
  const currentBid = highestBid?.amount ?? auction.detail.startBidAmount;
  const minBid = currentBid + 1;
  const resourceLabel = RESOURCE_LABELS[auction.reqResource];
  const timeRemaining = formatTimeRemaining(auction.closeDate);
  const isEnded = timeRemaining === "종료됨";

  const handleBid = () => {
    const amount = parseInt(bidAmount, 10);
    if (isNaN(amount) || amount < minBid) return;

    if (!selectedGeneralId) {
      alert("입찰할 장수를 선택해주세요.");
      return;
    }

    bidMutation.mutate({
      auctionId: auction.id,
      generalId: selectedGeneralId,
      amount,
      tryExtend: true,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-0.5 text-xs rounded bg-muted">
            {AUCTION_TYPE_LABELS[auction.type] || auction.type}
          </span>
          {auction.detail.isReverse && (
            <span className="px-2 py-0.5 text-xs rounded bg-yellow-500/20 text-yellow-600">
              역경매
            </span>
          )}
        </div>
        <h3 className="text-xl font-bold">{auction.detail.title}</h3>
        <p className="text-muted-foreground mt-1">
          주최: {auction.hostGeneral?.name || auction.detail.hostName}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="text-sm text-muted-foreground">현재 최고가</div>
          <div className="text-2xl font-bold text-primary">
            {currentBid.toLocaleString()} {resourceLabel}
          </div>
          {highestBid && (
            <div className="text-xs text-muted-foreground mt-1">
              입찰자: {highestBid.general.name}
            </div>
          )}
        </div>
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="text-sm text-muted-foreground">남은 시간</div>
          <div className={`text-2xl font-bold ${isEnded ? "text-muted-foreground" : ""}`}>
            {timeRemaining}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            종료: {new Date(auction.closeDate).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">시작가: </span>
          <span className="font-medium">
            {auction.detail.startBidAmount.toLocaleString()} {resourceLabel}
          </span>
        </div>
        {auction.detail.finishBidAmount && (
          <div>
            <span className="text-muted-foreground">즉시낙찰가: </span>
            <span className="font-medium">
              {auction.detail.finishBidAmount.toLocaleString()} {resourceLabel}
            </span>
          </div>
        )}
        {auction.detail.amount && (
          <div>
            <span className="text-muted-foreground">수량: </span>
            <span className="font-medium">{auction.detail.amount.toLocaleString()}석</span>
          </div>
        )}
      </div>

      {!isEnded && (
        <div className="p-4 border rounded-lg">
          <div className="text-sm font-medium mb-3">입찰하기</div>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="number"
                placeholder={`최소 ${minBid.toLocaleString()} ${resourceLabel}`}
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                min={minBid}
              />
            </div>
            <Button onClick={handleBid} disabled={isSubmitting || !bidAmount}>
              {isSubmitting ? "입찰 중..." : "입찰"}
            </Button>
          </div>
          {bidMutation.error && (
            <div className="text-sm text-red-500 mt-2">
              {bidMutation.error.message || "입찰에 실패했습니다"}
            </div>
          )}
        </div>
      )}

      <div>
        <div className="text-sm font-medium mb-3">입찰 내역</div>
        {auction.bids.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-6 bg-muted/30 rounded-lg">
            아직 입찰이 없습니다
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {auction.bids.map((bid, index) => (
              <div
                key={bid.id}
                className={`flex items-center justify-between p-3 rounded-lg ${index === 0 ? "bg-primary/10 border border-primary/20" : "bg-muted/30"
                  }`}
              >
                <div className="flex items-center gap-3">
                  {index === 0 && (
                    <span className="text-xs px-1.5 py-0.5 bg-primary text-primary-foreground rounded">
                      최고
                    </span>
                  )}
                  <span className="font-medium">{bid.general.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {bid.amount.toLocaleString()} {resourceLabel}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(bid.date).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuctionPage() {
  const [selectedType, setSelectedType] = useState<string | undefined>(undefined);
  const [selectedAuctionId, setSelectedAuctionId] = useState<number | null>(null);
  const { selectedGeneralId } = useGeneral();

  const auctionsQuery = trpc.getAuctions.useQuery({ type: selectedType });
  const auctions = (auctionsQuery.data || []) as unknown as AuctionItem[];

  const types = ["all", "UniqueItem", "BuyRice", "SellRice"];

  if (auctionsQuery.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">경매장</h1>
        <p className="text-muted-foreground mt-2">자원 및 유니크 아이템을 거래하세요</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-primary">{auctions.length}</div>
            <div className="text-xs text-muted-foreground">진행 중</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-blue-500">
              {auctions.filter((a) => a.type === "UniqueItem").length}
            </div>
            <div className="text-xs text-muted-foreground">유니크 아이템</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-green-500">
              {auctions.filter((a) => a.type === "BuyRice").length}
            </div>
            <div className="text-xs text-muted-foreground">쌀 판매</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-yellow-500">
              {auctions.filter((a) => a.type === "SellRice").length}
            </div>
            <div className="text-xs text-muted-foreground">쌀 구매</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 flex-wrap">
        {types.map((type) => (
          <Button
            key={type}
            variant={
              (type === "all" && !selectedType) || selectedType === type ? "default" : "outline"
            }
            size="sm"
            onClick={() => setSelectedType(type === "all" ? undefined : type)}
          >
            {type === "all" ? "전체" : AUCTION_TYPE_LABELS[type] || type}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>경매 목록</CardTitle>
            <CardDescription>진행 중인 경매를 선택하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <AuctionList
              auctions={auctions}
              onSelect={setSelectedAuctionId}
              selectedId={selectedAuctionId}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>경매 상세</CardTitle>
            <CardDescription>선택한 경매의 상세 정보</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedAuctionId ? (
              <AuctionDetailPanel
                auctionId={selectedAuctionId}
                onBidSuccess={() => auctionsQuery.refetch()}
                selectedGeneralId={selectedGeneralId}
              />
            ) : (
              <div className="text-muted-foreground text-center py-12">
                좌측 목록에서 경매를 선택하세요
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
