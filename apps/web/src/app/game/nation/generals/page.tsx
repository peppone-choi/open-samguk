"use client";

/**
 * PageNationGeneral - 세력 장수 목록
 * Ported from legacy/hwe/ts/PageNationGeneral.vue
 *
 * Features:
 * - Full general list with sortable columns
 * - Permission-based display (different visibility levels)
 * - Troop information
 * - Click to open battle center
 * - Reload functionality
 */

import React, { useCallback, useMemo } from "react";
import { TopBackBar, GeneralList } from "@/components/game";
import type {
  GeneralListItem,
  GeneralListEnv,
  GameConstStore,
} from "@/components/game/GeneralList";
import { trpc } from "@/utils/trpc";
import { useGeneral } from "@/contexts/GeneralContext";

// ============================================================================
// Main Component
// ============================================================================

export default function NationGeneralsPage() {
  const { selectedGeneral, selectedGeneralId } = useGeneral();
  const nationId = selectedGeneral?.nationId;

  // Query Data
  const {
    data: generalData,
    isLoading: isListLoading,
    refetch,
  } = trpc.getNationGeneralList.useQuery(
    { nationId: nationId ?? 0, generalId: selectedGeneralId ?? 0 },
    { enabled: !!nationId }
  );

  const { data: constData, isLoading: isConstLoading } = trpc.getGameConst.useQuery();

  const gameConst = useMemo<GameConstStore | null>(() => {
    if (!constData || !constData.consts) return null;
    return constData.consts as unknown as GameConstStore;
  }, [constData]);

  const troopListMap = useMemo(() => {
    if (!generalData?.troops) return {};
    const map: Record<number, string> = {};
    for (const troop of generalData.troops) {
      map[troop.id] = troop.name;
    }
    return map;
  }, [generalData]);

  const reload = useCallback(() => {
    refetch();
  }, [refetch]);

  // Open battle center (or detail) for a general
  const handleGeneralClick = useCallback((generalId: number) => {
    // Ported from PageNationGeneral.vue: window.open(`v_battleCenter.php?gen=${generalID}`);
    // In our React app, we navigate to the general detail page or a battle center page.
    window.location.href = `/general/${generalId}`;
  }, []);

  if (isListLoading || isConstLoading || !generalData || !gameConst) {
    return (
      <div className="h-screen bg-background flex items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900/20 via-background to-background">
        <div className="glass p-12 rounded-2xl flex flex-col items-center gap-6 border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 animate-pulse" />
          <div className="relative z-10">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary/30 border-t-primary shadow-glow mx-auto" />
            <p className="text-primary font-bold tracking-[0.2em] text-sm animate-pulse">
              LOADING DATA
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />

      <TopBackBar title="세력 장수" reloadable={true} onReload={reload} />

      <div className="flex-1 overflow-hidden p-0 sm:p-4">
        <div className="h-full w-full sm:glass sm:rounded-xl sm:border sm:border-white/5 sm:shadow-2xl overflow-hidden relative group transition-all duration-500 hover:border-primary/20">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 sm:opacity-100 pointer-events-none" />

          <GeneralList
            list={generalData.list as GeneralListItem[]}
            troops={troopListMap}
            env={generalData.env as GeneralListEnv}
            gameConst={gameConst}
            height="fill"
            availableGeneralClick={true}
            onGeneralClick={handleGeneralClick}
            className="h-full relative z-10"
          />
        </div>
      </div>
    </div>
  );
}
