'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { GeneralCard } from '@/components/GeneralCard';
import { NationBadge, inferNationType } from '@/components/NationBadge';
import { useGeneralList, useNationList } from '@/hooks/useApi';
import { Search, Filter } from 'lucide-react';
import type { General } from '@/lib/api';

export default function GeneralListPage() {
    const { data: generals, isLoading } = useGeneralList();
    const { data: nations } = useNationList();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedNation, setSelectedNation] = useState<number | null>(null);

    const filteredGenerals = generals?.filter((general) => {
        const matchesSearch = general.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesNation = selectedNation === null || general.nation === selectedNation;
        return matchesSearch && matchesNation;
    });

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2">장수 목록</h1>
                <p className="text-muted-foreground">모든 장수의 정보를 확인할 수 있습니다.</p>
            </div>

            {/* 필터 */}
            <Card className="mb-6">
                <CardContent className="py-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* 검색 */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="장수 이름 검색..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        {/* 국가 필터 */}
                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant={selectedNation === null ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setSelectedNation(null)}
                            >
                                전체
                            </Button>
                            {nations?.map((nation) => (
                                <Button
                                    key={nation.id}
                                    variant={selectedNation === nation.id ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setSelectedNation(nation.id)}
                                >
                                    <NationBadge
                                        name={nation.name}
                                        type={inferNationType(nation.name)}
                                        size="sm"
                                    />
                                </Button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 장수 목록 */}
            {isLoading ? (
                <p className="text-center text-muted-foreground py-8">로딩 중...</p>
            ) : filteredGenerals?.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                    검색 결과가 없습니다.
                </p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredGenerals?.map((general) => (
                        <GeneralCard key={general.id} general={general} />
                    ))}
                </div>
            )}

            {/* 통계 */}
            {filteredGenerals && (
                <p className="text-center text-muted-foreground mt-6">
                    총 {filteredGenerals.length}명의 장수
                </p>
            )}
        </div>
    );
}
