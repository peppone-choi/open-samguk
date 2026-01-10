"use client";

/**
 * PageHistory - 연감 (Historical Records)
 * Ported from legacy/hwe/ts/PageHistory.vue
 *
 * Features:
 * - Year/Month selector with prev/next buttons
 * - MapViewer showing historical map data
 * - SimpleNationList showing nation rankings
 * - Log sections: global_history (중원 정세), global_action (장수 동향)
 * - Mobile option to toggle nation ranking position
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { TopBackBar } from "@/components/game";
import { MapViewer, type MapResult, type MapCityParsed } from "@/components/game/MapViewer";
import { Button } from "@/components/ui/button";
import { trpc } from "@/utils/trpc";
import { useGeneral } from "@/contexts/GeneralContext";
import { CITY_POSITION_CHE } from "@/constants/map";

// ============================================================================
// Types
// ============================================================================

interface HistoryNation {
  nation: number;
  name: string;
  color: string;
  power: number;
  gennum: number;
  cities: string[];
  level: number;
  capital: number;
  type: string;
}

// ============================================================================
// Utility Functions
// ============================================================================

function parseYearMonth(yearMonth: number): [number, number] {
  const year = Math.floor(yearMonth / 12);
  const month = (yearMonth % 12) + 1;
  return [year, month];
}

function joinYearMonth(year: number, month: number): number {
  return year * 12 + (month - 1);
}

function isBrightColor(color: string): boolean {
  // Parse hex color
  const hex = color.replace("#", "");
  if (hex.length !== 6) return false;

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Using the luminance formula
  return r * 0.299 + g * 0.587 + b * 0.114 > 140;
}

const LOG_REGEX = /<([RBGMCLSODYW]1?|1|\/)>/g;

const COLOR_MAP: Record<string, string> = {
  R: "color: red;",
  B: "color: blue;",
  G: "color: green;",
  M: "color: magenta;",
  C: "color: cyan;",
  L: "color: limegreen;",
  S: "color: skyblue;",
  O: "color: orangered;",
  D: "color: orangered;",
  Y: "color: yellow;",
  W: "color: white;",
  "1": "font-size: 0.9em;",
};

function formatLog(text?: string): string {
  if (!text) return "";
  let matchRes;
  let lastIndex = 0;
  const result: string[] = [];
  LOG_REGEX.lastIndex = 0;

  while ((matchRes = LOG_REGEX.exec(text)) !== null) {
    const { 0: partAll, 1: subPart, index } = matchRes;
    if (lastIndex !== index) {
      result.push(text.slice(lastIndex, index));
    }
    if (subPart === "/") {
      result.push("</span>");
    } else if (subPart.length === 2) {
      result.push(`<span style="${COLOR_MAP[subPart[0]] ?? ""}${COLOR_MAP[subPart[1]] ?? ""}">`);
    } else {
      result.push(`<span style="${COLOR_MAP[subPart] ?? ""}">`);
    }
    lastIndex = index + partAll.length;
  }
  if (lastIndex !== text.length) {
    result.push(text.slice(lastIndex));
  }
  return result.join("");
}

// ============================================================================
// Constants
// ============================================================================

const MAP_NAME = "che"; // Default map name

// ============================================================================
// Sub Components
// ============================================================================

interface SimpleNationListProps {
  nations: HistoryNation[];
}

function SimpleNationList({ nations }: SimpleNationListProps) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-gray-400 text-black text-center">
          <th className="py-1 px-2 border-l border-gray-500" style={{ width: "44%" }}>
            국명
          </th>
          <th className="py-1 px-2 border-l border-gray-500" style={{ width: "23%" }}>
            국력
          </th>
          <th className="py-1 px-2 border-l border-gray-500" style={{ width: "15%" }}>
            장수
          </th>
          <th className="py-1 px-2 border-l border-gray-500" style={{ width: "15%" }}>
            속령
          </th>
        </tr>
      </thead>
      <tbody>
        {nations.map((nation) => (
          <tr key={nation.nation} className="border-b border-gray-600">
            <td className="py-0.5 px-2 border-l border-gray-500">
              <span
                className="px-1 rounded"
                style={{
                  color: isBrightColor(nation.color) ? "#000" : "#fff",
                  backgroundColor: nation.color,
                }}
              >
                {nation.name}
              </span>
            </td>
            <td className="py-0.5 px-2 border-l border-gray-500 text-right">
              {nation.power.toLocaleString()}
            </td>
            <td className="py-0.5 px-2 border-l border-gray-500 text-right">
              {nation.gennum.toLocaleString()}
            </td>
            <td
              className="py-0.5 px-2 border-l border-gray-500 text-right cursor-help"
              title={(nation.cities ?? []).join(", ")}
            >
              {(nation.cities ?? []).length}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function HistoryPage() {
  const searchParams = useSearchParams();
  const { selectedGeneralId } = useGeneral();
  const [isNationRankingBottom, setIsNationRankingBottom] = useState(false);

  // Fetch game environment data
  const { data: envData, isLoading: envLoading } = trpc.getGlobalEnv.useQuery();

  // Fetch map data
  const { data: mapData, isLoading: mapLoading } = trpc.getMapData.useQuery(
    { generalId: selectedGeneralId ?? undefined },
    { enabled: true }
  );

  // Fetch diplomacy data (contains nation list with cities)
  const { data: diplomacyData, isLoading: diplomacyLoading } = trpc.getDiplomacyData.useQuery(
    { generalId: selectedGeneralId ?? undefined },
    { enabled: true }
  );

  // Fetch world history
  const { data: historyData, isLoading: historyLoading } = trpc.getWorldHistory.useQuery(
    { limit: 50 },
    { enabled: true }
  );

  // Fetch global records (general actions)
  const { data: globalRecords, isLoading: recordsLoading } = trpc.getGlobalRecords.useQuery(
    { limit: 30 },
    { enabled: true }
  );

  // Extract environment values
  const env = envData?.env ?? {};
  const currentYear = (env.year as number) || 184;
  const currentMonth = (env.month as number) || 1;
  const startYear = (env.startYear as number) || 184;

  // Calculate year/month ranges
  const currentYearMonth = joinYearMonth(currentYear, currentMonth);
  const firstYearMonth = joinYearMonth(startYear, 1);

  // State for selected year/month (currently showing current only)
  const initialYearMonth = searchParams.get("ym")
    ? Number(searchParams.get("ym"))
    : currentYearMonth;
  const [queryYearMonth, setQueryYearMonth] = useState<number>(initialYearMonth);

  // Update queryYearMonth when current data loads
  useEffect(() => {
    if (envData && !searchParams.get("ym")) {
      setQueryYearMonth(joinYearMonth(currentYear, currentMonth));
    }
  }, [envData, currentYear, currentMonth, searchParams]);

  // Build MapResult from API data
  const mapResult: MapResult | null = useMemo(() => {
    if (!mapData) return null;

    return {
      version: mapData.version ?? 2,
      year: mapData.year ?? currentYear,
      month: mapData.month ?? currentMonth,
      startYear: mapData.startYear ?? startYear,
      cityList: (mapData.cityList ?? []) as [number, number, number, number, number, number][],
      nationList: (mapData.nationList ?? []) as [number, string, string, number][],
      spyList: (mapData.spyList ?? {}) as { [cityId: number]: number },
      shownByGeneralList: (mapData.shownByGeneralList ?? []) as number[],
      myCity: mapData.myCity ?? null,
      myNation: mapData.myNation ?? null,
    };
  }, [mapData, currentYear, currentMonth, startYear]);

  // Build nations list from diplomacy data
  const nations: HistoryNation[] = useMemo(() => {
    if (!diplomacyData?.nations) return [];

    return diplomacyData.nations.map((n) => ({
      nation: n.nation,
      name: n.name,
      color: n.color,
      power: n.power ?? 0,
      gennum: n.gennum ?? 0,
      cities: n.cities ?? [],
      level: n.level ?? 0,
      capital: n.capital ?? 0,
      type: "",
    }));
  }, [diplomacyData]);

  // Build global history list
  const globalHistory: string[] = useMemo(() => {
    if (!historyData) return [];
    return historyData.map((h: { text: string }) => h.text);
  }, [historyData]);

  // Build global action list
  const globalAction: string[] = useMemo(() => {
    if (!globalRecords) return [];
    return globalRecords.map((r) => r.text);
  }, [globalRecords]);

  // Generate year/month options for selector
  const yearMonthList = useMemo(() => {
    const result: { text: string; value: number }[] = [];
    // For now, only show current month since historical browsing requires backend support
    const [year, month] = parseYearMonth(currentYearMonth);
    result.push({
      text: `${year}년 ${month}월 (현재)`,
      value: currentYearMonth,
    });
    return result;
  }, [currentYearMonth]);

  // Format city info for MapViewer
  const formatCityInfo = useCallback((city: MapCityParsed): MapCityParsed => {
    return city;
  }, []);

  // Handle year/month change
  const handleYearMonthChange = useCallback(
    (newYM: number) => {
      if (newYM < firstYearMonth) {
        setQueryYearMonth(firstYearMonth);
        return;
      }
      if (newYM > currentYearMonth) {
        setQueryYearMonth(currentYearMonth);
        return;
      }
      setQueryYearMonth(newYM);
    },
    [firstYearMonth, currentYearMonth]
  );

  // Load nation ranking position preference from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("isNationRankingBottom");
    if (stored) {
      setIsNationRankingBottom(stored === "true");
    }
  }, []);

  // Save preference
  const toggleNationRankingPosition = useCallback(() => {
    setIsNationRankingBottom((prev) => {
      const newValue = !prev;
      localStorage.setItem("isNationRankingBottom", String(newValue));
      return newValue;
    });
  }, []);

  const isLoading =
    envLoading || mapLoading || diplomacyLoading || historyLoading || recordsLoading;

  return (
    <div className="min-h-screen bg0">
      <TopBackBar title="연감" type="close">
        <div className="flex-1" />
        {/* Settings Dropdown */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-sm"
            onClick={toggleNationRankingPosition}
            title="국가 순서 위치 변경 (모바일 전용)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
            </svg>
            <span className="ml-1 hidden sm:inline">설정</span>
          </Button>
        </div>
      </TopBackBar>

      <div className="max-w-[1000px] mx-auto px-2 pb-4">
        {/* Year/Month Selector */}
        <div className="grid grid-cols-12 gap-1 items-center border-y border-gray-600 py-2 mb-2">
          <div className="col-span-2 lg:col-span-1 text-right text-sm pr-2">연월 선택:</div>
          <div className="col-span-2 lg:col-span-1">
            <Button
              onClick={() => handleYearMonthChange(queryYearMonth - 1)}
              className="w-full h-8 text-sm"
              variant="secondary"
              disabled={true} // Historical browsing not yet supported
            >
              ◀ 이전달
            </Button>
          </div>
          <div className="col-span-5 lg:col-span-3">
            <select
              value={queryYearMonth}
              onChange={(e) => handleYearMonthChange(Number(e.target.value))}
              className="w-full h-8 px-2 text-sm bg-zinc-700 text-white border border-gray-600 rounded"
            >
              {yearMonthList.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.text}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-2 lg:col-span-1">
            <Button
              onClick={() => handleYearMonthChange(queryYearMonth + 1)}
              className="w-full h-8 text-sm"
              variant="secondary"
              disabled={true} // Historical browsing not yet supported
            >
              다음달 ▶
            </Button>
          </div>
          <div className="hidden lg:block lg:col-span-6" />
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto" />
              <p className="text-gray-400">로딩 중...</p>
            </div>
          </div>
        ) : mapResult ? (
          <div
            className={`grid grid-cols-12 gap-0 ${isNationRankingBottom ? "history-nation-bottom" : ""}`}
          >
            {/* Map Section */}
            <div className="col-span-12 lg:col-span-8 map-section">
              <MapViewer
                mapName={MAP_NAME}
                mapData={mapResult}
                isDetailMap={true}
                cityPosition={CITY_POSITION_CHE}
                formatCityInfo={formatCityInfo}
                imagePath="/game"
                disallowClick={true}
              />
            </div>

            {/* Nation List Section */}
            <div className="col-span-12 lg:col-span-4 nation-section">
              <SimpleNationList nations={nations} />
            </div>

            {/* Global History Section */}
            <div className="col-span-12">
              <div className="bg1 text-center font-bold py-1 border-y border-gray-600">
                중원 정세
              </div>
              <div className="bg2 p-2 text-sm max-h-48 overflow-y-auto">
                {globalHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="mb-1"
                    dangerouslySetInnerHTML={{ __html: formatLog(item) }}
                  />
                ))}
                {globalHistory.length === 0 && (
                  <div className="text-gray-500 text-center py-4">기록 없음</div>
                )}
              </div>
            </div>

            {/* Global Action Section */}
            <div className="col-span-12">
              <div className="bg1 text-center font-bold py-1 border-y border-gray-600">
                장수 동향
              </div>
              <div className="bg2 p-2 text-sm max-h-48 overflow-y-auto">
                {globalAction.map((item, idx) => (
                  <div
                    key={idx}
                    className="mb-1"
                    dangerouslySetInnerHTML={{ __html: formatLog(item) }}
                  />
                ))}
                {globalAction.length === 0 && (
                  <div className="text-gray-500 text-center py-4">기록 없음</div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-20">데이터를 불러올 수 없습니다</div>
        )}
      </div>

      {/* CSS for mobile nation ranking toggle */}
      <style jsx>{`
        @media (max-width: 500px) {
          .history-nation-bottom .nation-section {
            order: 4;
          }
        }
      `}</style>
    </div>
  );
}
