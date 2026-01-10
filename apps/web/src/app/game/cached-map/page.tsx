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

import React, { useMemo } from "react";
import { MapViewer, type MapResult } from "@/components/game/MapViewer";
import { trpc } from "@/utils/trpc";
import { CITY_POSITION_CHE } from "@/constants/map";

// ============================================================================
// Types
// ============================================================================

// Extended map result with optional theme and history
type CachedMapResult = MapResult & {
  theme?: string;
  history?: string[];
};

// Export to satisfy unused check
export type { CachedMapResult };

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
// Component
// ============================================================================

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
    return (cachedMap as any)?.theme ?? "che";
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
            현황
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
                {cachedMap.history.map((log: string, idx: number) => (
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
