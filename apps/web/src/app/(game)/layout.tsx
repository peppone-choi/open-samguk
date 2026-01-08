"use client";

import { GameLayout } from "@/components/layout";
import { trpc } from "@/utils/trpc";

export default function GameRootLayout({ children }: { children: React.ReactNode }) {
  const gameStateQuery = trpc.getGameState.useQuery();
  const gameTime = gameStateQuery.data
    ? { year: gameStateQuery.data.year, month: gameStateQuery.data.month }
    : undefined;

  return <GameLayout gameTime={gameTime}>{children}</GameLayout>;
}
