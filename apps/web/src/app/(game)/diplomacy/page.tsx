"use client";

/**
 * PageGlobalDiplomacy - 중원 정보 (Global Diplomacy / World Map)
 * Ported from legacy/hwe/ts/PageGlobalDiplomacy.vue
 *
 * Features:
 * - Diplomacy matrix table showing relations between all nations
 * - Conflict area showing disputed cities with percentage breakdown
 * - MapViewer + SimpleNationList showing the world map
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { TopBackBar } from "@/components/game";
import { MapViewer, type MapResult } from "@/components/game/MapViewer";
import { trpc } from "@/utils/trpc";
import { useGeneral } from "@/contexts/GeneralContext";
import { useGameConst } from "@/contexts/GameConstContext";
import { CITY_POSITION_CHE } from "@/constants/map";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

interface SimpleNationObj {
  nation: number;
  name: string;
  color: string;
  power: number;
  gennum: number;
  cities?: string[];
  level?: number;
  capital?: number;
}

// Diplomacy state: 0 = war, 1 = declared, 2 = neutral, 7 = non-aggression
type DiplomacyState = 0 | 1 | 2 | 7;

// ============================================================================
// Utility Functions
// ============================================================================

function isBrightColor(color: string): boolean {
  const hex = color.replace("#", "");
  if (hex.length !== 6) return false;

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return r * 0.299 + g * 0.587 + b * 0.114 > 140;
}

// ============================================================================
// Constants - Diplomacy State Display
// ============================================================================

// For cells involving player's nation (informative view)
const INFORMATIVE_STATE_MAP: Record<number, React.ReactNode> = {
  0: <span className="text-red-500 font-bold">★</span>,
  1: <span className="text-fuchsia-500">▲</span>,
  2: <span className="text-zinc-500">ㆍ</span>,
  7: <span className="text-green-500 font-bold">@</span>,
};

// For cells not involving player's nation
const NEUTRAL_STATE_MAP: Record<number, React.ReactNode> = {
  0: <span className="text-red-500 font-bold">★</span>,
  1: <span className="text-fuchsia-500">▲</span>,
  2: "",
  7: <span className="text-red-600 font-black">에러</span>,
};

// ============================================================================
// Sub Components
// ============================================================================

interface SimpleNationListProps {
  nations: SimpleNationObj[];
}

function SimpleNationList({ nations }: SimpleNationListProps) {
  return (
    <div className="border border-zinc-700 rounded-sm overflow-hidden">
      <table className="w-full text-[11px] md:text-[13px] border-collapse bg-zinc-900/50">
        <thead>
          <tr className="bg-zinc-800 text-zinc-300 font-medium border-b border-zinc-700">
            <th className="py-2 px-3 text-left w-[44%]">국명</th>
            <th className="py-2 px-3 text-right w-[23%] border-l border-zinc-800">국력</th>
            <th className="py-2 px-3 text-right w-[15%] border-l border-zinc-800">장수</th>
            <th className="py-2 px-3 text-right w-[15%] border-l border-zinc-800">속령</th>
          </tr>
        </thead>
        <tbody>
          {nations.map((nation) => (
            <tr
              key={nation.nation}
              className="border-b border-zinc-800 hover:bg-zinc-800/30 transition-colors"
            >
              <td className="py-2 px-3 align-middle">
                <span
                  className="px-2 py-0.5 rounded-sm font-bold shadow-sm"
                  style={{
                    color: isBrightColor(nation.color) ? "#000" : "#fff",
                    backgroundColor: nation.color,
                  }}
                >
                  {nation.name}
                </span>
              </td>
              <td className="py-2 px-3 text-right tabular-nums text-zinc-300">
                {nation.power.toLocaleString()}
              </td>
              <td className="py-2 px-3 text-right tabular-nums text-zinc-400">
                {nation.gennum.toLocaleString()}
              </td>
              <td
                className="py-2 px-3 text-right tabular-nums text-zinc-400 cursor-help"
                title={(nation.cities ?? []).join(", ")}
              >
                {(nation.cities ?? []).length}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function DiplomacyPage() {
  const { selectedGeneralId } = useGeneral();
  const { cities } = useGameConst();

  const cityMap = useMemo(() => {
    const map = new Map<number, string>();
    for (const city of cities) {
      map.set(city.city, city.name);
    }
    return map;
  }, [cities]);

  // Queries
  const { data: diplomacyData, isLoading: isDiplomacyLoading } = trpc.getDiplomacyData.useQuery({
    generalId: selectedGeneralId ?? 0,
  });
  const { data: mapData, isLoading: isMapLoading } = trpc.getMapData.useQuery({
    generalId: selectedGeneralId ?? 0,
  });

  const nationLookupMap = useMemo(() => {
    const map = new Map<number, SimpleNationObj>();
    if (diplomacyData?.nations) {
      for (const nation of diplomacyData.nations) {
        map.set(nation.nation, nation as SimpleNationObj);
      }
    }
    return map;
  }, [diplomacyData]);

  if (isDiplomacyLoading || isMapLoading || !diplomacyData || !mapData) {
    return (
      <div className="min-h-screen bg0 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-zinc-500 animate-pulse">중원 정세 분석 중...</p>
        </div>
      </div>
    );
  }

  const { nations, diplomacyList, myNationID, conflict } = diplomacyData;

  return (
    <div className="min-h-screen bg0 pb-10">
      <TopBackBar title="중원 정보" type="close" />

      <div className="max-w-[1100px] mx-auto px-4 space-y-8 mt-6">
        {/* Diplomacy Matrix Section */}
        <section className="bg-zinc-950/40 border border-zinc-800 rounded-lg overflow-hidden shadow-xl">
          <div className="bg-blue-900/40 px-4 py-2 border-b border-zinc-700 font-bold text-center tracking-wider text-blue-200">
            외교 현황
          </div>
          <div className="p-4 overflow-x-auto">
            <table className="mx-auto min-w-[400px]">
              <thead>
                <tr>
                  <th className="w-24"></th>
                  {nations.map((nation) => (
                    <th
                      key={nation.nation}
                      className="py-3 px-0 min-w-[32px] max-w-[48px] font-bold text-end pb-3 pt-3"
                      style={{
                        writingMode: "vertical-rl",
                        textOrientation: "mixed",
                        color: isBrightColor(nation.color) ? "#000" : "#fff",
                        backgroundColor: nation.color,
                        boxShadow: "inset 0 0 10px rgba(0,0,0,0.2)",
                      }}
                    >
                      {nation.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {nations.map((me) => (
                  <tr key={me.nation} className="hover:bg-zinc-800/10">
                    <th
                      className="text-end px-3 py-1 font-bold shadow-sm"
                      style={{
                        color: isBrightColor(me.color) ? "#000" : "#fff",
                        backgroundColor: me.color,
                        boxShadow: "inset 0 0 10px rgba(0,0,0,0.2)",
                      }}
                    >
                      {me.name}
                    </th>
                    {nations.map((you) => {
                      if (me.nation === you.nation) {
                        return (
                          <td
                            key={you.nation}
                            className="border-l border-zinc-800 text-center p-0 text-zinc-600 bg-zinc-900/20"
                          >
                            ＼
                          </td>
                        );
                      }

                      const state = diplomacyList[me.nation]?.[you.nation] ?? 2;
                      const isMyNationInvolved =
                        me.nation === myNationID || you.nation === myNationID;
                      const stateDisplay = isMyNationInvolved
                        ? INFORMATIVE_STATE_MAP[state]
                        : NEUTRAL_STATE_MAP[state];

                      return (
                        <td
                          key={you.nation}
                          className={cn(
                            "border-l border-zinc-800 text-center p-0 transition-colors",
                            isMyNationInvolved && "bg-red-950/20"
                          )}
                        >
                          {stateDisplay}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td
                    colSpan={nations.length + 1}
                    className="text-center py-4 text-[13px] text-zinc-500 italic"
                  >
                    <span className="inline-flex gap-4">
                      <span>
                        불가침 : <span className="text-green-500 font-bold">@</span>
                      </span>
                      <span>
                        통상 : <span className="text-zinc-400">ㆍ</span>
                      </span>
                      <span>
                        선포 : <span className="text-fuchsia-500">▲</span>
                      </span>
                      <span>
                        교전 : <span className="text-red-500 font-bold">★</span>
                      </span>
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {/* Conflict Section */}
        {conflict.length > 0 && (
          <section className="bg-zinc-950/40 border border-zinc-800 rounded-lg overflow-hidden shadow-xl">
            <div className="bg-fuchsia-900/40 px-4 py-2 border-b border-zinc-700 font-bold text-center tracking-wider text-fuchsia-200">
              분쟁 현황
            </div>
            <div className="divide-y divide-zinc-800/50">
              {conflict.map(([cityID, conflictNations]) => (
                <div
                  key={cityID}
                  className="grid grid-cols-12 gap-0 hover:bg-zinc-800/10 transition-colors"
                >
                  <div className="col-span-3 text-right pr-4 py-3 self-center font-bold text-zinc-300 border-r border-zinc-800/30">
                    {cityMap.get(cityID) ?? `도시${cityID}`}
                  </div>
                  <div className="col-span-9 py-2 px-3">
                    {Object.entries(conflictNations).map(([nationIDStr, percent]) => {
                      const nationID = parseInt(nationIDStr);
                      const nation = nationLookupMap.get(nationID);
                      if (!nation) return null;

                      return (
                        <div
                          key={nationID}
                          className="grid grid-cols-12 gap-2 items-center mb-1 last:mb-0"
                        >
                          <div
                            className="col-span-3 pl-2 py-0.5 rounded-sm font-bold text-[11px] md:text-[13px] shadow-sm"
                            style={{
                              color: isBrightColor(nation.color) ? "#000" : "#fff",
                              backgroundColor: nation.color,
                            }}
                          >
                            {nation.name}
                          </div>
                          <div className="col-span-2 text-right tabular-nums text-zinc-400 text-xs">
                            {percent.toLocaleString(undefined, { minimumFractionDigits: 1 })}%
                          </div>
                          <div className="col-span-7 pr-4">
                            <div className="h-2.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                              <div
                                className="h-full rounded-full shadow-[0_0_5px_rgba(0,0,0,0.5)]"
                                style={{
                                  width: `${percent}%`,
                                  backgroundColor: nation.color,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Map Section */}
        <section className="bg-zinc-950/40 border border-zinc-800 rounded-lg overflow-hidden shadow-xl">
          <div className="bg-emerald-900/40 px-4 py-2 border-b border-zinc-700 font-bold text-center tracking-wider text-emerald-200">
            중원 지도
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-0 h-full">
            <div className="md:col-span-8 p-4 bg-zinc-950/60 flex items-center justify-center">
              <div className="w-full max-w-[600px] aspect-square relative border border-zinc-800 rounded-md shadow-inner bg-black/20">
                <MapViewer
                  mapName="large"
                  mapData={mapData as MapResult}
                  isDetailMap={true}
                  cityPosition={CITY_POSITION_CHE}
                  formatCityInfo={(c) => c}
                  imagePath="/game"
                  disallowClick={true}
                />
              </div>
            </div>
            <div className="md:col-span-4 p-4 border-t md:border-t-0 md:border-l border-zinc-800">
              <div className="mb-3 text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">
                세력 목록
              </div>
              <SimpleNationList nations={nations as SimpleNationObj[]} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
