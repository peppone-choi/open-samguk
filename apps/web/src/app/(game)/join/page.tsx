"use client";

/**
 * PageJoin - 장수 생성 페이지
 * Ported from legacy/hwe/ts/PageJoin.vue
 *
 * Features:
 * - Nation list with scout messages (임관권유문)
 * - General name input (or random if blocked)
 * - User icon toggle (전콘 사용)
 * - Personality (성격) selection
 * - Stats input (통솔/무력/지력) with preset buttons
 * - Inherit points section (유산 포인트)
 */

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { TopBackBar } from "@/components/game";
import { Button } from "@/components/ui/button";
import { trpc } from "@/utils/trpc";

// ============================================================================
// Types
// ============================================================================

interface NationInfo {
  nation: number;
  name: string;
  color: string;
  scout: number;
  scoutmsg?: string;
}

interface GameIActionInfo {
  value: string;
  name: string;
  info: string;
}

interface CityInfo {
  id: number;
  name: string;
  region: string;
}

interface Stats {
  min: number;
  max: number;
  total: number;
  bonusMin: number;
  bonusMax: number;
}

interface JoinArgs {
  name: string;
  leadership: number;
  strength: number;
  intel: number;
  pic: boolean;
  character: string;
  inheritCity?: number;
  inheritBonusStat: [number, number, number];
  inheritSpecial?: string;
  inheritTurntimeZone?: number;
}

interface MemberInfo {
  name: string;
  grade: number;
  picture: string;
  imgsvr: 0 | 1;
}

// ============================================================================
// Utility Functions
// ============================================================================

function isBrightColor(color: string): boolean {
  const hex = color.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return r * 0.299 + g * 0.587 + b * 0.114 > 140;
}

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function getIconPath(imgsvr: 0 | 1, picture: string): string {
  if (imgsvr === 1) {
    return `/d_pic/icons/${picture}`;
  }
  return `/d_pic/icons/${picture}`;
}

// Stat generation utilities (from legacy/hwe/ts/util/generalStats.ts)
function abilityRand(stats: Stats): [number, number, number] {
  let leadership = Math.random() * 65 + 10;
  let strength = Math.random() * 65 + 10;
  let intel = Math.random() * 65 + 10;
  const rate = leadership + strength + intel;

  leadership = Math.floor((leadership / rate) * stats.total);
  strength = Math.floor((strength / rate) * stats.total);
  intel = Math.floor((intel / rate) * stats.total);

  while (leadership + strength + intel < stats.total) {
    leadership += 1;
  }

  if (
    leadership > stats.max ||
    strength > stats.max ||
    intel > stats.max ||
    leadership < stats.min ||
    strength < stats.min ||
    intel < stats.min
  ) {
    return abilityRand(stats);
  }

  return [leadership, strength, intel];
}

function abilityLeadpow(stats: Stats): [number, number, number] {
  let leadership = Math.random() * 6;
  let strength = Math.random() * 6;
  let intel = Math.random() * 1;
  const rate = leadership + strength + intel;

  leadership = Math.floor((leadership / rate) * stats.total);
  strength = Math.floor((strength / rate) * stats.total);
  intel = Math.floor((intel / rate) * stats.total);

  while (leadership + strength + intel < stats.total) {
    strength += 1;
  }

  if (intel < stats.min) {
    leadership -= stats.min - intel;
    intel = stats.min;
  }
  if (leadership > stats.max) {
    strength += leadership - stats.max;
    leadership = stats.max;
  }
  if (strength > stats.max) {
    leadership += strength - stats.max;
    strength = stats.max;
  }
  if (leadership > stats.max) {
    intel += leadership - stats.max;
    leadership = stats.max;
  }

  return [leadership, strength, intel];
}

function abilityLeadint(stats: Stats): [number, number, number] {
  let leadership = Math.random() * 6;
  let strength = Math.random() * 1;
  let intel = Math.random() * 6;
  const rate = leadership + strength + intel;

  leadership = Math.floor((leadership / rate) * stats.total);
  strength = Math.floor((strength / rate) * stats.total);
  intel = Math.floor((intel / rate) * stats.total);

  while (leadership + strength + intel < stats.total) {
    intel += 1;
  }

  if (strength < stats.min) {
    leadership -= stats.min - strength;
    strength = stats.min;
  }
  if (leadership > stats.max) {
    intel += leadership - stats.max;
    leadership = stats.max;
  }
  if (intel > stats.max) {
    leadership += intel - stats.max;
    intel = stats.max;
  }
  if (leadership > stats.max) {
    strength += leadership - stats.max;
    leadership = stats.max;
  }

  return [leadership, strength, intel];
}

function abilityPowint(stats: Stats): [number, number, number] {
  let leadership = Math.random() * 1;
  let strength = Math.random() * 6;
  let intel = Math.random() * 6;
  const rate = leadership + strength + intel;

  leadership = Math.floor((leadership / rate) * stats.total);
  strength = Math.floor((strength / rate) * stats.total);
  intel = Math.floor((intel / rate) * stats.total);

  while (leadership + strength + intel < stats.total) {
    intel += 1;
  }

  if (leadership < stats.min) {
    strength -= stats.min - leadership;
    leadership = stats.min;
  }
  if (strength > stats.max) {
    intel += strength - stats.max;
    strength = stats.max;
  }
  if (intel > stats.max) {
    strength += intel - stats.max;
    intel = stats.max;
  }
  if (strength > stats.max) {
    leadership += strength - stats.max;
    strength = stats.max;
  }

  return [leadership, strength, intel];
}

// ============================================================================
// Mock Data (TODO: Replace with actual tRPC queries)
// ============================================================================

const MOCK_NATIONS: NationInfo[] = [
  {
    nation: 1,
    name: "위",
    color: "#0066CC",
    scout: 1,
    scoutmsg: "<b>위나라</b>에 오신 것을 환영합니다!<br/>강력한 기병대와 함께하세요.",
  },
  {
    nation: 2,
    name: "촉",
    color: "#CC0000",
    scout: 1,
    scoutmsg: "<b>촉나라</b>의 의로운 깃발 아래 모이십시오!<br/>인덕으로 천하를 평정합니다.",
  },
  {
    nation: 3,
    name: "오",
    color: "#00AA00",
    scout: 1,
    scoutmsg: "<b>오나라</b>의 수군과 함께 강동을 지키세요!<br/>풍요로운 강남의 땅입니다.",
  },
];

const MOCK_MEMBER: MemberInfo = {
  name: "플레이어",
  grade: 1,
  picture: "default.jpg",
  imgsvr: 0,
};

const MOCK_STATS: Stats = {
  min: 10,
  max: 100,
  total: 180,
  bonusMin: 1,
  bonusMax: 5,
};

const MOCK_PERSONALITIES: Record<string, GameIActionInfo> = {
  Random: { value: "Random", name: "???", info: "무작위 성격을 선택합니다." },
  Cool: { value: "Cool", name: "냉정", info: "냉정하고 침착한 성격입니다." },
  Brave: { value: "Brave", name: "용맹", info: "용맹하고 대담한 성격입니다." },
  Wise: { value: "Wise", name: "지혜", info: "지혜롭고 신중한 성격입니다." },
  Noble: { value: "Noble", name: "인덕", info: "인덕이 있는 성격입니다." },
};

const MOCK_INHERIT_SPECIALS: Record<string, GameIActionInfo> = {
  SpecialWar1: {
    value: "SpecialWar1",
    name: "기병의 달인",
    info: "기병 전투에서 큰 보너스를 받습니다.",
  },
  SpecialWar2: {
    value: "SpecialWar2",
    name: "궁병의 달인",
    info: "궁병 전투에서 큰 보너스를 받습니다.",
  },
};

const MOCK_CITIES: CityInfo[] = [
  { id: 1, name: "낙양", region: "사예" },
  { id: 2, name: "장안", region: "옹주" },
  { id: 3, name: "업", region: "기주" },
  { id: 4, name: "성도", region: "익주" },
  { id: 5, name: "건업", region: "양주" },
];

const MOCK_TURN_TERM = 60; // seconds

// ============================================================================
// Component
// ============================================================================

export default function JoinPage() {
  const router = useRouter();

  // Queries
  const { data: userData } = trpc.me.useQuery();
  const { data: rawNations } = trpc.getNations.useQuery();
  const { data: cityData } = trpc.getAllCities.useQuery();
  const { data: gameConst } = trpc.getGameConst.useQuery();
  const { data: inheritPoints } = trpc.getInheritPoints.useQuery(
    { userId: userData?.id ?? 0 },
    { enabled: !!userData?.id }
  );

  const nationList = useMemo(() => {
    if (!rawNations) return [];
    const list: NationInfo[] = (rawNations as any).map((n: any) => ({
      nation: n.nation,
      name: n.name,
      color: n.color,
      scout: n.scout ? 0 : 1,
      scoutmsg: n.scoutMsg,
    }));
    return shuffle(list);
  }, [rawNations]);

  const member = useMemo<MemberInfo>(
    () => ({
      name: userData?.name ?? "플레이어",
      grade: 1,
      picture: userData?.picture ?? "default.jpg",
      imgsvr: 0,
    }),
    [userData]
  );

  const stats = useMemo<Stats>(() => {
    // defaults from general.service.ts if gameConst not available
    const c = (gameConst as any)?.consts || {};
    return {
      min: c.statMin ?? 10,
      max: c.statMax ?? 100,
      total: c.statTotal ?? 180,
      bonusMin: c.statBonusMin ?? 1,
      bonusMax: c.statBonusMax ?? 5,
    };
  }, [gameConst]);

  const availablePersonality = useMemo(() => {
    const c = (gameConst as any)?.consts || {};
    return c.availablePersonalities || MOCK_PERSONALITIES;
  }, [gameConst]);

  const availableInheritSpecial = useMemo(() => {
    const c = (gameConst as any)?.consts || {};
    return c.availableInheritSpecials || MOCK_INHERIT_SPECIALS;
  }, [gameConst]);

  const availableInheritCity = useMemo(() => {
    if (!cityData?.cities) return [];
    return cityData.cities.map((c: any) => ({
      id: c.city,
      name: c.name,
      region: c.region, // Assuming numeric or mapped name
    }));
  }, [cityData]);

  const inheritTotalPoint = inheritPoints?.points ?? 0;

  const [selectedNation, setSelectedNation] = useState<number>(0);

  // Form State
  const [args, setArgs] = useState<JoinArgs>({
    name: "",
    leadership: 60,
    strength: 60,
    intel: 60,
    pic: true,
    character: "Random",
    inheritCity: undefined,
    inheritBonusStat: [0, 0, 0],
    inheritSpecial: undefined,
    inheritTurntimeZone: undefined,
  });

  // Sync initial name and stats when data loaded
  useEffect(() => {
    if (userData && args.name === "") {
      setArgs((prev) => ({ ...prev, name: userData.name }));
    }
  }, [userData, args.name]);

  useEffect(() => {
    if (stats.total > 0 && args.leadership === 60 && args.strength === 60 && args.intel === 60) {
      const perStat = Math.floor(stats.total / 3);
      setArgs((prev) => ({
        ...prev,
        leadership: stats.total - 2 * perStat,
        strength: perStat,
        intel: perStat,
      }));
    }
  }, [stats.total, args.leadership, args.strength, args.intel]);

  // UI State
  const [displayTable, setDisplayTable] = useState<boolean>(true);
  const [toggleZoom, setToggleZoom] = useState(true);

  const [displayInherit, setDisplayInherit] = useState<boolean>(true);

  const [inheritCity, setInheritCity] = useState<number | undefined>(undefined);
  const [inheritTurnTimeZone, setInheritTurnTimeZone] = useState<number | undefined>(undefined);

  const turnterm = useMemo(() => {
    const c = (gameConst as any)?.consts || {};
    return c.turnTerm ?? MOCK_TURN_TERM;
  }, [gameConst]);

  // Sync inheritCity with args
  useEffect(() => {
    setArgs((prev) => ({ ...prev, inheritCity }));
  }, [inheritCity]);

  // Sync inheritTurnTimeZone with args
  useEffect(() => {
    setArgs((prev) => ({ ...prev, inheritTurntimeZone: inheritTurnTimeZone }));
  }, [inheritTurnTimeZone]);

  // Turn time zone list
  const turnTimeZoneList = useMemo(() => {
    const result: string[] = [];
    const zoneSec = turnterm;
    let zoneCur = 0;

    for (let idx = 0; idx < 60; idx++) {
      const zoneNext = zoneCur + zoneSec;

      const zoneCurMin = Math.floor(zoneCur / 60);
      const zoneCurSec = zoneCur % 60;
      const zoneCurText = `${zoneCurMin.toString().padStart(2, "0")}:${zoneCurSec.toString().padStart(2, "0")}.000`;

      const zoneCurEnd = zoneCur + zoneSec - 1;
      const zoneCurEndMin = Math.floor(zoneCurEnd / 60);
      const zoneCurEndSec = zoneCurEnd % 60;
      const zoneCurEndText = `${zoneCurEndMin.toString().padStart(2, "0")}:${zoneCurEndSec.toString().padStart(2, "0")}.999`;

      const zoneStr = `${zoneCurText} ~ ${zoneCurEndText}`;
      result.push(zoneStr);
      zoneCur = zoneNext;
    }
    return result;
  }, [turnterm]);

  // Icon path
  const iconPath = useMemo(() => {
    if (args.pic) {
      return getIconPath(member.imgsvr, member.picture);
    }
    return getIconPath(0, "default.jpg");
  }, [args.pic, member.imgsvr, member.picture]);

  // Required inherit points
  const inheritRequiredPoint = useMemo(() => {
    let required = 0;
    // Mock point costs
    const inheritBornCityPoint = 10;
    const inheritBornSpecialPoint = 50;
    const inheritBornTurntimePoint = 5;
    const inheritBornStatPoint = 20;

    if (args.inheritCity !== undefined) {
      required += inheritBornCityPoint;
    }
    if (args.inheritSpecial !== undefined) {
      required += inheritBornSpecialPoint;
    }
    if (args.inheritTurntimeZone !== undefined) {
      required += inheritBornTurntimePoint;
    }
    const bonusSum = args.inheritBonusStat.reduce((a, b) => a + b, 0);
    if (bonusSum !== 0) {
      required += inheritBornStatPoint;
    }
    return required;
  }, [args]);

  // Stat preset handlers
  const handleRandStatRandom = useCallback(() => {
    const [l, s, i] = abilityRand(stats);
    setArgs((prev) => ({ ...prev, leadership: l, strength: s, intel: i }));
  }, [stats]);

  const handleRandStatLeadPow = useCallback(() => {
    const [l, s, i] = abilityLeadpow(stats);
    setArgs((prev) => ({ ...prev, leadership: l, strength: s, intel: i }));
  }, [stats]);

  const handleRandStatLeadInt = useCallback(() => {
    const [l, s, i] = abilityLeadint(stats);
    setArgs((prev) => ({ ...prev, leadership: l, strength: s, intel: i }));
  }, [stats]);

  const handleRandStatPowInt = useCallback(() => {
    const [l, s, i] = abilityPowint(stats);
    setArgs((prev) => ({ ...prev, leadership: l, strength: s, intel: i }));
  }, [stats]);

  // Reset form
  const handleReset = useCallback(() => {
    const defaultTotal = stats.total;
    setArgs((prev) => ({
      ...prev,
      name: member.name,
      pic: true,
      character: "Random",
      leadership: defaultTotal - 2 * Math.floor(defaultTotal / 3),
      strength: Math.floor(defaultTotal / 3),
      intel: Math.floor(defaultTotal / 3),
    }));
  }, [stats.total, member.name]);

  const createGeneralMutation = trpc.createGeneral.useMutation();

  // Submit form
  const handleSubmit = useCallback(async () => {
    const totalStat = args.leadership + args.strength + args.intel;
    const defaultStatTotal = stats.total;

    if (totalStat < defaultStatTotal) {
      const confirmed = window.confirm(
        `설정한 능력치가 ${totalStat}으로, 실제 최대치인 ${defaultStatTotal}보다 적습니다.\r\n그래도 진행할까요?`
      );
      if (!confirmed) return;
    }

    try {
      const result = await createGeneralMutation.mutateAsync({
        name: args.name,
        picture: args.pic ? member.picture : "default.jpg",
        nationId: selectedNation,
        leadership: args.leadership,
        strength: args.strength,
        intel: args.intel,
        startAge: 20,
        personal: args.character === "Random" ? undefined : args.character,
        inheritCity: args.inheritCity,
        inheritBonusStat: args.inheritBonusStat,
        inheritSpecial: args.inheritSpecial,
        inheritTurntimeZone: args.inheritTurntimeZone,
      });

      if (result.success) {
        alert("정상적으로 생성되었습니다. \n위키와 팁/강좌 게시판을 꼭 읽어보세요!");
        router.push("/");
      } else {
        alert(`생성 실패: ${result.error}`);
      }
    } catch (e: any) {
      console.error(e);
      alert(`실패했습니다: ${e.message || e}`);
    }
  }, [args, stats.total, router, createGeneralMutation, member.picture, selectedNation]);

  // Update stat handler
  const updateStat = useCallback((field: "leadership" | "strength" | "intel", value: number) => {
    setArgs((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Update inherit bonus stat
  const updateInheritBonusStat = useCallback(
    (index: number, value: number) => {
      setArgs((prev) => {
        const newBonusStat = [...prev.inheritBonusStat] as [number, number, number];
        newBonusStat[index] = Math.max(0, Math.min(stats.bonusMax, value));
        return { ...prev, inheritBonusStat: newBonusStat };
      });
    },
    [stats.bonusMax]
  );

  return (
    <>
      <TopBackBar title="장수 생성" type="gateway" />

      <div className="bg0 w-full max-w-[1000px] mx-auto border border-gray-600 overflow-hidden">
        {/* Nation List Section */}
        <div className="nation-list">
          {/* Header Row */}
          <div className="bg1 grid grid-cols-[130px_1fr] sm:grid-cols-[3fr_1fr_1fr] sm:grid-rows-2 lg:grid-cols-[130px_1fr_90px_90px] lg:grid-rows-1 items-center text-center border-b border-gray-600">
            <div className="p-2 hidden lg:block">국가명</div>
            <div className="p-2 hidden lg:block">임관권유문</div>
            <div className="p-2 col-span-2 sm:col-span-1 sm:row-span-2 lg:col-span-1 lg:row-span-1">
              <Button
                variant={displayTable ? "default" : "secondary"}
                size="sm"
                className="w-full"
                onClick={() => setDisplayTable(!displayTable)}
              >
                {displayTable ? "숨기기" : "보이기"}
              </Button>
            </div>
            <div className="p-2 hidden sm:block sm:row-span-2 lg:row-span-1">
              <Button
                variant={toggleZoom ? "default" : "secondary"}
                size="sm"
                className="w-full lg:hidden"
                disabled={!displayTable}
                onClick={() => setToggleZoom(!toggleZoom)}
              >
                {toggleZoom ? "작게 보기" : "크게 보기"}
              </Button>
            </div>
          </div>

          {/* Nation Rows */}
          <div
            className={`grid border-b border-gray-700 cursor-pointer ${selectedNation === 0 ? "bg-zinc-800" : ""}`}
            onClick={() => setSelectedNation(0)}
          >
            <div className="flex items-center gap-4 p-3">
              <input
                type="radio"
                name="selectedNation"
                checked={selectedNation === 0}
                onChange={() => setSelectedNation(0)}
              />
              <div className="flex items-center justify-center w-32 h-10 text-lg font-semibold bg-gray-600 text-white">
                재야
              </div>
              <div className="text-sm">특정 국가에 소속되지 않고 자유롭게 시작합니다.</div>
            </div>
          </div>

          {displayTable &&
            nationList.map((nation) => (
              <div
                key={nation.nation}
                className={`grid border-b border-gray-700 cursor-pointer ${
                  selectedNation === nation.nation ? "bg-zinc-800" : ""
                } ${
                  toggleZoom
                    ? "grid-rows-[auto_minmax(0,200px)]"
                    : "grid-rows-[auto_minmax(0,115px)]"
                } lg:grid-cols-[130px_1fr] lg:grid-rows-1`}
                onClick={() => setSelectedNation(nation.nation)}
              >
                {/* Nation Name */}
                <div
                  className="flex flex-col items-center justify-center p-3 gap-2"
                  style={{
                    backgroundColor: nation.color,
                    color: isBrightColor(nation.color) ? "black" : "white",
                  }}
                >
                  <input
                    type="radio"
                    name="selectedNation"
                    checked={selectedNation === nation.nation}
                    onChange={() => setSelectedNation(nation.nation)}
                  />
                  <div className="text-lg font-semibold">{nation.name}</div>
                </div>

                {/* Scout Message */}
                <div
                  className={`p-2 overflow-hidden ${
                    toggleZoom ? "overflow-y-auto max-h-[200px]" : "max-h-[115px]"
                  } lg:max-h-none lg:overflow-visible`}
                >
                  <div
                    className={`${
                      !toggleZoom
                        ? "origin-top-left scale-[0.575] w-[870px] sm:scale-100 sm:w-auto"
                        : ""
                    }`}
                    dangerouslySetInnerHTML={{
                      __html: nation.scoutmsg ?? "-",
                    }}
                  />
                </div>
              </div>
            ))}
        </div>

        {/* Section Header */}
        <div className="bg1 text-center p-2 border-t border-gray-600">장수 생성</div>

        {/* Form */}
        <div className="px-1.5 py-2 space-y-3">
          {/* Row 1: Name, Icon, Personality */}
          <div className="grid grid-cols-12 gap-2 items-center">
            {/* Name */}
            <div className="col-span-3 lg:col-span-4 text-right text-sm">장수명</div>
            <div className="col-span-9 lg:col-span-3">
              {!blockCustomGeneralName ? (
                <input
                  type="text"
                  className="w-full px-2 py-1 bg-zinc-800 border border-gray-600 rounded text-white text-sm"
                  value={args.name}
                  onChange={(e) => setArgs((prev) => ({ ...prev, name: e.target.value }))}
                />
              ) : (
                <span className="text-gray-400">무작위</span>
              )}
            </div>

            {/* Icon */}
            <div className="col-span-3 lg:col-span-1 text-right text-sm">전콘 사용</div>
            <div className="col-span-9 lg:col-span-4 flex items-center gap-2">
              <img
                src={iconPath}
                alt="Icon"
                className="w-16 h-16 border border-gray-600 rounded bg-zinc-900"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/d_pic/icons/default.jpg";
                }}
              />
              <label className="flex items-center gap-1 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={args.pic}
                  onChange={(e) => setArgs((prev) => ({ ...prev, pic: e.target.checked }))}
                  className="w-4 h-4"
                />
                사용
              </label>
            </div>

            {/* Personality */}
            <div className="col-span-3 lg:col-span-4 text-right text-sm">성격</div>
            <div className="col-span-9 lg:col-span-8">
              <div className="flex flex-col lg:flex-row lg:items-center gap-2">
                <select
                  className="px-2 py-1 bg-zinc-800 border border-gray-600 rounded text-white text-sm max-w-[20ch]"
                  value={args.character}
                  onChange={(e) => setArgs((prev) => ({ ...prev, character: e.target.value }))}
                >
                  {Object.entries(availablePersonality).map(([key, p]) => (
                    <option key={key} value={key}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <small className="text-gray-400">
                  {availablePersonality[args.character]?.info}
                </small>
              </div>
            </div>
          </div>

          {/* Row 2: Stats */}
          <div className="grid grid-cols-12 gap-2 items-center mt-4">
            <div className="col-span-3 lg:col-span-4 text-right text-sm">
              능력치
              <br />
              <small className="text-gray-400">통/무/지</small>
            </div>
            <div className="col-span-3 lg:col-span-2">
              <input
                type="number"
                className="w-full px-2 py-1 bg-zinc-800 border border-gray-600 rounded text-white text-sm text-center"
                value={args.leadership}
                onChange={(e) => updateStat("leadership", parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="col-span-3 lg:col-span-2">
              <input
                type="number"
                className="w-full px-2 py-1 bg-zinc-800 border border-gray-600 rounded text-white text-sm text-center"
                value={args.strength}
                onChange={(e) => updateStat("strength", parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="col-span-3 lg:col-span-2">
              <input
                type="number"
                className="w-full px-2 py-1 bg-zinc-800 border border-gray-600 rounded text-white text-sm text-center"
                value={args.intel}
                onChange={(e) => updateStat("intel", parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Row 3: Stat preset buttons */}
          <div className="grid grid-cols-12 gap-2 items-center mt-4">
            <div className="col-span-3 lg:col-span-4 text-right text-sm">능력치 조절</div>
            <div className="col-span-9 lg:col-span-8 flex flex-wrap gap-1">
              <Button
                variant="secondary"
                size="sm"
                className="w-[8em]"
                onClick={handleRandStatRandom}
              >
                랜덤형
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="w-[8em]"
                onClick={handleRandStatLeadPow}
              >
                통솔무력형
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="w-[8em]"
                onClick={handleRandStatLeadInt}
              >
                통솔지력형
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="w-[8em]"
                onClick={handleRandStatPowInt}
              >
                무력지력형
              </Button>
            </div>
          </div>
        </div>

        {/* Stat constraints info */}
        <div className="border-t border-gray-600 p-2 text-center">
          <div className="text-orange-400">
            모든 능력치는 ( {stats.min} &lt;= 능력치 &lt;= {stats.max} ) 사이로 잡으셔야 합니다.
            <br />그 외의 능력치는 가입되지 않습니다.
          </div>
        </div>

        <div className="p-2 text-center text-sm">
          능력치의 총합은 {stats.total} 입니다. 가입후 {stats.bonusMin} ~ {stats.bonusMax} 의 능력치
          보너스를 받게 됩니다.
          <br />
          임의의 도시에서 재야로 시작하며 건국과 임관은 게임 내에서 실행합니다.
        </div>

        {/* Inherit Points Section Header */}
        <div className="bg1 grid grid-cols-12 items-center border-t border-gray-600">
          <div className="col-span-9 lg:col-span-11 text-center p-2">유산 포인트 사용</div>
          <div className="col-span-3 lg:col-span-1 p-2">
            <label className="flex items-center gap-1 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={displayInherit}
                onChange={(e) => setDisplayInherit(e.target.checked)}
                className="w-4 h-4"
              />
              {displayInherit ? "숨기기" : "보이기"}
            </label>
          </div>
        </div>

        {/* Inherit Points Form */}
        {displayInherit && (
          <div className="p-3 space-y-3">
            {/* Point display */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-800 border border-gray-600 rounded p-3">
                <div className="text-xs text-gray-400 mb-1">보유한 유산 포인트</div>
                <div className="text-lg font-semibold">{inheritTotalPoint}</div>
              </div>
              <div className="bg-zinc-800 border border-gray-600 rounded p-3">
                <div className="text-xs text-gray-400 mb-1">필요 유산 포인트</div>
                <div
                  className={`text-lg font-semibold ${
                    inheritRequiredPoint > inheritTotalPoint ? "text-red-400" : ""
                  }`}
                >
                  {inheritRequiredPoint}
                </div>
              </div>
            </div>

            <hr className="border-gray-600" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Inherit Special (천재로 생성) */}
              <div className="p-2">
                <div className="grid grid-cols-2 gap-2 items-center">
                  <div className="text-right text-sm">천재로 생성</div>
                  <div>
                    <select
                      className="w-full px-2 py-1 bg-zinc-800 border border-gray-600 rounded text-white text-sm max-w-[20ch]"
                      value={args.inheritSpecial ?? ""}
                      onChange={(e) =>
                        setArgs((prev) => ({
                          ...prev,
                          inheritSpecial: e.target.value || undefined,
                        }))
                      }
                    >
                      <option value="">사용안함</option>
                      {Object.entries(availableInheritSpecial).map(([key, special]) => (
                        <option key={key} value={key}>
                          {special.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {args.inheritSpecial && (
                  <small
                    className="text-gray-400 block mt-1"
                    dangerouslySetInnerHTML={{
                      __html: availableInheritSpecial[args.inheritSpecial]?.info ?? "",
                    }}
                  />
                )}
              </div>

              {/* Inherit City (도시) */}
              <div className="p-2">
                <div className="grid grid-cols-2 gap-2 items-center">
                  <div className="text-right text-sm">도시</div>
                  <div>
                    <select
                      className="w-full px-2 py-1 bg-zinc-800 border border-gray-600 rounded text-white text-sm max-w-[20ch]"
                      value={inheritCity ?? ""}
                      onChange={(e) =>
                        setInheritCity(e.target.value ? parseInt(e.target.value) : undefined)
                      }
                    >
                      <option value="">사용안함</option>
                      {availableInheritCity.map((city) => (
                        <option key={city.id} value={city.id}>
                          [{city.region}] {city.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Inherit Turn Time Zone (턴 시간 지정) */}
              <div className="p-2">
                <div className="grid grid-cols-2 gap-2 items-center">
                  <div className="text-right text-sm">턴 시간 지정</div>
                  <div>
                    <select
                      className="w-full px-2 py-1 bg-zinc-800 border border-gray-600 rounded text-white text-sm max-w-[24ch]"
                      value={inheritTurnTimeZone ?? ""}
                      onChange={(e) =>
                        setInheritTurnTimeZone(
                          e.target.value ? parseInt(e.target.value) : undefined
                        )
                      }
                    >
                      <option value="">사용안함</option>
                      {turnTimeZoneList.map((zone, idx) => (
                        <option key={idx} value={idx}>
                          {zone}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Inherit Bonus Stat (추가 능력치 고정) */}
              <div className="p-2">
                <div className="grid grid-cols-2 gap-2 items-center">
                  <div className="text-right text-sm">추가 능력치 고정</div>
                  <div className="grid grid-cols-3 gap-1">
                    <input
                      type="number"
                      className="w-full px-1 py-1 bg-zinc-800 border border-gray-600 rounded text-white text-sm text-center"
                      value={args.inheritBonusStat[0]}
                      min={0}
                      max={stats.bonusMax}
                      onChange={(e) => updateInheritBonusStat(0, parseInt(e.target.value) || 0)}
                    />
                    <input
                      type="number"
                      className="w-full px-1 py-1 bg-zinc-800 border border-gray-600 rounded text-white text-sm text-center"
                      value={args.inheritBonusStat[1]}
                      min={0}
                      max={stats.bonusMax}
                      onChange={(e) => updateInheritBonusStat(1, parseInt(e.target.value) || 0)}
                    />
                    <input
                      type="number"
                      className="w-full px-1 py-1 bg-zinc-800 border border-gray-600 rounded text-white text-sm text-center"
                      value={args.inheritBonusStat[2]}
                      min={0}
                      max={stats.bonusMax}
                      onChange={(e) => updateInheritBonusStat(2, parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <small className="text-gray-400 block mt-1 text-right">
                  통/무/지 (최대 {stats.bonusMax})
                </small>
              </div>
            </div>
          </div>
        )}

        {/* Submit buttons */}
        <div className="border-t border-gray-600 p-3 text-center space-x-2">
          <Button variant="default" onClick={handleSubmit}>
            장수 생성
          </Button>
          <Button variant="secondary" onClick={handleReset}>
            다시 입력
          </Button>
        </div>
      </div>
    </>
  );
}
