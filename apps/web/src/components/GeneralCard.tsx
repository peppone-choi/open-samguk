'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { NationBadge, inferNationType } from '@/components/NationBadge';
import { ResourceSummary } from '@/components/ResourceBar';
import { cn } from '@/lib/utils';
import type { General } from '@/lib/api';

interface GeneralCardProps {
    /** 장수 정보 */
    general: General;
    /** 카드 변형 */
    variant?: 'default' | 'compact' | 'detailed';
    /** 클릭 시 상세 페이지로 이동 */
    linkToDetail?: boolean;
    /** 추가 클래스 */
    className?: string;
}

export function GeneralCard({
    general,
    variant = 'default',
    linkToDetail = true,
    className,
}: GeneralCardProps) {
    const content = (
        <Card className={cn('transition-shadow hover:shadow-md', className)}>
            {variant === 'compact' ? (
                <CompactContent general={general} />
            ) : variant === 'detailed' ? (
                <DetailedContent general={general} />
            ) : (
                <DefaultContent general={general} />
            )}
        </Card>
    );

    if (linkToDetail) {
        return <Link href={`/game/general/${general.id}`}>{content}</Link>;
    }

    return content;
}

function DefaultContent({ general }: { general: General }) {
    return (
        <>
            <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                        <AvatarImage src={general.imgPath} alt={general.name} />
                        <AvatarFallback>{general.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                            {general.name}
                            {general.officerLevel > 0 && (
                                <Badge variant="outline" className="text-xs">
                                    Lv.{general.officerLevel}
                                </Badge>
                            )}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                            {general.nationName && (
                                <NationBadge
                                    name={general.nationName}
                                    type={inferNationType(general.nationName)}
                                    size="sm"
                                />
                            )}
                            {general.cityName && (
                                <span className="text-sm text-muted-foreground">
                                    {general.cityName}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-3 gap-2 text-center mb-4">
                    <StatItem label="통솔" value={general.leadership} />
                    <StatItem label="무력" value={general.strength} />
                    <StatItem label="지력" value={general.intel} />
                </div>
                <ResourceSummary
                    troops={general.troops}
                    maxTroops={general.maxTroops}
                    train={general.train}
                    atmos={general.atmos}
                    compact
                />
            </CardContent>
        </>
    );
}

function CompactContent({ general }: { general: General }) {
    return (
        <CardContent className="p-3">
            <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                    <AvatarImage src={general.imgPath} alt={general.name} />
                    <AvatarFallback className="text-xs">{general.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{general.name}</span>
                        {general.nationName && (
                            <NationBadge
                                name={general.nationName}
                                type={inferNationType(general.nationName)}
                                size="sm"
                            />
                        )}
                    </div>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                        <span>통{general.leadership}</span>
                        <span>무{general.strength}</span>
                        <span>지{general.intel}</span>
                    </div>
                </div>
            </div>
        </CardContent>
    );
}

function DetailedContent({ general }: { general: General }) {
    return (
        <>
            <CardHeader>
                <div className="flex items-start gap-4">
                    <Avatar className="h-20 w-20">
                        <AvatarImage src={general.imgPath} alt={general.name} />
                        <AvatarFallback className="text-2xl">{general.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <CardTitle className="text-xl flex items-center gap-2">
                            {general.name}
                            {general.officerLevel > 0 && (
                                <Badge variant="outline">관직 Lv.{general.officerLevel}</Badge>
                            )}
                        </CardTitle>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                            {general.nationName && (
                                <NationBadge
                                    name={general.nationName}
                                    type={inferNationType(general.nationName)}
                                />
                            )}
                            {general.cityName && (
                                <Badge variant="secondary">{general.cityName}</Badge>
                            )}
                            <Badge variant="outline">Lv.{general.level}</Badge>
                        </div>
                        {(general.specialWar || general.specialDomestic) && (
                            <div className="flex gap-2 mt-2">
                                {general.specialWar && (
                                    <Badge className="bg-red-100 text-red-800">
                                        {general.specialWar}
                                    </Badge>
                                )}
                                {general.specialDomestic && (
                                    <Badge className="bg-blue-100 text-blue-800">
                                        {general.specialDomestic}
                                    </Badge>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* 능력치 */}
                <div className="grid grid-cols-3 gap-4">
                    <StatItemLarge label="통솔" value={general.leadership} />
                    <StatItemLarge label="무력" value={general.strength} />
                    <StatItemLarge label="지력" value={general.intel} />
                </div>

                {/* 자원 */}
                <div className="grid grid-cols-2 gap-4">
                    <ResourceSummary gold={general.gold} rice={general.rice} />
                </div>

                {/* 병력 상태 */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>병력</span>
                        <span>
                            {general.troops.toLocaleString()} / {general.maxTroops.toLocaleString()}
                        </span>
                    </div>
                    <Progress value={(general.troops / general.maxTroops) * 100} className="h-2" />

                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                            <div className="flex justify-between text-sm">
                                <span>훈련도</span>
                                <span>{general.train}%</span>
                            </div>
                            <Progress value={general.train} className="h-2" />
                        </div>
                        <div>
                            <div className="flex justify-between text-sm">
                                <span>사기</span>
                                <span>{general.atmos}%</span>
                            </div>
                            <Progress value={general.atmos} className="h-2" />
                        </div>
                    </div>
                </div>

                {/* 경험치 */}
                <div>
                    <div className="flex justify-between text-sm">
                        <span>경험치</span>
                        <span>Lv.{general.level}</span>
                    </div>
                    <Progress value={general.exp % 100} className="h-2" />
                </div>
            </CardContent>
        </>
    );
}

function StatItem({ label, value }: { label: string; value: number }) {
    return (
        <div className="bg-muted rounded-md p-2">
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="text-lg font-bold">{value}</div>
        </div>
    );
}

function StatItemLarge({ label, value }: { label: string; value: number }) {
    // 능력치에 따른 색상
    const getColor = (val: number) => {
        if (val >= 90) return 'text-red-500';
        if (val >= 80) return 'text-orange-500';
        if (val >= 70) return 'text-yellow-600';
        return 'text-foreground';
    };

    return (
        <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">{label}</div>
            <div className={cn('text-2xl font-bold', getColor(value))}>{value}</div>
        </div>
    );
}
