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
    return constData.consts as GameConstStore;
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
      <div className="h-screen bg0 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-gray-400">장수 목록 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg0 flex flex-col overflow-hidden">
      <TopBackBar title="세력 장수" reloadable={true} onReload={reload} />

      <div className="flex-1 overflow-hidden">
        <GeneralList
          list={generalData.list as GeneralListItem[]}
          troops={troopListMap}
          env={generalData.env as GeneralListEnv}
          gameConst={gameConst}
          height="fill"
          availableGeneralClick={true}
          onGeneralClick={handleGeneralClick}
          className="h-full"
        />
      </div>
    </div>
  );
}
