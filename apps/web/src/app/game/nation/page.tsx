'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NationBadge, inferNationType } from '@/components/NationBadge';
import { useNationList } from '@/hooks/useApi';
import { Users, MapPin, Coins, Wheat, Crown } from 'lucide-react';
import type { Nation } from '@/lib/api';

export default function NationListPage() {
    const { data: nations, isLoading } = useNationList();

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <p className="text-center text-muted-foreground">로딩 중...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2">국가 목록</h1>
                <p className="text-muted-foreground">현재 존재하는 모든 국가 정보입니다.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nations?.map((nation) => <NationCard key={nation.id} nation={nation} />)}
            </div>
        </div>
    );
}

function NationCard({ nation }: { nation: Nation }) {
    const nationColor = {
        wei: 'border-l-blue-500',
        shu: 'border-l-green-500',
        wu: 'border-l-red-500',
        jin: 'border-l-yellow-500',
        neutral: 'border-l-gray-500',
    }[nation.type || inferNationType(nation.name)];

    return (
        <Link href={`/game/nation/${nation.id}`}>
            <Card className={`border-l-4 ${nationColor} hover:shadow-md transition-shadow`}>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <NationBadge
                                name={nation.name}
                                type={nation.type || inferNationType(nation.name)}
                                size="lg"
                            />
                        </CardTitle>
                        {nation.kingName && (
                            <Badge variant="outline" className="gap-1">
                                <Crown className="h-3 w-3" />
                                {nation.kingName}
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        <StatItem icon={<Users className="h-4 w-4" />} label="장수" value={`${nation.generalCount}명`} />
                        <StatItem icon={<MapPin className="h-4 w-4" />} label="도시" value={`${nation.cityCount}개`} />
                        <StatItem icon={<Coins className="h-4 w-4" />} label="금" value={nation.gold?.toLocaleString() || '-'} />
                        <StatItem icon={<Wheat className="h-4 w-4" />} label="쌀" value={nation.rice?.toLocaleString() || '-'} />
                    </div>
                    {nation.capitalName && (
                        <p className="text-sm text-muted-foreground mt-4">
                            수도: {nation.capitalName}
                        </p>
                    )}
                </CardContent>
            </Card>
        </Link>
    );
}

function StatItem({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-muted-foreground">{icon}</span>
            <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="font-medium">{value}</p>
            </div>
        </div>
    );
}
