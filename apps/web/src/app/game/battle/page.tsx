'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Swords, Shield, Users, Map } from 'lucide-react';

export default function BattlePage() {
    return (
        <div className="container mx-auto px-4 py-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2">전투</h1>
                <p className="text-muted-foreground">전투 정보 및 전쟁 현황을 확인합니다.</p>
            </div>

            <Tabs defaultValue="status" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="status" className="gap-1">
                        <Swords className="h-4 w-4" />
                        전투 현황
                    </TabsTrigger>
                    <TabsTrigger value="logs" className="gap-1">
                        <Map className="h-4 w-4" />
                        전투 기록
                    </TabsTrigger>
                    <TabsTrigger value="troops" className="gap-1">
                        <Users className="h-4 w-4" />
                        부대 정보
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="status" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 진행 중인 전투 */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Swords className="h-5 w-5 text-red-500" />
                                    진행 중인 전투
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground text-center py-8">
                                    현재 진행 중인 전투가 없습니다.
                                </p>
                            </CardContent>
                        </Card>

                        {/* 방어 현황 */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-blue-500" />
                                    방어 현황
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground text-center py-8">
                                    수비 중인 도시가 없습니다.
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* 분쟁 지역 */}
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>분쟁 지역</CardTitle>
                            <CardDescription>현재 전쟁 중인 지역 목록</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground text-center py-8">
                                현재 분쟁 중인 지역이 없습니다.
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="logs" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>최근 전투 기록</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground text-center py-8">
                                전투 기록이 없습니다.
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="troops" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>부대 편성</CardTitle>
                            <CardDescription>부대를 편성하고 관리합니다.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center justify-center py-8 gap-4">
                                <p className="text-muted-foreground">소속된 부대가 없습니다.</p>
                                <Button>
                                    <Users className="h-4 w-4 mr-2" />
                                    부대 생성
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
