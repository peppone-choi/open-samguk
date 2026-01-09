"use client";

/**
 * PageCachedMap - 캐시된 지도 (서버 현황)
 * Ported from legacy/hwe/ts/PageCachedMap.vue
 *
 * Features:
 * - Public view of the server map (no login required)
 * - MapViewer with disallowClick (read-only)
 * - Recent global history logs
 * - Cached for performance (600s in legacy)
 */

import React, { useState, useEffect, useMemo } from "react";
import { MapViewer, type CityPositionMap, type MapResult } from "@/components/game/MapViewer";
import { trpc } from "@/utils/trpc";
import { CITY_POSITION_CHE } from "@/constants/map";

// ============================================================================
// Types
// ============================================================================

interface CachedMapResult extends MapResult {
  theme?: string;
  history?: string[];
}

// ============================================================================
// Utility Functions - formatLog
// ============================================================================

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

const SIZE_MAP: Record<string, string> = {
  "1": "font-size: 0.9em;",
};

/**
 * Format log text with color tags like <R>, <B>, etc.
 * Tags: R=red, B=blue, G=green, M=magenta, C=cyan, L=limegreen, S=skyblue, O/D=orangered, Y=yellow, W=white
 * Example: "<R>Red text</>" -> <span style="color: red;">Red text</span>
 */
function formatLog(text?: string): string {
  if (!text) {
    return "";
  }

  let matchRes;
  let lastIndex = 0;
  const result: string[] = [];

  // Reset regex lastIndex for each call
  LOG_REGEX.lastIndex = 0;

  while ((matchRes = LOG_REGEX.exec(text)) !== null) {
    const { 0: partAll, 1: subPart, index } = matchRes;

    if (lastIndex !== index) {
      result.push(text.slice(lastIndex, index));
    }

    if (subPart === "/") {
      result.push("</span>");
    } else if (subPart.length === 2) {
      result.push(`<span style="${COLOR_MAP[subPart[0]] ?? ""}${SIZE_MAP[subPart[1]] ?? ""}">`);
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
// Mock Data
// ============================================================================

// TODO: Get from URL params or server config
const MOCK_SERVER_NAME = "삼국지 모의전투";
const MOCK_MAP_NAME = "che";
const MOCK_IMAGE_PATH = "/d_pic/game";

// Mock city positions for "che" theme
const MOCK_CITY_POSITION: CityPositionMap = {
  1: ["업", 345, 130],
  2: ["허창", 330, 215],
  3: ["낙양", 275, 180],
  4: ["장안", 145, 165],
  5: ["성도", 25, 290],
  6: ["양양", 255, 290],
  7: ["건업", 505, 305],
  8: ["북평", 465, 65],
  9: ["남피", 395, 95],
  10: ["완", 270, 235],
  11: ["수춘", 395, 270],
  12: ["서주", 440, 250],
  13: ["강릉", 245, 335],
  14: ["장사", 255, 375],
  15: ["시상", 360, 360],
  16: ["위례", 620, 145],
  17: ["계", 365, 35],
  18: ["복양", 410, 170],
  19: ["진류", 365, 185],
  20: ["여남", 330, 260],
  21: ["하비", 480, 235],
  22: ["서량", 25, 50],
  23: ["하내", 230, 150],
  24: ["한중", 135, 205],
  25: ["상용", 185, 225],
  26: ["덕양", 85, 275],
  27: ["강주", 70, 310],
  28: ["건녕", 80, 400],
  29: ["남해", 245, 480],
  30: ["계양", 230, 400],
  31: ["오", 510, 345],
  32: ["평양", 590, 100],
  33: ["사비", 605, 205],
  34: ["계림", 655, 200],
  35: ["진양", 295, 60],
  36: ["평원", 440, 115],
  37: ["북해", 470, 155],
  38: ["초", 365, 230],
  39: ["패", 430, 220],
  40: ["천수", 70, 105],
};

// Mock cached map data
const MOCK_CACHED_MAP: CachedMapResult = {
  version: 2,
  year: 189,
  month: 4,
  startYear: 184,
  cityList: [
    [1, 7, 0, 1, 1, 1], // 업 - 위
    [2, 6, 0, 1, 1, 1], // 허창 - 위
    [3, 7, 0, 0, 2, 0], // 낙양 - 공백
    [4, 8, 0, 2, 3, 1], // 장안 - 촉
    [5, 7, 0, 2, 3, 1], // 성도 - 촉
    [6, 5, 1, 0, 2, 0], // 양양 - 공백, 전쟁중
    [7, 7, 0, 3, 4, 1], // 건업 - 오
    [8, 5, 0, 1, 1, 1], // 북평 - 위
    [9, 4, 0, 1, 1, 1], // 남피 - 위
    [10, 4, 0, 0, 2, 0], // 완 - 공백
    [11, 5, 0, 3, 4, 1], // 수춘 - 오
    [12, 5, 0, 0, 2, 0], // 서주 - 공백
    [13, 4, 0, 0, 2, 0], // 강릉 - 공백
    [14, 5, 0, 3, 4, 1], // 장사 - 오
    [15, 4, 0, 3, 4, 1], // 시상 - 오
    [16, 3, 0, 0, 5, 0], // 위례 - 공백
    [17, 4, 0, 1, 1, 1], // 계 - 위
    [18, 4, 0, 1, 1, 1], // 복양 - 위
    [19, 5, 0, 1, 1, 1], // 진류 - 위
    [20, 4, 0, 0, 2, 0], // 여남 - 공백
    [21, 4, 0, 0, 2, 0], // 하비 - 공백
    [22, 3, 0, 2, 3, 1], // 서량 - 촉
    [23, 4, 0, 1, 1, 1], // 하내 - 위
    [24, 5, 0, 2, 3, 1], // 한중 - 촉
    [25, 3, 0, 2, 3, 1], // 상용 - 촉
    [26, 3, 0, 2, 3, 1], // 덕양 - 촉
    [27, 3, 0, 2, 3, 1], // 강주 - 촉
    [28, 3, 0, 2, 3, 1], // 건녕 - 촉
    [29, 2, 0, 0, 6, 0], // 남해 - 공백
    [30, 3, 0, 0, 6, 0], // 계양 - 공백
    [31, 5, 0, 3, 4, 1], // 오 - 오
    [32, 3, 0, 0, 5, 0], // 평양 - 공백
    [33, 3, 0, 0, 5, 0], // 사비 - 공백
    [34, 3, 0, 0, 5, 0], // 계림 - 공백
    [35, 4, 0, 1, 1, 1], // 진양 - 위
    [36, 4, 0, 1, 1, 1], // 평원 - 위
    [37, 4, 0, 1, 1, 1], // 북해 - 위
    [38, 4, 0, 0, 2, 0], // 초 - 공백
    [39, 4, 0, 0, 2, 0], // 패 - 공백
    [40, 4, 0, 2, 3, 1], // 천수 - 촉
  ],
  nationList: [
    [1, "위", "#3366FF", 1], // 위 - 파란색, 수도 업
    [2, "촉", "#FF3333", 5], // 촉 - 빨간색, 수도 성도
    [3, "오", "#33CC33", 7], // 오 - 녹색, 수도 건업
  ],
  spyList: {},
  shownByGeneralList: [],
  myCity: null,
  myNation: null,
  theme: "che",
  history: [
    "<Y>189년 4월:</> <B>위</B>와 <G>오</G>가 양양에서 전투 중입니다.",
    "<Y>189년 3월:</> <R>촉</R>의 <C>제갈량</>이 천수를 점령하였습니다.",
    "<Y>189년 2월:</> <B>위</B>의 <M>조조</>가 진류에서 대규모 징병을 실시하였습니다.",
    "<Y>189년 1월:</> <G>오</G>의 <S>손권</>이 장사를 점령하였습니다.",
    "<Y>188년 12월:</> <R>촉</R>과 <G>오</G>가 동맹을 맺었습니다.",
    "<Y>188년 11월:</> <B>위</B>의 <C>사마의</>가 북해를 점령하였습니다.",
    "<Y>188년 10월:</> <R>촉</R>의 <O>관우</>가 한중 방어전에서 승리하였습니다.",
    "<Y>188년 9월:</> <G>오</G>가 오를 수도로 지정하였습니다. (<L>잘못된 정보 수정</>)",
    "<Y>188년 8월:</> <B>위</B>의 <W>조조</>가 업을 수도로 지정하였습니다.",
    "<Y>188년 7월:</> <R>촉</R>의 <D>유비</>가 성도를 수도로 지정하였습니다.",
  ],
};

// ============================================================================
// Component
// ============================================================================

export default function CachedMapPage() {
  const { data: mapData, isLoading: isMapLoading } = trpc.getMapData.useQuery({});

  const loading = isMapLoading;
  const error = !mapData && !isMapLoading ? "지도 데이터를 불러오는데 실패했습니다." : null;
  const cachedMap = mapData;

  // Determine map name from cached data or use default
  const mapName = useMemo(() => {
    return cachedMap?.theme ?? MOCK_MAP_NAME;
  }, [cachedMap]);

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg0">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto" />
          <p className="text-gray-400">지도 로딩 중...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !cachedMap) {
    return (
      <div className="flex min-h-screen items-center justify-center bg0">
        <div className="text-center">
          <p className="text-red-500">{error ?? "지도 데이터가 없습니다."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg0 py-4">
      <div className="mx-auto w-full max-w-[700px] px-2">
        {/* Card Container */}
        <div className="rounded-lg border border-gray-600 bg1 shadow-lg overflow-hidden">
          {/* Card Header */}
          <h3 className="bg-gradient-to-r from-gray-700 to-gray-800 px-4 py-3 text-lg font-bold text-white border-b border-gray-600">
            {MOCK_SERVER_NAME} 현황
          </h3>

          {/* Map Viewer */}
          <div className="flex justify-center">
            <MapViewer
              mapName={mapName}
              mapData={cachedMap as any}
              imagePath="/d_pic/game"
              cityPosition={CITY_POSITION_CHE}
              isDetailMap={true}
              disallowClick={true}
              width="auto"
            />
          </div>

          {/* History Logs */}
          {cachedMap.history && cachedMap.history.length > 0 && (
            <div className="border-t border-gray-600 bg2 px-4 py-3">
              <div className="space-y-1">
                {cachedMap.history.map((log, idx) => (
                  <div
                    key={idx}
                    className="text-sm text-gray-300 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: formatLog(log) }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Cache Info */}
        <div className="mt-2 text-center text-xs text-gray-500">이 정보는 10분마다 갱신됩니다.</div>
      </div>
    </div>
  );
}
