'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Coins, Wheat, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { Command } from '@/lib/api';

interface CommandPanelProps {
    /** 사용 가능한 명령 목록 */
    commands: Command[];
    /** 명령 실행 핸들러 */
    onExecute: (commandId: string, params?: Record<string, unknown>) => Promise<void>;
    /** 로딩 상태 */
    isLoading?: boolean;
    /** 추가 클래스 */
    className?: string;
}

type CommandCategory = 'domestic' | 'military' | 'diplomacy' | 'personal';

const categoryLabels: Record<CommandCategory, string> = {
    domestic: '내정',
    military: '군사',
    diplomacy: '외교',
    personal: '개인',
};

const categoryIcons: Record<CommandCategory, string> = {
    domestic: '🏛️',
    military: '⚔️',
    diplomacy: '🤝',
    personal: '👤',
};

export function CommandPanel({
    commands,
    onExecute,
    isLoading = false,
    className,
}: CommandPanelProps) {
    const [selectedCommand, setSelectedCommand] = useState<Command | null>(null);
    const [executing, setExecuting] = useState(false);
    const [params, setParams] = useState<Record<string, unknown>>({});

    // 카테고리별로 명령 분류
    const commandsByCategory = commands.reduce(
        (acc, cmd) => {
            const category = cmd.category as CommandCategory;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(cmd);
            return acc;
        },
        {} as Record<CommandCategory, Command[]>
    );

    const handleSelectCommand = (command: Command) => {
        if (!command.available) return;
        setSelectedCommand(command);
        setParams({});
    };

    const handleExecute = async () => {
        if (!selectedCommand) return;

        setExecuting(true);
        try {
            await onExecute(selectedCommand.id, params);
            setSelectedCommand(null);
        } finally {
            setExecuting(false);
        }
    };

    const categories = Object.keys(commandsByCategory) as CommandCategory[];

    return (
        <>
            <Card className={className}>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg">명령</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue={categories[0]} className="w-full">
                        <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${categories.length}, 1fr)` }}>
                            {categories.map((category) => (
                                <TabsTrigger key={category} value={category} className="text-xs sm:text-sm">
                                    <span className="mr-1 hidden sm:inline">{categoryIcons[category]}</span>
                                    {categoryLabels[category]}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        {categories.map((category) => (
                            <TabsContent key={category} value={category} className="mt-4">
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                    {commandsByCategory[category]?.map((cmd) => (
                                        <CommandButton
                                            key={cmd.id}
                                            command={cmd}
                                            onClick={() => handleSelectCommand(cmd)}
                                        />
                                    ))}
                                </div>
                            </TabsContent>
                        ))}
                    </Tabs>
                </CardContent>
            </Card>

            {/* 명령 실행 확인 다이얼로그 */}
            <Dialog open={!!selectedCommand} onOpenChange={() => setSelectedCommand(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selectedCommand?.name}</DialogTitle>
                        <DialogDescription>{selectedCommand?.description}</DialogDescription>
                    </DialogHeader>

                    {selectedCommand?.cost && (
                        <div className="flex flex-wrap gap-2 py-2">
                            {selectedCommand.cost.gold && (
                                <Badge variant="outline" className="gap-1">
                                    <Coins className="h-3 w-3" />
                                    {selectedCommand.cost.gold.toLocaleString()} 금
                                </Badge>
                            )}
                            {selectedCommand.cost.rice && (
                                <Badge variant="outline" className="gap-1">
                                    <Wheat className="h-3 w-3" />
                                    {selectedCommand.cost.rice.toLocaleString()} 쌀
                                </Badge>
                            )}
                            {selectedCommand.cost.turn && (
                                <Badge variant="outline" className="gap-1">
                                    <Clock className="h-3 w-3" />
                                    {selectedCommand.cost.turn} 턴
                                </Badge>
                            )}
                        </div>
                    )}

                    {/* TODO: 명령별 파라미터 입력 폼 */}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedCommand(null)}>
                            취소
                        </Button>
                        <Button onClick={handleExecute} disabled={executing || isLoading}>
                            {executing ? '실행 중...' : '실행'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

interface CommandButtonProps {
    command: Command;
    onClick: () => void;
}

function CommandButton({ command, onClick }: CommandButtonProps) {
    return (
        <Button
            variant={command.available ? 'outline' : 'ghost'}
            className={cn(
                'h-auto py-2 px-3 justify-start flex-col items-start',
                !command.available && 'opacity-50 cursor-not-allowed'
            )}
            onClick={onClick}
            disabled={!command.available}
        >
            <span className="font-medium text-sm">{command.name}</span>
            {command.cost && (
                <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    {command.cost.gold && (
                        <span className="flex items-center gap-0.5">
                            <Coins className="h-2.5 w-2.5" />
                            {command.cost.gold}
                        </span>
                    )}
                    {command.cost.rice && (
                        <span className="flex items-center gap-0.5">
                            <Wheat className="h-2.5 w-2.5" />
                            {command.cost.rice}
                        </span>
                    )}
                </span>
            )}
            {!command.available && command.reason && (
                <span className="text-xs text-destructive mt-1">{command.reason}</span>
            )}
        </Button>
    );
}

/** 간단한 명령 버튼 그리드 */
interface QuickCommandsProps {
    commands: { id: string; name: string; icon?: React.ReactNode }[];
    onExecute: (commandId: string) => void;
    disabled?: boolean;
}

export function QuickCommands({ commands, onExecute, disabled }: QuickCommandsProps) {
    return (
        <div className="flex flex-wrap gap-2">
            {commands.map((cmd) => (
                <Button
                    key={cmd.id}
                    variant="secondary"
                    size="sm"
                    onClick={() => onExecute(cmd.id)}
                    disabled={disabled}
                    className="gap-1"
                >
                    {cmd.icon}
                    {cmd.name}
                </Button>
            ))}
        </div>
    );
}
