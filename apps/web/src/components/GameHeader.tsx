'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Home, Users, Map, Swords, Scroll, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface NavItem {
    href: string;
    label: string;
    icon: React.ReactNode;
}

const navItems: NavItem[] = [
    { href: '/game', label: '메인', icon: <Home className="h-4 w-4" /> },
    { href: '/game/general', label: '장수', icon: <Users className="h-4 w-4" /> },
    { href: '/game/nation', label: '국가', icon: <Map className="h-4 w-4" /> },
    { href: '/game/city', label: '도시', icon: <Map className="h-4 w-4" /> },
    { href: '/game/battle', label: '전투', icon: <Swords className="h-4 w-4" /> },
];

const moreItems: NavItem[] = [
    { href: '/auction', label: '경매장', icon: <Scroll className="h-4 w-4" /> },
    { href: '/board', label: '게시판', icon: <Scroll className="h-4 w-4" /> },
];

interface GameHeaderProps {
    /** 현재 연도/월 */
    gameDate?: { year: number; month: number };
    /** 서버 이름 */
    serverName?: string;
    /** 장수 이름 */
    generalName?: string;
    /** 국가 이름 */
    nationName?: string;
    /** 국가 색상 타입 */
    nationColor?: 'wei' | 'shu' | 'wu' | 'jin' | 'neutral';
}

export function GameHeader({
    gameDate,
    serverName,
    generalName,
    nationName,
    nationColor = 'neutral',
}: GameHeaderProps) {
    const pathname = usePathname();

    const nationColorClass = {
        wei: 'border-blue-500',
        shu: 'border-green-500',
        wu: 'border-red-500',
        jin: 'border-yellow-500',
        neutral: 'border-gray-500',
    }[nationColor];

    return (
        <header className={cn('border-b-2 bg-card', nationColorClass)}>
            <div className="container mx-auto px-4">
                <div className="flex h-14 items-center justify-between">
                    {/* 로고 및 서버 정보 */}
                    <div className="flex items-center gap-4">
                        <Link href="/" className="font-bold text-lg">
                            삼국지
                        </Link>
                        {serverName && (
                            <span className="text-sm text-muted-foreground hidden sm:inline">
                                {serverName}
                            </span>
                        )}
                        {gameDate && (
                            <span className="text-sm font-medium">
                                {gameDate.year}년 {gameDate.month}월
                            </span>
                        )}
                    </div>

                    {/* 데스크톱 네비게이션 */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => (
                            <Link key={item.href} href={item.href}>
                                <Button
                                    variant={pathname === item.href ? 'secondary' : 'ghost'}
                                    size="sm"
                                    className="gap-2"
                                >
                                    {item.icon}
                                    {item.label}
                                </Button>
                            </Link>
                        ))}

                        {/* 더보기 메뉴 */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                    더보기
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {moreItems.map((item) => (
                                    <DropdownMenuItem key={item.href} asChild>
                                        <Link href={item.href} className="gap-2">
                                            {item.icon}
                                            {item.label}
                                        </Link>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </nav>

                    {/* 사용자 정보 */}
                    <div className="flex items-center gap-2">
                        {generalName && (
                            <span className="text-sm hidden sm:inline">
                                <span className="text-muted-foreground">{nationName}</span>{' '}
                                <span className="font-medium">{generalName}</span>
                            </span>
                        )}

                        {/* 모바일 메뉴 */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild className="md:hidden">
                                <Button variant="ghost" size="icon">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>메뉴</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {navItems.map((item) => (
                                    <DropdownMenuItem key={item.href} asChild>
                                        <Link href={item.href} className="gap-2">
                                            {item.icon}
                                            {item.label}
                                        </Link>
                                    </DropdownMenuItem>
                                ))}
                                <DropdownMenuSeparator />
                                {moreItems.map((item) => (
                                    <DropdownMenuItem key={item.href} asChild>
                                        <Link href={item.href} className="gap-2">
                                            {item.icon}
                                            {item.label}
                                        </Link>
                                    </DropdownMenuItem>
                                ))}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/settings" className="gap-2">
                                        <Settings className="h-4 w-4" />
                                        설정
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </header>
    );
}
