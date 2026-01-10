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
  if (injury === 0) return ["건강", "#4ade80"];
  if (injury <= 20) return ["경상", "#facc15"];
  if (injury <= 50) return ["중상", "#fb923c"];
  if (injury <= 80) return ["위독", "#f87171"];
  return ["빈사", "#ef4444"];
}

function formatDexLevel(dex: number): { name: string; color: string } {
  if (dex >= 9500 * 100) return { name: "신", color: "#d946ef" };
  if (dex >= 7000 * 100) return { name: "명", color: "#ec4899" };
  if (dex >= 4500 * 100) return { name: "달", color: "#f97316" };
  if (dex >= 2500 * 100) return { name: "숙", color: "#eab308" };
  if (dex >= 1000 * 100) return { name: "정", color: "#84cc16" };
  if (dex >= 300 * 100) return { name: "초", color: "#0ea5e9" };
  return { name: "무", color: "#9ca3af" };
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
  R: "color: #ef4444;",
  B: "color: #60a5fa;",
  G: "color: #4ade80;",
  M: "color: #e879f9;",
  C: "color: #22d3ee;",
  L: "color: #a3e635;",
  S: "color: #38bdf8;",
  O: "color: #fb923c;",
  D: "color: #fb923c;",
  Y: "color: #facc15;",
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
    <div className="premium-card p-0 overflow-hidden text-sm">
      {/* Additional Info */}
      <div className="grid grid-cols-6 text-center divide-x divide-white/5 border-b border-white/10">
        <div className="col-span-6 bg-white/5 text-gold-400 font-bold py-2 border-b border-white/10">
          추가 정보
        </div>

        <div className="bg-white/5 py-1.5 text-muted-foreground">명성</div>
        <div className="py-1.5 text-foreground">
          {formatHonor(general.experience || 0)} ({(general.experience || 0).toLocaleString()})
        </div>
        <div className="bg-white/5 py-1.5 text-muted-foreground">계급</div>
        <div className="py-1.5 text-foreground">
          {general.dedLevelText} ({(general.dedication || 0).toLocaleString()})
        </div>
        <div className="bg-white/5 py-1.5 text-muted-foreground">봉급</div>
        <div className="py-1.5 text-foreground">{(general.bill || 0).toLocaleString()}</div>

        <div className="bg-white/5 py-1.5 border-t border-white/10 text-muted-foreground">전투</div>
        <div className="py-1.5 border-t border-white/10 text-foreground">
          {warnum.toLocaleString()}
        </div>
        <div className="bg-white/5 py-1.5 border-t border-white/10 text-muted-foreground">계략</div>
        <div className="py-1.5 border-t border-white/10 text-foreground">
          {(general.firenum || 0).toLocaleString()}
        </div>
        <div className="bg-white/5 py-1.5 border-t border-white/10 text-muted-foreground">사관</div>
        <div className="py-1.5 border-t border-white/10 text-foreground">{general.belong}년차</div>

        <div className="bg-white/5 py-1.5 border-t border-white/10 text-muted-foreground">승률</div>
        <div className="py-1.5 border-t border-white/10 text-foreground">{winRate} %</div>
        <div className="bg-white/5 py-1.5 border-t border-white/10 text-muted-foreground">승리</div>
        <div className="py-1.5 border-t border-white/10 text-sky-400">
          {killnum.toLocaleString()}
        </div>
        <div className="bg-white/5 py-1.5 border-t border-white/10 text-muted-foreground">패배</div>
        <div className="py-1.5 border-t border-white/10 text-red-400">
          {(general.deathnum || 0).toLocaleString()}
        </div>

        <div className="bg-white/5 py-1.5 border-t border-white/10 text-muted-foreground">
          살상률
        </div>
        <div className="py-1.5 border-t border-white/10 text-foreground">{killRate} %</div>
        <div className="bg-white/5 py-1.5 border-t border-white/10 text-muted-foreground">사살</div>
        <div className="py-1.5 border-t border-white/10 text-red-400">
          {killcrew.toLocaleString()}
        </div>
        <div className="bg-white/5 py-1.5 border-t border-white/10 text-muted-foreground">피살</div>
        <div className="py-1.5 border-t border-white/10 text-foreground">
          {deathcrew.toLocaleString()}
        </div>
      </div>

      {/* Dexterity */}
      <div className="grid grid-cols-4 text-center divide-x divide-white/5">
        <div className="col-span-4 bg-white/5 text-gold-400 font-bold py-2 border-b border-white/10">
          숙련도
        </div>
        {dexList.map(([dexType, dex]) => {
          const dexInfo = formatDexLevel(dex);
          return (
            <React.Fragment key={dexType}>
              <div className="bg-white/5 py-1.5 border-b border-white/10 text-muted-foreground">
                {dexType}
              </div>
              <div
                className="py-1.5 border-b border-white/10 font-bold"
                style={{ color: dexInfo.color }}
              >
                {dexInfo.name}
              </div>
              <div className="py-1.5 border-b border-white/10 text-foreground">
                {(dex / 1000).toFixed(1)}K
              </div>
              <div className="py-1.5 px-2 border-b border-white/10 flex items-center justify-center">
                <SammoBar height={8} percent={(dex / 1000000) * 100} />
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
    <div className="premium-card p-0 overflow-hidden mb-4">
      <div className="grid grid-cols-8 text-sm text-center divide-x divide-white/5">
        {/* Row 1: Icon + Name */}
        <div className="row-span-3 flex items-center justify-center p-2 bg-black/20">
          <div className="w-16 h-16 bg-gray-900 rounded-lg border border-white/10 flex items-center justify-center text-xs shadow-inner">
            {general.picture?.slice(0, 3) || "?"}
          </div>
        </div>
        <div
          className="col-span-7 py-2 font-bold text-lg border-b border-white/10 shadow-sm"
          style={{
            background: `linear-gradient(90deg, ${nation.color}DD, ${nation.color}99)`,
            color: "#fff",
            textShadow: "0 1px 2px rgba(0,0,0,0.8)",
          }}
        >
          {general.name}
        </div>

        {/* Row 2: Basic stats */}
        <div className="bg-white/5 py-1.5 border-b border-white/10 text-muted-foreground">통솔</div>
        <div className="py-1.5 border-b border-white/10 text-sky-400 font-bold">
          {general.leadership}
        </div>
        <div className="bg-white/5 py-1.5 border-b border-white/10 text-muted-foreground">무력</div>
        <div className="py-1.5 border-b border-white/10 text-red-400 font-bold">
          {general.strength}
        </div>
        <div className="bg-white/5 py-1.5 border-b border-white/10 text-muted-foreground">지력</div>
        <div className="py-1.5 border-b border-white/10 text-green-400 font-bold">
          {general.intel}
        </div>
        <div className="bg-white/5 py-1.5 border-b border-white/10 text-muted-foreground">상성</div>
        <div className="py-1.5 border-b border-white/10 font-bold" style={{ color: injuryColor }}>
          {injuryText}
        </div>

        {/* Row 3: Resources */}
        <div className="bg-white/5 py-1.5 border-b border-white/10 text-muted-foreground">금</div>
        <div className="py-1.5 border-b border-white/10 text-yellow-400">
          {general.gold.toLocaleString()}
        </div>
        <div className="bg-white/5 py-1.5 border-b border-white/10 text-muted-foreground">쌀</div>
        <div className="py-1.5 border-b border-white/10 text-green-300">
          {general.rice.toLocaleString()}
        </div>
        <div className="bg-white/5 py-1.5 border-b border-white/10 text-muted-foreground">관직</div>
        <div className="col-span-2 py-1.5 border-b border-white/10 text-cyan-400 font-medium">
          {general.officerLevelText}
        </div>

        {/* Row 4: Crew info */}
        <div className="row-span-3 flex items-center justify-center p-2 bg-black/20 border-t border-white/10">
          <div className="w-16 h-16 bg-gray-900 rounded-lg border border-white/10 flex items-center justify-center text-xs shadow-inner">
            {general.crewtype?.slice(0, 2) || "?"}
          </div>
        </div>
        <div className="bg-white/5 py-1.5 border-b border-white/10 text-muted-foreground">병종</div>
        <div className="col-span-2 py-1.5 border-b border-white/10 text-foreground">
          {general.crewtype || "-"}
        </div>
        <div className="bg-white/5 py-1.5 border-b border-white/10 text-muted-foreground">병력</div>
        <div className="py-1.5 border-b border-white/10 text-foreground">
          {(general.crew || 0).toLocaleString()}
        </div>
        <div className="bg-white/5 py-1.5 border-b border-white/10 text-muted-foreground">나이</div>
        <div className="py-1.5 border-b border-white/10 text-foreground">{general.age}</div>

        {/* Row 5: Train/Atmos */}
        <div className="bg-white/5 py-1.5 border-b border-white/10 text-muted-foreground">훈련</div>
        <div className="py-1.5 border-b border-white/10 text-foreground">{general.train || 0}</div>
        <div className="bg-white/5 py-1.5 border-b border-white/10 text-muted-foreground">사기</div>
        <div className="py-1.5 border-b border-white/10 text-foreground">{general.atmos || 0}</div>
        <div className="bg-white/5 py-1.5 border-b border-white/10 text-muted-foreground">
          특기전
        </div>
        <div className="col-span-2 py-1.5 border-b border-white/10 text-foreground">
          {general.specialWar || "-"}
        </div>

        {/* Row 6: Equipment */}
        <div className="bg-white/5 py-1.5 text-muted-foreground">무기</div>
        <div className="col-span-2 py-1.5 text-foreground">{general.weapon || "-"}</div>
        <div className="bg-white/5 py-1.5 text-muted-foreground">서적</div>
        <div className="col-span-2 py-1.5 text-foreground">{general.book || "-"}</div>
        <div className="bg-white/5 py-1.5 text-muted-foreground">특기내</div>
        <div className="py-1.5 text-foreground">{general.specialDomestic || "-"}</div>
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
    <div className="min-h-screen bg-background text-foreground pb-10">
      <TopBackBar title="감찰부" reloadable={true} onReload={handleReload} type="close" />

      <div className="max-w-[1000px] mx-auto px-4 mt-6">
        {/* Navigation Row */}
        <div className="grid grid-cols-12 gap-2 mb-6 p-4 glass rounded-xl">
          <div className="col-span-2 lg:col-span-1">
            <Button
              onClick={() => changeTargetByOffset(-1)}
              className="w-full h-10 text-sm bg-secondary hover:bg-secondary/80 border border-white/10"
              variant="secondary"
            >
              ◀
            </Button>
          </div>
          <div className="col-span-3 lg:col-span-4">
            <select
              value={orderBy}
              onChange={(e) => handleOrderChange(e.target.value as OrderByKey)}
              className="w-full h-10 px-3 text-sm bg-background/50 text-foreground border border-white/10 rounded-md focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none backdrop-blur-md appearance-none"
            >
              {Object.entries(ORDER_CONFIG).map(([key, config]) => (
                <option key={key} value={key} className="bg-zinc-900">
                  {config.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-5 lg:col-span-6 relative">
            <select
              value={targetGeneralID ?? ""}
              onChange={(e) => setTargetGeneralID(Number(e.target.value))}
              className="w-full h-10 px-3 text-sm bg-background/50 text-foreground border border-white/10 rounded-md focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none backdrop-blur-md appearance-none"
            >
              {orderedGeneralList.map((gen) => (
                <option
                  key={gen.no}
                  value={gen.no}
                  style={{ color: getNPCColor(gen.npc) }}
                  className="bg-zinc-900"
                >
                  {gen.officerLevel > 4 ? `*${gen.name}*` : gen.name}(
                  {(gen.turntime || "").slice(-5)}){ORDER_CONFIG[orderBy].suffix(gen)}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
              ▼
            </div>
          </div>
          <div className="col-span-2 lg:col-span-1">
            <Button
              onClick={() => changeTargetByOffset(1)}
              className="w-full h-10 text-sm bg-secondary hover:bg-secondary/80 border border-white/10"
              variant="secondary"
            >
              ▶
            </Button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-40">
            <div className="text-center">
              <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto shadow-glow" />
              <p className="text-muted-foreground animate-pulse">데이터를 불러오는 중...</p>
            </div>
          </div>
        ) : targetGeneral && nationInfo ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
            {/* General Info Section */}
            <div className="space-y-6">
              <div>
                <div className="section_title mb-2 text-gold-400">장수 정보</div>
                <GeneralBasicCard general={targetGeneral} nation={nationInfo} />
                <GeneralSupplementCard general={targetGeneral} />
              </div>
            </div>

            {/* Logs Column */}
            <div className="space-y-6">
              {/* History Section */}
              <div>
                <div className="section_title mb-2 text-primary">장수 열전</div>
                <div className="glass p-4 text-sm border border-white/10 rounded-lg max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent shadow-inner">
                  {Array.from(generalLogs.generalHistory.entries()).map(([id, log]) => (
                    <div
                      key={id}
                      className="mb-2 pb-2 border-b border-white/5 last:border-0 last:mb-0 last:pb-0"
                      dangerouslySetInnerHTML={{ __html: log }}
                    />
                  ))}
                  {generalLogs.generalHistory.size === 0 && (
                    <div className="text-muted-foreground text-center py-8">기록이 없습니다</div>
                  )}
                </div>
              </div>

              {/* Battle Detail Section */}
              <div>
                <div className="section_title mb-2 text-primary">전투 기록</div>
                <div className="glass p-4 text-sm border border-white/10 rounded-lg max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent shadow-inner">
                  {Array.from(generalLogs.battleDetail.entries()).map(([id, log]) => (
                    <div
                      key={id}
                      className="mb-2 pb-2 border-b border-white/5 last:border-0 last:mb-0 last:pb-0"
                      dangerouslySetInnerHTML={{ __html: log }}
                    />
                  ))}
                  {generalLogs.battleDetail.size === 0 && (
                    <div className="text-muted-foreground text-center py-8">기록이 없습니다</div>
                  )}
                </div>
              </div>

              {/* Battle Result Section */}
              <div>
                <div className="section_title mb-2 text-primary">전투 결과</div>
                <div className="glass p-4 text-sm border border-white/10 rounded-lg max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent shadow-inner">
                  {Array.from(generalLogs.battleResult.entries()).map(([id, log]) => (
                    <div
                      key={id}
                      className="mb-2 pb-2 border-b border-white/5 last:border-0 last:mb-0 last:pb-0"
                      dangerouslySetInnerHTML={{ __html: log }}
                    />
                  ))}
                  {generalLogs.battleResult.size === 0 && (
                    <div className="text-muted-foreground text-center py-8">기록이 없습니다</div>
                  )}
                </div>
              </div>

              {/* General Action Section (only if has content) */}
              {generalLogs.generalAction.size > 0 && (
                <div>
                  <div className="section_title mb-2 text-primary">개인 기록</div>
                  <div className="glass p-4 text-sm border border-white/10 rounded-lg max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent shadow-inner">
                    {Array.from(generalLogs.generalAction.entries()).map(([id, log]) => (
                      <div
                        key={id}
                        className="mb-2 pb-2 border-b border-white/5 last:border-0 last:mb-0 last:pb-0"
                        dangerouslySetInnerHTML={{ __html: log }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-40 glass rounded-xl border-dashed border-2 border-white/10">
            {nationId === 0 ? "소속 국가가 없습니다." : "장수를 선택해주세요"}
          </div>
        )}
      </div>
    </div>
  );
}
