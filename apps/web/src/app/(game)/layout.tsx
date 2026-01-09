"use client";

import { GameLayout } from "@/components/layout";
import { ProtectedRoute } from "@/components/auth";
import { trpc } from "@/utils/trpc";

export default function GameRootLayout({ children }: { children: React.ReactNode }) {
  const gameStateQuery = trpc.getGameState.useQuery();
  const gameTime = gameStateQuery.data
    ? { year: gameStateQuery.data.year, month: gameStateQuery.data.month }
    : undefined;

  return (
    <ProtectedRoute>
      <GameLayout gameTime={gameTime}>{children}</GameLayout>
    </ProtectedRoute>
  );
}
