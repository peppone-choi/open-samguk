"use client";

/**
 * PageBattleCenter - 감찰부 (General Inspector)
 * Ported from legacy/hwe/ts/PageBattleCenter.vue
 *
 * Features:
 * - General list with sorting (recent_war, warnum, turntime, name)
 * - Previous/Next navigation
 * - GeneralBasicCard showing general info
 * - GeneralSupplementCard showing additional stats
 * - Log sections: generalHistory, battleDetail, battleResult, generalAction
 */

import React, { useState, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { TopBackBar } from "@/components/game";
import { Button } from "@/components/ui/button";
import { SammoBar } from "@/components/game/SammoBar";
import { trpc } from "@/utils/trpc";
import { useGeneral } from "@/contexts/GeneralContext";

// ============================================================================
// Types
// ============================================================================

interface GeneralListItemP1 {
  no: number;
  name: string;
  nation: number;
  npc: number;
  injury: number;
  leadership: number;
  strength: number;
  intel: number;
  explevel: number;
  dedlevel: number;
  gold: number;
  rice: number;
  killturn: number;
  picture: string;
  imgsvr: 0 | 1;
  age: number;
  specialDomestic: string;
  specialWar: string;
  personal: string;
  belong: number;
  officerLevel: number;
  officerLevelText: string;
  honorText: string;
  dedLevelText: string;
  bill: number;
  city: number;
  troop: number;
  // P1 fields
  crewtype: string;
  crew: number;
  train: number;
  atmos: number;
  turntime: string;
  recent_war: string;
  horse: string;
  weapon: string;
  book: string;
  item: string;
  warnum: number;
  killnum: number;
  deathnum: number;
  killcrew: number;
  deathcrew: number;
  firenum: number;
  experience: number;
  dedication: number;
  dex1: number;
  dex2: number;
  dex3: number;
  dex4: number;
  dex5: number;
}

type OrderByKey = "recent_war" | "warnum" | "turntime" | "name";

interface NationInfo {
  nation: number;
  name: string;
  color: string;
}

// ============================================================================
// Utility Functions
// ============================================================================

function getNPCColor(npcType: number): string | undefined {
  if (npcType === 6) return "#66cdaa";
  if (npcType === 5) return "#008b8b";
  if (npcType === 4) return "#00bfff";
  if (npcType >= 2) return "#00ffff";
  if (npcType === 1) return "#87ceeb";
  return undefined;
}

function formatInjury(injury: number): [string, string] {
  if (injury === 0) return ["건강", "limegreen"];
  if (injury <= 20) return ["경상", "yellow"];
  if (injury <= 50) return ["중상", "orange"];
  if (injury <= 80) return ["위독", "orangered"];
  return ["빈사", "red"];
}

function formatDexLevel(dex: number): { name: string; color: string } {
  if (dex >= 9500 * 100) return { name: "신", color: "#FF00FF" };
  if (dex >= 7000 * 100) return { name: "명", color: "#FF6699" };
  if (dex >= 4500 * 100) return { name: "달", color: "#FF9933" };
  if (dex >= 2500 * 100) return { name: "숙", color: "#FFCC00" };
  if (dex >= 1000 * 100) return { name: "정", color: "#99FF00" };
  if (dex >= 300 * 100) return { name: "초", color: "#66CCFF" };
  return { name: "무", color: "#AAAAAA" };
}

function formatHonor(experience: number): string {
  if (experience >= 100000) return "절대자";
  if (experience >= 80000) return "전설";
  if (experience >= 60000) return "영웅";
  if (experience >= 45000) return "명사";
  if (experience >= 30000) return "원로";
  if (experience >= 18000) return "고관";
  if (experience >= 10000) return "간신";
  if (experience >= 5000) return "신예";
  if (experience >= 2000) return "초급";
  return "무명";
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

// Order configuration
const ORDER_CONFIG: Record<
  OrderByKey,
  {
    name: string;
    getter: (gen: GeneralListItemP1) => string | number;
    isAsc: boolean;
    suffix: (gen: GeneralListItemP1) => string;
  }
> = {
  recent_war: {
    name: "최근 전투",
    getter: (gen) => gen.recent_war || "",
    isAsc: false,
    suffix: (gen) => `[${(gen.recent_war || "").slice(-5)}]`,
  },
  warnum: {
    name: "전투 횟수",
    getter: (gen) => gen.warnum || 0,
    isAsc: false,
    suffix: (gen) => `[${gen.warnum || 0}회]`,
  },
  turntime: {
    name: "최근 턴",
    getter: (gen) => gen.turntime || "",
    isAsc: false,
    suffix: () => "",
  },
  name: {
    name: "이름",
    getter: (gen) => `${gen.npc} ${gen.name}`,
    isAsc: true,
    suffix: () => "",
  },
};

// ============================================================================
// Sub Components
// ============================================================================

interface GeneralSupplementCardProps {
  general: GeneralListItemP1;
}

function GeneralSupplementCard({ general }: GeneralSupplementCardProps) {
  const dexList: [string, number][] = [
    ["보병", general.dex1 || 0],
    ["궁병", general.dex2 || 0],
    ["기병", general.dex3 || 0],
    ["귀병", general.dex4 || 0],
    ["차병", general.dex5 || 0],
  ];

  const warnum = general.warnum || 0;
  const killnum = general.killnum || 0;
  const deathcrew = general.deathcrew || 0;
  const killcrew = general.killcrew || 0;

  const winRate = warnum > 0 ? ((killnum / warnum) * 100).toFixed(2) : "0.00";
  const killRate =
    deathcrew > 0 ? ((killcrew / deathcrew) * 100).toFixed(2) : killcrew > 0 ? "∞" : "0.00";

  return (
    <div className="bg2 text-sm">
      {/* Additional Info */}
      <div className="grid grid-cols-6 text-center border-b border-gray-600">
        <div className="col-span-6 bg1 text-orange-400 font-bold py-1">추가 정보</div>

        <div className="bg1 border-l border-gray-600 py-0.5">명성</div>
        <div className="py-0.5">
          {formatHonor(general.experience || 0)} ({(general.experience || 0).toLocaleString()})
        </div>
        <div className="bg1 border-l border-gray-600 py-0.5">계급</div>
        <div className="py-0.5">
          {general.dedLevelText} ({(general.dedication || 0).toLocaleString()})
        </div>
        <div className="bg1 border-l border-gray-600 py-0.5">봉급</div>
        <div className="py-0.5">{(general.bill || 0).toLocaleString()}</div>

        <div className="bg1 border-l border-gray-600 py-0.5">전투</div>
        <div className="py-0.5">{warnum.toLocaleString()}</div>
        <div className="bg1 border-l border-gray-600 py-0.5">계략</div>
        <div className="py-0.5">{(general.firenum || 0).toLocaleString()}</div>
        <div className="bg1 border-l border-gray-600 py-0.5">사관</div>
        <div className="py-0.5">{general.belong}년차</div>

        <div className="bg1 border-l border-gray-600 py-0.5">승률</div>
        <div className="py-0.5">{winRate} %</div>
        <div className="bg1 border-l border-gray-600 py-0.5">승리</div>
        <div className="py-0.5">{killnum.toLocaleString()}</div>
        <div className="bg1 border-l border-gray-600 py-0.5">패배</div>
        <div className="py-0.5">{(general.deathnum || 0).toLocaleString()}</div>

        <div className="bg1 border-l border-gray-600 py-0.5">살상률</div>
        <div className="py-0.5">{killRate} %</div>
        <div className="bg1 border-l border-gray-600 py-0.5">사살</div>
        <div className="py-0.5">{killcrew.toLocaleString()}</div>
        <div className="bg1 border-l border-gray-600 py-0.5">피살</div>
        <div className="py-0.5">{deathcrew.toLocaleString()}</div>
      </div>

      {/* Dexterity */}
      <div className="grid grid-cols-4 text-center">
        <div className="col-span-4 bg1 text-orange-400 font-bold py-1 border-b border-gray-600">
          숙련도
        </div>
        {dexList.map(([dexType, dex]) => {
          const dexInfo = formatDexLevel(dex);
          return (
            <React.Fragment key={dexType}>
              <div className="bg1 border-l border-b border-gray-600 py-0.5">{dexType}</div>
              <div className="border-b border-gray-600 py-0.5" style={{ color: dexInfo.color }}>
                {dexInfo.name}
              </div>
              <div className="border-b border-gray-600 py-0.5">{(dex / 1000).toFixed(1)}K</div>
              <div className="border-b border-gray-600 py-0.5 px-1 flex items-center">
                <SammoBar height={10} percent={(dex / 1000000) * 100} />
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

interface GeneralBasicCardProps {
  general: GeneralListItemP1;
  nation: NationInfo;
}

function GeneralBasicCard({ general, nation }: GeneralBasicCardProps) {
  const [injuryText, injuryColor] = formatInjury(general.injury);

  return (
    <div className="bg2 border border-gray-600">
      <div className="grid grid-cols-8 text-sm text-center">
        {/* Row 1: Icon + Name */}
        <div className="row-span-3 flex items-center justify-center p-2">
          <div className="w-16 h-16 bg-gray-700 rounded flex items-center justify-center text-xs">
            {general.picture?.slice(0, 3) || "?"}
          </div>
        </div>
        <div
          className="col-span-7 py-1 font-bold text-lg"
          style={{ backgroundColor: nation.color, color: "#000" }}
        >
          {general.name}
        </div>

        {/* Row 2: Basic stats */}
        <div className="bg1 py-0.5">통솔</div>
        <div className="py-0.5 text-blue-400">{general.leadership}</div>
        <div className="bg1 py-0.5">무력</div>
        <div className="py-0.5 text-red-400">{general.strength}</div>
        <div className="bg1 py-0.5">지력</div>
        <div className="py-0.5 text-green-400">{general.intel}</div>
        <div className="bg1 py-0.5">상성</div>
        <div className="py-0.5" style={{ color: injuryColor }}>
          {injuryText}
        </div>

        {/* Row 3: Resources */}
        <div className="bg1 py-0.5">금</div>
        <div className="py-0.5 text-yellow-400">{general.gold.toLocaleString()}</div>
        <div className="bg1 py-0.5">쌀</div>
        <div className="py-0.5 text-green-300">{general.rice.toLocaleString()}</div>
        <div className="bg1 py-0.5">관직</div>
        <div className="col-span-2 py-0.5 text-cyan-400">{general.officerLevelText}</div>

        {/* Row 4: Crew info */}
        <div className="row-span-3 flex items-center justify-center p-2">
          <div className="w-16 h-16 bg-gray-700 rounded flex items-center justify-center text-xs">
            {general.crewtype?.slice(0, 2) || "?"}
          </div>
        </div>
        <div className="bg1 py-0.5">병종</div>
        <div className="col-span-2 py-0.5">{general.crewtype || "-"}</div>
        <div className="bg1 py-0.5">병력</div>
        <div className="py-0.5">{(general.crew || 0).toLocaleString()}</div>
        <div className="bg1 py-0.5">나이</div>
        <div className="py-0.5">{general.age}</div>

        {/* Row 5: Train/Atmos */}
        <div className="bg1 py-0.5">훈련</div>
        <div className="py-0.5">{general.train || 0}</div>
        <div className="bg1 py-0.5">사기</div>
        <div className="py-0.5">{general.atmos || 0}</div>
        <div className="bg1 py-0.5">특기전</div>
        <div className="col-span-2 py-0.5">{general.specialWar || "-"}</div>

        {/* Row 6: Equipment */}
        <div className="bg1 py-0.5">무기</div>
        <div className="col-span-2 py-0.5">{general.weapon || "-"}</div>
        <div className="bg1 py-0.5">서적</div>
        <div className="col-span-2 py-0.5">{general.book || "-"}</div>
        <div className="bg1 py-0.5">특기내</div>
        <div className="py-0.5">{general.specialDomestic || "-"}</div>
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function BattleCenterPage() {
  const searchParams = useSearchParams();
  const initialGeneralId = searchParams.get("gen") ? Number(searchParams.get("gen")) : undefined;

  const { selectedGeneralId, selectedGeneral } = useGeneral();
  const nationId = selectedGeneral?.nationId ?? 0;

  const [orderBy, setOrderBy] = useState<OrderByKey>("turntime");
  const [targetGeneralID, setTargetGeneralID] = useState<number | undefined>(initialGeneralId);

  // Fetch nation's general list
  const {
    data: nationGeneralData,
    isLoading,
    refetch,
  } = trpc.getNationGeneralList.useQuery(
    { nationId, generalId: selectedGeneralId ?? undefined },
    { enabled: !!nationId }
  );

  // Fetch nation info
  const { data: nationInfoData } = trpc.getNationInfo.useQuery(
    { nationId },
    { enabled: !!nationId }
  );

  // Fetch logs for target general
  const { data: generalLogsData } = trpc.getGeneralLogs.useQuery(
    { generalId: targetGeneralID ?? 0, limit: 50 },
    { enabled: !!targetGeneralID }
  );

  // Convert API response to GeneralListItemP1 format
  const generalList = useMemo(() => {
    const list = nationGeneralData?.list ?? [];
    const result = new Map<number, GeneralListItemP1>();
    for (const gen of list) {
      result.set(gen.no, gen as GeneralListItemP1);
    }
    return result;
  }, [nationGeneralData]);

  const nationInfo: NationInfo | null = useMemo(() => {
    if (!nationInfoData) return null;
    return {
      nation: nationInfoData.nation,
      name: nationInfoData.name,
      color: nationInfoData.color,
    };
  }, [nationInfoData]);

  // Sorted general list
  const orderedGeneralList = useMemo(() => {
    const list = Array.from(generalList.values());
    const config = ORDER_CONFIG[orderBy];

    list.sort((a, b) => {
      const aVal = config.getter(a);
      const bVal = config.getter(b);
      if (aVal === bVal) return 0;
      return config.isAsc ? (aVal > bVal ? 1 : -1) : aVal < bVal ? 1 : -1;
    });

    return list;
  }, [generalList, orderBy]);

  // Inverse index for navigation
  const orderedInvIndex = useMemo(() => {
    const map = new Map<number, number>();
    orderedGeneralList.forEach((gen, idx) => {
      map.set(gen.no, idx);
    });
    return map;
  }, [orderedGeneralList]);

  // Current target general
  const targetGeneral = useMemo(() => {
    if (!targetGeneralID) return undefined;
    return generalList.get(targetGeneralID);
  }, [generalList, targetGeneralID]);

  // Set initial target if not set
  React.useEffect(() => {
    if (!targetGeneralID && orderedGeneralList.length > 0) {
      setTargetGeneralID(orderedGeneralList[0].no);
    }
  }, [targetGeneralID, orderedGeneralList]);

  // Process logs into categories
  const generalLogs = useMemo(() => {
    const logs = generalLogsData ?? [];
    const result: Record<string, Map<number, string>> = {
      generalHistory: new Map(),
      battleResult: new Map(),
      battleDetail: new Map(),
      generalAction: new Map(),
    };

    for (const log of logs) {
      const logType = log.logType ?? "generalAction";
      const category =
        logType === "history"
          ? "generalHistory"
          : logType === "battle_result"
            ? "battleResult"
            : logType === "battle_detail"
              ? "battleDetail"
              : "generalAction";

      result[category].set(log.id, formatLog(log.text ?? ""));
    }

    return result;
  }, [generalLogsData]);

  // Navigation handlers
  const changeTargetByOffset = useCallback(
    (offset: number) => {
      if (!targetGeneralID) return;
      const currIdx = orderedInvIndex.get(targetGeneralID);
      if (currIdx === undefined) return;

      let newIdx = currIdx + offset;
      const listLen = orderedGeneralList.length;
      while (newIdx < 0) newIdx += listLen;
      newIdx = newIdx % listLen;

      setTargetGeneralID(orderedGeneralList[newIdx].no);
    },
    [targetGeneralID, orderedInvIndex, orderedGeneralList]
  );

  // Handle order change
  const handleOrderChange = useCallback(
    (newOrder: OrderByKey) => {
      setOrderBy(newOrder);
      // Reset to first general when order changes
      if (orderedGeneralList.length > 0) {
        setTargetGeneralID(orderedGeneralList[0].no);
      }
    },
    [orderedGeneralList]
  );

  const handleReload = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <div className="min-h-screen bg0">
      <TopBackBar title="감찰부" reloadable={true} onReload={handleReload} type="close" />

      <div className="max-w-[1000px] mx-auto px-2 pb-4">
        {/* Navigation Row */}
        <div className="grid grid-cols-12 gap-1 mb-2">
          <div className="col-span-2 lg:col-span-1">
            <Button
              onClick={() => changeTargetByOffset(-1)}
              className="w-full h-8 text-sm"
              variant="secondary"
            >
              ◀ 이전
            </Button>
          </div>
          <div className="col-span-3 lg:col-span-4">
            <select
              value={orderBy}
              onChange={(e) => handleOrderChange(e.target.value as OrderByKey)}
              className="w-full h-8 px-2 text-sm bg-zinc-700 text-white border border-gray-600 rounded"
            >
              {Object.entries(ORDER_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-5 lg:col-span-6">
            <select
              value={targetGeneralID ?? ""}
              onChange={(e) => setTargetGeneralID(Number(e.target.value))}
              className="w-full h-8 px-2 text-sm bg-zinc-700 text-white border border-gray-600 rounded"
            >
              {orderedGeneralList.map((gen) => (
                <option key={gen.no} value={gen.no} style={{ color: getNPCColor(gen.npc) }}>
                  {gen.officerLevel > 4 ? `*${gen.name}*` : gen.name}(
                  {(gen.turntime || "").slice(-5)}){ORDER_CONFIG[orderBy].suffix(gen)}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-2 lg:col-span-1">
            <Button
              onClick={() => changeTargetByOffset(1)}
              className="w-full h-8 text-sm"
              variant="secondary"
            >
              다음 ▶
            </Button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto" />
              <p className="text-gray-400">로딩 중...</p>
            </div>
          </div>
        ) : targetGeneral && nationInfo ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 bg0">
            {/* General Info Section */}
            <div>
              <div className="bg1 text-center text-sky-400 text-lg font-bold py-1 border border-gray-600">
                장수 정보
              </div>
              <GeneralBasicCard general={targetGeneral} nation={nationInfo} />
              <GeneralSupplementCard general={targetGeneral} />
            </div>

            {/* History Section */}
            <div>
              <div className="bg1 text-center text-orange-400 text-lg font-bold py-1 border border-gray-600">
                장수 열전
              </div>
              <div className="bg2 p-2 text-sm border border-gray-600 max-h-48 overflow-y-auto">
                {Array.from(generalLogs.generalHistory.entries()).map(([id, log]) => (
                  <div key={id} className="mb-1" dangerouslySetInnerHTML={{ __html: log }} />
                ))}
                {generalLogs.generalHistory.size === 0 && (
                  <div className="text-gray-500">기록 없음</div>
                )}
              </div>
            </div>

            {/* Battle Detail Section */}
            <div>
              <div className="bg1 text-center text-orange-400 text-lg font-bold py-1 border border-gray-600">
                전투 기록
              </div>
              <div className="bg2 p-2 text-sm border border-gray-600 max-h-48 overflow-y-auto">
                {Array.from(generalLogs.battleDetail.entries()).map(([id, log]) => (
                  <div key={id} className="mb-1" dangerouslySetInnerHTML={{ __html: log }} />
                ))}
                {generalLogs.battleDetail.size === 0 && (
                  <div className="text-gray-500">기록 없음</div>
                )}
              </div>
            </div>

            {/* Battle Result Section */}
            <div>
              <div className="bg1 text-center text-orange-400 text-lg font-bold py-1 border border-gray-600">
                전투 결과
              </div>
              <div className="bg2 p-2 text-sm border border-gray-600 max-h-48 overflow-y-auto">
                {Array.from(generalLogs.battleResult.entries()).map(([id, log]) => (
                  <div key={id} className="mb-1" dangerouslySetInnerHTML={{ __html: log }} />
                ))}
                {generalLogs.battleResult.size === 0 && (
                  <div className="text-gray-500">기록 없음</div>
                )}
              </div>
            </div>

            {/* General Action Section (only if has content) */}
            {generalLogs.generalAction.size > 0 && (
              <div className="lg:col-span-2">
                <div className="bg1 text-center text-orange-400 text-lg font-bold py-1 border border-gray-600">
                  개인 기록
                </div>
                <div className="bg2 p-2 text-sm border border-gray-600 max-h-48 overflow-y-auto">
                  {Array.from(generalLogs.generalAction.entries()).map(([id, log]) => (
                    <div key={id} className="mb-1" dangerouslySetInnerHTML={{ __html: log }} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-20">
            {nationId === 0 ? "소속 국가가 없습니다." : "장수를 선택해주세요"}
          </div>
        )}
      </div>
    </div>
  );
}
