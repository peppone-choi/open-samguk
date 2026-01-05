'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { GameHeader } from '@/components/GameHeader';
import { useAuctionList, useBid, useMyGeneral, useGameConst } from '@/hooks/useApi';
import { inferNationType } from '@/components/NationBadge';
import { Coins, Wheat, Gavel, Clock, Star } from 'lucide-react';

export default function AuctionPage() {
    const { data: myGeneral } = useMyGeneral();
    const { data: gameConst } = useGameConst();
    const { data: auctions, isLoading } = useAuctionList();
    const bidMutation = useBid();

    const [selectedAuction, setSelectedAuction] = useState<any>(null);
    const [bidAmount, setBidAmount] = useState('');

    const handleBid = async () => {
        if (!selectedAuction || !bidAmount) return;

        try {
            await bidMutation.mutateAsync({
                auctionId: selectedAuction.id,
                amount: parseInt(bidAmount, 10),
            });
            setSelectedAuction(null);
            setBidAmount('');
        } catch (error) {
            console.error('입찰 실패:', error);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <GameHeader
                gameDate={gameConst ? { year: gameConst.year, month: gameConst.month } : undefined}
                serverName={gameConst?.serverName}
                generalName={myGeneral?.name}
                nationName={myGeneral?.nationName}
                nationColor={myGeneral?.nationName ? inferNationType(myGeneral.nationName) : undefined}
            />

            <main className="flex-1 container mx-auto px-4 py-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold mb-2">경매장</h1>
                    <p className="text-muted-foreground">자원과 아이템을 경매로 거래합니다.</p>
                </div>

                <Tabs defaultValue="resource" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="resource" className="gap-1">
                            <Coins className="h-4 w-4" />
                            자원 경매
                        </TabsTrigger>
                        <TabsTrigger value="unique" className="gap-1">
                            <Star className="h-4 w-4" />
                            유니크 경매
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="resource" className="mt-6">
                        {isLoading ? (
                            <p className="text-center text-muted-foreground py-8">로딩 중...</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* 예시 경매 아이템 */}
                                <AuctionCard
                                    type="gold"
                                    amount={10000}
                                    currentBid={5000}
                                    bidder="홍길동"
                                    endTime="2시간 후"
                                    onBid={() => setSelectedAuction({ id: 1, type: 'gold', amount: 10000 })}
                                />
                                <AuctionCard
                                    type="rice"
                                    amount={20000}
                                    currentBid={8000}
                                    bidder="장비"
                                    endTime="3시간 후"
                                    onBid={() => setSelectedAuction({ id: 2, type: 'rice', amount: 20000 })}
                                />
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="unique" className="mt-6">
                        <Card>
                            <CardContent className="py-8 text-center">
                                <p className="text-muted-foreground">
                                    현재 진행 중인 유니크 경매가 없습니다.
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* 입찰 다이얼로그 */}
                <Dialog open={!!selectedAuction} onOpenChange={() => setSelectedAuction(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>입찰하기</DialogTitle>
                            <DialogDescription>
                                {selectedAuction?.type === 'gold' ? '금' : '쌀'}{' '}
                                {selectedAuction?.amount?.toLocaleString()} 경매에 입찰합니다.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <label className="text-sm font-medium">입찰 금액</label>
                            <Input
                                type="number"
                                placeholder="입찰 금액 입력"
                                value={bidAmount}
                                onChange={(e) => setBidAmount(e.target.value)}
                                className="mt-2"
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setSelectedAuction(null)}>
                                취소
                            </Button>
                            <Button onClick={handleBid} disabled={bidMutation.isPending || !bidAmount}>
                                {bidMutation.isPending ? '입찰 중...' : '입찰'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    );
}

interface AuctionCardProps {
    type: 'gold' | 'rice';
    amount: number;
    currentBid: number;
    bidder: string;
    endTime: string;
    onBid: () => void;
}

function AuctionCard({ type, amount, currentBid, bidder, endTime, onBid }: AuctionCardProps) {
    const Icon = type === 'gold' ? Coins : Wheat;
    const colorClass = type === 'gold' ? 'text-yellow-600' : 'text-amber-700';

    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className={`flex items-center gap-2 ${colorClass}`}>
                        <Icon className="h-5 w-5" />
                        {type === 'gold' ? '금' : '쌀'} {amount.toLocaleString()}
                    </CardTitle>
                    <Badge variant="outline" className="gap-1">
                        <Clock className="h-3 w-3" />
                        {endTime}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">현재 입찰가</span>
                        <span className="font-medium">{currentBid.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">최고 입찰자</span>
                        <span className="font-medium">{bidder}</span>
                    </div>
                </div>
                <Button onClick={onBid} className="w-full gap-1">
                    <Gavel className="h-4 w-4" />
                    입찰하기
                </Button>
            </CardContent>
        </Card>
    );
}
