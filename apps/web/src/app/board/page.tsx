'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { GameHeader } from '@/components/GameHeader';
import { useBoardList, useMyGeneral, useGameConst } from '@/hooks/useApi';
import { inferNationType } from '@/components/NationBadge';
import { MessageSquare, Lock, Globe, PenSquare } from 'lucide-react';

export default function BoardPage() {
    const { data: myGeneral } = useMyGeneral();
    const { data: gameConst } = useGameConst();
    const [activeTab, setActiveTab] = useState('public');

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
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">게시판</h1>
                        <p className="text-muted-foreground">소통과 정보 공유의 공간입니다.</p>
                    </div>
                    <Button className="gap-1">
                        <PenSquare className="h-4 w-4" />
                        글쓰기
                    </Button>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="public" className="gap-1">
                            <Globe className="h-4 w-4" />
                            회의실
                        </TabsTrigger>
                        <TabsTrigger value="nation" className="gap-1">
                            <MessageSquare className="h-4 w-4" />
                            국가 게시판
                        </TabsTrigger>
                        <TabsTrigger value="secret" className="gap-1">
                            <Lock className="h-4 w-4" />
                            기밀실
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="public" className="mt-6">
                        <BoardContent type="public" />
                    </TabsContent>

                    <TabsContent value="nation" className="mt-6">
                        <BoardContent type="nation" />
                    </TabsContent>

                    <TabsContent value="secret" className="mt-6">
                        <BoardContent type="secret" />
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}

function BoardContent({ type }: { type: string }) {
    const { data: posts, isLoading } = useBoardList(type);

    if (isLoading) {
        return <p className="text-center text-muted-foreground py-8">로딩 중...</p>;
    }

    // 예시 데이터
    const mockPosts = [
        { id: 1, title: '공지사항입니다', author: '운영자', date: '2024-01-15', views: 150, comments: 5 },
        { id: 2, title: '이번 시즌 전략 공유', author: '장비', date: '2024-01-14', views: 80, comments: 12 },
        { id: 3, title: '신규 유저 가이드', author: '제갈량', date: '2024-01-13', views: 200, comments: 8 },
    ];

    return (
        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12 text-center">번호</TableHead>
                            <TableHead>제목</TableHead>
                            <TableHead className="w-24">작성자</TableHead>
                            <TableHead className="w-24 text-center">날짜</TableHead>
                            <TableHead className="w-16 text-center">조회</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockPosts.map((post) => (
                            <TableRow key={post.id} className="cursor-pointer hover:bg-muted/50">
                                <TableCell className="text-center text-muted-foreground">
                                    {post.id}
                                </TableCell>
                                <TableCell>
                                    <Link href={`/board/${type}/${post.id}`} className="hover:underline">
                                        {post.title}
                                        {post.comments > 0 && (
                                            <Badge variant="secondary" className="ml-2 text-xs">
                                                {post.comments}
                                            </Badge>
                                        )}
                                    </Link>
                                </TableCell>
                                <TableCell>{post.author}</TableCell>
                                <TableCell className="text-center text-muted-foreground">
                                    {post.date}
                                </TableCell>
                                <TableCell className="text-center text-muted-foreground">
                                    {post.views}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
