'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { NationBadge, inferNationType } from '@/components/NationBadge';
import { useCityList, useNationList } from '@/hooks/useApi';
import { Search, Users, ShieldCheck, Wheat, Store, Castle } from 'lucide-react';
import type { City } from '@/lib/api';

export default function CityListPage() {
    const { data: cities, isLoading } = useCityList();
    const { data: nations } = useNationList();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedNation, setSelectedNation] = useState<number | null>(null);

    const filteredCities = cities?.filter((city) => {
        const matchesSearch = city.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesNation = selectedNation === null || city.nation === selectedNation;
        return matchesSearch && matchesNation;
    });

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2">도시 목록</h1>
                <p className="text-muted-foreground">모든 도시의 정보를 확인할 수 있습니다.</p>
            </div>

            {/* 필터 */}
            <Card className="mb-6">
                <CardContent className="py-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="도시 이름 검색..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>
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

            {/* 도시 목록 */}
            {isLoading ? (
                <p className="text-center text-muted-foreground py-8">로딩 중...</p>
            ) : filteredCities?.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                    검색 결과가 없습니다.
                </p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCities?.map((city) => <CityCard key={city.id} city={city} />)}
                </div>
            )}

            {filteredCities && (
                <p className="text-center text-muted-foreground mt-6">
                    총 {filteredCities.length}개 도시
                </p>
            )}
        </div>
    );
}

function CityCard({ city }: { city: City }) {
    return (
        <Link href={`/game/city/${city.id}`}>
            <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{city.name}</CardTitle>
                        {city.nationName && (
                            <NationBadge
                                name={city.nationName}
                                type={inferNationType(city.nationName)}
                                size="sm"
                            />
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    {/* 인구 */}
                    <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1 text-muted-foreground">
                            <Users className="h-4 w-4" />
                            인구
                        </span>
                        <span className="font-medium">{city.population.toLocaleString()}</span>
                    </div>

                    {/* 민심 */}
                    <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-muted-foreground">민심</span>
                            <span>{city.trust}%</span>
                        </div>
                        <Progress value={city.trust} className="h-2" />
                    </div>

                    {/* 내정 수치 */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-1">
                            <Wheat className="h-3 w-3 text-green-600" />
                            <span className="text-muted-foreground">농업</span>
                            <span className="font-medium ml-auto">{city.agri}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Store className="h-3 w-3 text-amber-600" />
                            <span className="text-muted-foreground">상업</span>
                            <span className="font-medium ml-auto">{city.comm}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <ShieldCheck className="h-3 w-3 text-blue-600" />
                            <span className="text-muted-foreground">치안</span>
                            <span className="font-medium ml-auto">{city.secu}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Castle className="h-3 w-3 text-gray-600" />
                            <span className="text-muted-foreground">성벽</span>
                            <span className="font-medium ml-auto">{city.wall}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
