'use client';

import { GameHeader } from '@/components/GameHeader';
import { useMyGeneral, useGameConst } from '@/hooks/useApi';
import { inferNationType } from '@/components/NationBadge';

export default function GameLayout({ children }: { children: React.ReactNode }) {
    const { data: myGeneral } = useMyGeneral();
    const { data: gameConst } = useGameConst();

    return (
        <div className="min-h-screen flex flex-col">
            <GameHeader
                gameDate={gameConst ? { year: gameConst.year, month: gameConst.month } : undefined}
                serverName={gameConst?.serverName}
                generalName={myGeneral?.name}
                nationName={myGeneral?.nationName}
                nationColor={myGeneral?.nationName ? inferNationType(myGeneral.nationName) : undefined}
            />
            <main className="flex-1">{children}</main>
        </div>
    );
}
