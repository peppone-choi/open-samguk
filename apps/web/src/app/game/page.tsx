'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GeneralCard } from '@/components/GeneralCard';
import { CommandPanel } from '@/components/CommandPanel';
import { ResourceSummary } from '@/components/ResourceBar';
import {
    useMyGeneral,
    useAvailableCommands,
    useMessages,
    useExecuteCommand,
} from '@/hooks/useApi';
import { MessageSquare, Bell, Globe } from 'lucide-react';

export default function GameMainPage() {
    const { data: myGeneral, isLoading: generalLoading } = useMyGeneral();
    const { data: commands, isLoading: commandsLoading } = useAvailableCommands();
    const { data: messages } = useMessages();
    const executeCommand = useExecuteCommand();

    const handleExecuteCommand = async (commandId: string, params?: Record<string, unknown>) => {
        await executeCommand.mutateAsync({ commandId, params });
    };

    if (generalLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <p className="text-center text-muted-foreground">로딩 중...</p>
            </div>
        );
    }

    if (!myGeneral) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card>
                    <CardContent className="py-8 text-center">
                        <p className="text-muted-foreground">장수 정보를 불러올 수 없습니다.</p>
                        <p className="text-sm text-muted-foreground mt-2">
                            먼저 장수를 생성해주세요.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 왼쪽: 장수 정보 및 자원 */}
                <div className="lg:col-span-1 space-y-6">
                    {/* 내 장수 정보 */}
                    <GeneralCard general={myGeneral} variant="detailed" linkToDetail={false} />

                    {/* 자원 요약 */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">보유 자원</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResourceSummary
                                gold={myGeneral.gold}
                                rice={myGeneral.rice}
                                troops={myGeneral.troops}
                                maxTroops={myGeneral.maxTroops}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* 오른쪽: 명령 패널 및 메시지 */}
                <div className="lg:col-span-2 space-y-6">
                    {/* 명령 패널 */}
                    {commands && (
                        <CommandPanel
                            commands={commands}
                            onExecute={handleExecuteCommand}
                            isLoading={executeCommand.isPending}
                        />
                    )}

                    {/* 메시지 패널 */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">메시지</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="all">
                                <TabsList>
                                    <TabsTrigger value="all" className="gap-1">
                                        <Globe className="h-4 w-4" />
                                        전체
                                    </TabsTrigger>
                                    <TabsTrigger value="nation" className="gap-1">
                                        <MessageSquare className="h-4 w-4" />
                                        국가
                                    </TabsTrigger>
                                    <TabsTrigger value="personal" className="gap-1">
                                        <Bell className="h-4 w-4" />
                                        개인
                                    </TabsTrigger>
                                </TabsList>
                                <TabsContent value="all" className="mt-4">
                                    <MessageList messages={messages || []} />
                                </TabsContent>
                                <TabsContent value="nation" className="mt-4">
                                    <MessageList
                                        messages={(messages || []).filter(
                                            (m) => m.type === 'nation'
                                        )}
                                    />
                                </TabsContent>
                                <TabsContent value="personal" className="mt-4">
                                    <MessageList
                                        messages={(messages || []).filter(
                                            (m) => m.type === 'personal'
                                        )}
                                    />
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

interface Message {
    id: number;
    type: string;
    content: string;
    date: string;
    sender?: string;
}

function MessageList({ messages }: { messages: Message[] }) {
    if (messages.length === 0) {
        return <p className="text-muted-foreground text-center py-4">메시지가 없습니다.</p>;
    }

    return (
        <div className="space-y-2 max-h-80 overflow-y-auto">
            {messages.map((message) => (
                <div key={message.id} className="p-3 rounded-lg bg-muted/50">
                    <div className="flex justify-between items-start mb-1">
                        {message.sender && (
                            <span className="text-sm font-medium">{message.sender}</span>
                        )}
                        <span className="text-xs text-muted-foreground">{message.date}</span>
                    </div>
                    <p className="text-sm">{message.content}</p>
                </div>
            ))}
        </div>
    );
}
