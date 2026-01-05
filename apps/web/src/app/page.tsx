'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Swords, Users, Map, Crown } from 'lucide-react';

export default function Home() {
    return (
        <main className="min-h-screen flex flex-col">
            {/* 히어로 섹션 */}
            <section className="flex-1 flex flex-col items-center justify-center px-4 py-16 bg-gradient-to-b from-sammo-base1 to-sammo-nbase2 text-white">
                <h1 className="text-4xl md:text-6xl font-bold text-center mb-4">삼국지 모의전투</h1>
                <p className="text-lg md:text-xl text-center text-gray-300 mb-8 max-w-2xl">
                    전략과 지혜로 천하를 제패하라
                </p>
                <div className="flex gap-4">
                    <Link href="/join">
                        <Button size="lg" className="gap-2">
                            <Crown className="h-5 w-5" />
                            장수 생성
                        </Button>
                    </Link>
                    <Link href="/game">
                        <Button size="lg" variant="outline" className="gap-2 bg-white/10 hover:bg-white/20">
                            <Swords className="h-5 w-5" />
                            게임 시작
                        </Button>
                    </Link>
                </div>
            </section>

            {/* 기능 소개 섹션 */}
            <section className="py-16 px-4 bg-muted/50">
                <div className="container mx-auto">
                    <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">게임 특징</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FeatureCard
                            icon={<Users className="h-8 w-8" />}
                            title="장수 육성"
                            description="통솔, 무력, 지력을 갖춘 장수를 육성하고 전투에서 활약시키세요."
                        />
                        <FeatureCard
                            icon={<Map className="h-8 w-8" />}
                            title="영토 확장"
                            description="도시를 점령하고 내정을 발전시켜 강력한 국가를 건설하세요."
                        />
                        <FeatureCard
                            icon={<Swords className="h-8 w-8" />}
                            title="전략적 전투"
                            description="부대를 편성하고 전술을 세워 적을 물리치세요."
                        />
                    </div>
                </div>
            </section>

            {/* 푸터 */}
            <footer className="py-8 px-4 border-t">
                <div className="container mx-auto text-center text-sm text-muted-foreground">
                    <p>삼국지 모의전투 - Open Source Project</p>
                </div>
            </footer>
        </main>
    );
}

function FeatureCard({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <Card>
            <CardHeader>
                <div className="mb-2 text-primary">{icon}</div>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <CardDescription>{description}</CardDescription>
            </CardContent>
        </Card>
    );
}
