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

function parseYearMonth(yearMonth: number): [number, number] {
  const year = Math.floor(yearMonth / 12);
  const month = (yearMonth % 12) + 1;
  return [year, month];
}

function joinYearMonth(year: number, month: number): number {
  return year * 12 + (month - 1);
}

function isBrightColor(color: string): boolean {
  const hex = color.replace("#", "");
  if (hex.length !== 6) return false;

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return r * 0.299 + g * 0.587 + b * 0.114 > 140;
}

const LOG_REGEX = /<([RBGMCLSODYW]1?|1|\/)>/g;

const COLOR_MAP: Record<string, string> = {
  R: "color: #ef4444;",
  B: "color: #3b82f6;",
  G: "color: #22c55e;",
  M: "color: #d946ef;",
  C: "color: #06b6d4;",
  L: "color: #84cc16;",
  S: "color: #0ea5e9;",
  O: "color: #f97316;",
  D: "color: #f97316;",
  Y: "color: #eab308;",
  W: "color: #ffffff;",
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

const MAP_NAME = "che";

interface SimpleNationListProps {
  nations: HistoryNation[];
}

function SimpleNationList({ nations }: SimpleNationListProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-black/20">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-white/5 text-muted-foreground text-xs uppercase tracking-wider">
            <th className="py-3 px-3 font-medium text-left">국명</th>
            <th className="py-3 px-3 font-medium text-right">국력</th>
            <th className="py-3 px-3 font-medium text-right">장수</th>
            <th className="py-3 px-3 font-medium text-right">속령</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {nations.map((nation) => (
            <tr key={nation.nation} className="hover:bg-white/5 transition-colors">
              <td className="py-2 px-3">
                <span
                  className="px-2 py-0.5 rounded text-xs font-medium shadow-sm inline-block min-w-[60px] text-center"
                  style={{
                    color: isBrightColor(nation.color) ? "#000" : "#fff",
                    backgroundColor: nation.color,
                  }}
                >
                  {nation.name}
                </span>
              </td>
              <td className="py-2 px-3 text-right text-white/90 font-mono text-xs">
                {nation.power.toLocaleString()}
              </td>
              <td className="py-2 px-3 text-right text-white/90 font-mono text-xs">
                {nation.gennum.toLocaleString()}
              </td>
              <td
                className="py-2 px-3 text-right text-white/90 font-mono text-xs cursor-help hover:text-primary transition-colors"
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

export default function HistoryPage() {
  const searchParams = useSearchParams();
  const { selectedGeneralId } = useGeneral();
  const [isNationRankingBottom, setIsNationRankingBottom] = useState(false);

  const { data: envData, isLoading: envLoading } = trpc.getGlobalEnv.useQuery();

  const { data: mapData, isLoading: mapLoading } = trpc.getMapData.useQuery(
    { generalId: selectedGeneralId ?? undefined },
    { enabled: true }
  );

  const { data: diplomacyData, isLoading: diplomacyLoading } = trpc.getDiplomacyData.useQuery(
    { generalId: selectedGeneralId ?? undefined },
    { enabled: true }
  );

  const { data: historyData, isLoading: historyLoading } = trpc.getWorldHistory.useQuery(
    { limit: 50 },
    { enabled: true }
  );

  const { data: globalRecords, isLoading: recordsLoading } = trpc.getGlobalRecords.useQuery(
    { limit: 30 },
    { enabled: true }
  );

  const env = envData?.env ?? {};
  const currentYear = (env.year as number) || 184;
  const currentMonth = (env.month as number) || 1;
  const startYear = (env.startYear as number) || 184;

  const currentYearMonth = joinYearMonth(currentYear, currentMonth);
  const firstYearMonth = joinYearMonth(startYear, 1);

  const initialYearMonth = searchParams.get("ym")
    ? Number(searchParams.get("ym"))
    : currentYearMonth;
  const [queryYearMonth, setQueryYearMonth] = useState<number>(initialYearMonth);

  useEffect(() => {
    if (envData && !searchParams.get("ym")) {
      setQueryYearMonth(joinYearMonth(currentYear, currentMonth));
    }
  }, [envData, currentYear, currentMonth, searchParams]);

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

  const globalHistory: string[] = useMemo(() => {
    if (!historyData) return [];
    return historyData.map((h: { text: string }) => h.text);
  }, [historyData]);

  const globalAction: string[] = useMemo(() => {
    if (!globalRecords) return [];
    return globalRecords.map((r: { text: string }) => r.text);
  }, [globalRecords]);

  const yearMonthList = useMemo(() => {
    const result: { text: string; value: number }[] = [];
    const [year, month] = parseYearMonth(currentYearMonth);
    result.push({
      text: `${year}년 ${month}월 (현재)`,
      value: currentYearMonth,
    });
    return result;
  }, [currentYearMonth]);

  const formatCityInfo = useCallback((city: MapCityParsed): MapCityParsed => {
    return city;
  }, []);

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

  useEffect(() => {
    const stored = localStorage.getItem("isNationRankingBottom");
    if (stored) {
      setIsNationRankingBottom(stored === "true");
    }
  }, []);

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
    <div className="min-h-screen bg-background text-foreground pb-20">
      <TopBackBar title="연감" type="close">
        <div className="flex-1" />
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs text-muted-foreground hover:text-primary hover:bg-white/5"
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

      <div className="max-w-[1000px] mx-auto px-2 pt-4">
        <div className="glass p-3 rounded-xl mb-4 flex flex-col md:flex-row items-center gap-3">
          <div className="text-sm text-primary font-bold whitespace-nowrap px-2">연월 선택</div>
          <div className="flex-1 w-full grid grid-cols-12 gap-2">
            <Button
              onClick={() => handleYearMonthChange(queryYearMonth - 1)}
              className="col-span-3 h-9 text-xs"
              variant="outline"
              disabled={true}
            >
              ◀ 이전
            </Button>

            <div className="col-span-6 relative">
              <select
                value={queryYearMonth}
                onChange={(e) => handleYearMonthChange(Number(e.target.value))}
                className="w-full h-9 pl-3 pr-8 text-sm bg-black/40 text-white border border-white/10 rounded-md appearance-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none"
              >
                {yearMonthList.map((item) => (
                  <option key={item.value} value={item.value} className="bg-zinc-900">
                    {item.text}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-white/50">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            <Button
              onClick={() => handleYearMonthChange(queryYearMonth + 1)}
              className="col-span-3 h-9 text-xs"
              variant="outline"
              disabled={true}
            >
              다음 ▶
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
              <p className="text-muted-foreground animate-pulse">데이터를 불러오는 중입니다...</p>
            </div>
          </div>
        ) : mapResult ? (
          <div
            className={`grid grid-cols-12 gap-4 ${isNationRankingBottom ? "history-nation-bottom" : ""}`}
          >
            <div className="col-span-12 lg:col-span-8 map-section">
              <div className="bg-card/60 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden p-1">
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
            </div>

            <div className="col-span-12 lg:col-span-4 nation-section">
              <div className="bg-card/60 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-4 h-full">
                <h3 className="text-sm font-bold text-primary mb-3 flex items-center gap-2">
                  <span className="w-1 h-4 bg-primary rounded-full shadow-[0_0_10px_theme(colors.primary.DEFAULT)]"></span>
                  국가 현황
                </h3>
                <SimpleNationList nations={nations} />
              </div>
            </div>

            <div className="col-span-12 md:col-span-6">
              <div className="bg-card/60 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg overflow-hidden flex flex-col h-full">
                <div className="bg-gradient-to-r from-primary/10 to-transparent p-3 border-b border-white/10 flex items-center justify-between">
                  <span className="text-primary font-bold text-sm flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
                    중원 정세
                  </span>
                </div>
                <div className="bg-black/20 p-4 text-sm max-h-64 overflow-y-auto min-h-[150px]">
                  {globalHistory.map((item, idx) => (
                    <div
                      key={idx}
                      className="mb-1.5 leading-relaxed border-b border-white/5 pb-1 last:border-0 last:pb-0"
                      dangerouslySetInnerHTML={{ __html: formatLog(item) }}
                    />
                  ))}
                  {globalHistory.length === 0 && (
                    <div className="text-muted-foreground text-center py-8 text-sm">
                      기록된 정세가 없습니다.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-span-12 md:col-span-6">
              <div className="bg-card/60 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg overflow-hidden flex flex-col h-full">
                <div className="bg-gradient-to-r from-primary/10 to-transparent p-3 border-b border-white/10 flex items-center justify-between">
                  <span className="text-primary font-bold text-sm flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
                    장수 동향
                  </span>
                </div>
                <div className="bg-black/20 p-4 text-sm max-h-64 overflow-y-auto min-h-[150px]">
                  {globalAction.map((item, idx) => (
                    <div
                      key={idx}
                      className="mb-1.5 leading-relaxed border-b border-white/5 pb-1 last:border-0 last:pb-0"
                      dangerouslySetInnerHTML={{ __html: formatLog(item) }}
                    />
                  ))}
                  {globalAction.length === 0 && (
                    <div className="text-muted-foreground text-center py-8 text-sm">
                      기록된 동향이 없습니다.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-20 flex flex-col items-center gap-2">
            <svg
              className="w-10 h-10 text-white/20"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p>데이터를 불러올 수 없습니다</p>
          </div>
        )}
      </div>

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
