'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { NationBadge, inferNationType } from '@/components/NationBadge';
import { useJoinableNations, useCreateGeneral } from '@/hooks/useApi';
import { ArrowLeft, Plus, Minus } from 'lucide-react';

const TOTAL_STAT_POINTS = 150;
const MIN_STAT = 10;
const MAX_STAT = 100;

interface StatDistribution {
    leadership: number;
    strength: number;
    intel: number;
}

export default function JoinPage() {
    const router = useRouter();
    const { data: nations, isLoading: nationsLoading } = useJoinableNations();
    const createGeneral = useCreateGeneral();

    const [name, setName] = useState('');
    const [selectedNation, setSelectedNation] = useState<number | null>(null);
    const [stats, setStats] = useState<StatDistribution>({
        leadership: 50,
        strength: 50,
        intel: 50,
    });

    const usedPoints = stats.leadership + stats.strength + stats.intel;
    const remainingPoints = TOTAL_STAT_POINTS - usedPoints;

    const handleStatChange = (stat: keyof StatDistribution, delta: number) => {
        setStats((prev) => {
            const newValue = Math.max(MIN_STAT, Math.min(MAX_STAT, prev[stat] + delta));
            const newTotal = usedPoints - prev[stat] + newValue;

            if (newTotal > TOTAL_STAT_POINTS) {
                return prev;
            }

            return { ...prev, [stat]: newValue };
        });
    };

    const handleSubmit = async () => {
        if (!name.trim() || selectedNation === null) {
            return;
        }

        try {
            await createGeneral.mutateAsync({
                name: name.trim(),
                leadership: stats.leadership,
                strength: stats.strength,
                intel: stats.intel,
                nationId: selectedNation,
            });
            router.push('/game');
        } catch (error) {
            console.error('장수 생성 실패:', error);
        }
    };

    return (
        <main className="min-h-screen py-8 px-4">
            <div className="container mx-auto max-w-2xl">
                {/* 헤더 */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">장수 생성</h1>
                        <p className="text-muted-foreground">새로운 장수를 만들어 천하를 도모하세요</p>
                    </div>
                </div>

                {/* 이름 입력 */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>이름</CardTitle>
                        <CardDescription>장수의 이름을 입력하세요</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Input
                            placeholder="장수 이름"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={10}
                        />
                    </CardContent>
                </Card>

                {/* 능력치 분배 */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>능력치 분배</CardTitle>
                        <CardDescription>
                            남은 포인트: <span className="font-bold">{remainingPoints}</span> / {TOTAL_STAT_POINTS}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <StatSlider
                            label="통솔"
                            description="병력 지휘 능력, 부대 규모에 영향"
                            value={stats.leadership}
                            onChange={(delta) => handleStatChange('leadership', delta)}
                            remainingPoints={remainingPoints}
                        />
                        <StatSlider
                            label="무력"
                            description="전투력, 일기토 능력에 영향"
                            value={stats.strength}
                            onChange={(delta) => handleStatChange('strength', delta)}
                            remainingPoints={remainingPoints}
                        />
                        <StatSlider
                            label="지력"
                            description="계략 성공률, 내정 효율에 영향"
                            value={stats.intel}
                            onChange={(delta) => handleStatChange('intel', delta)}
                            remainingPoints={remainingPoints}
                        />
                    </CardContent>
                </Card>

                {/* 국가 선택 */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>국가 선택</CardTitle>
                        <CardDescription>가입할 국가를 선택하세요</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {nationsLoading ? (
                            <p className="text-muted-foreground">국가 목록 로딩중...</p>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {nations?.map((nation) => (
                                    <button
                                        key={nation.id}
                                        onClick={() => setSelectedNation(nation.id)}
                                        className={`p-4 rounded-lg border-2 transition-all ${
                                            selectedNation === nation.id
                                                ? 'border-primary bg-primary/10'
                                                : 'border-border hover:border-primary/50'
                                        }`}
                                    >
                                        <NationBadge
                                            name={nation.name}
                                            type={inferNationType(nation.name)}
                                            size="lg"
                                        />
                                        <p className="text-sm text-muted-foreground mt-2">
                                            장수 {nation.generalCount}명
                                        </p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* 제출 버튼 */}
                <Button
                    onClick={handleSubmit}
                    disabled={!name.trim() || selectedNation === null || createGeneral.isPending}
                    className="w-full"
                    size="lg"
                >
                    {createGeneral.isPending ? '생성 중...' : '장수 생성'}
                </Button>

                {createGeneral.isError && (
                    <p className="text-destructive text-center mt-4">
                        장수 생성에 실패했습니다. 다시 시도해주세요.
                    </p>
                )}
            </div>
        </main>
    );
}

interface StatSliderProps {
    label: string;
    description: string;
    value: number;
    onChange: (delta: number) => void;
    remainingPoints: number;
}

function StatSlider({ label, description, value, onChange, remainingPoints }: StatSliderProps) {
    const canIncrease = value < MAX_STAT && remainingPoints > 0;
    const canDecrease = value > MIN_STAT;

    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <div>
                    <span className="font-medium">{label}</span>
                    <span className="text-muted-foreground text-sm ml-2">{description}</span>
                </div>
                <span className="text-xl font-bold">{value}</span>
            </div>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onChange(-5)}
                    disabled={!canDecrease}
                >
                    <Minus className="h-4 w-4" />
                </Button>
                <Progress value={value} className="flex-1" />
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onChange(5)}
                    disabled={!canIncrease}
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
