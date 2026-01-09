"use client";

import { useMemo } from "react";
import { trpc } from "@/utils/trpc";

export function useCurrentGeneral() {
  const { data: sessions, isLoading } = trpc.gameSession.getAllSessions.useQuery(undefined, {
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const currentGeneral = useMemo(() => {
    if (!sessions || sessions.sessions.length === 0) return null;
    // Return the most recently active session
    // sessions are already sorted by lastActiveAt desc in backend
    return sessions.sessions[0];
  }, [sessions]);

  return {
    generalId: currentGeneral?.generalId,
    generalName: currentGeneral?.generalName,
    serverId: currentGeneral?.serverId,
    isLoading,
  };
}
