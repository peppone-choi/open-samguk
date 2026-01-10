"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { TopBackBar } from "@/components/game";
import { Button } from "@/components/ui/button";
import { trpc } from "@/utils/trpc";
import { cn } from "@/lib/utils";
import {
  User,
  Shield,
  Zap,
  BookOpen,
  Crown,
  Dna,
  MapPin,
  Clock,
  Lock,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

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

export interface CityInfo {
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

const MOCK_TURN_TERM = 60;

export default function JoinPage() {
  const router = useRouter();

  const { data: userData } = trpc.auth.session.useQuery();
  const { data: rawNations } = trpc.getNations.useQuery();
  const { data: cityData } = trpc.getAllCities.useQuery();
  const { data: gameConst } = trpc.getGameConst.useQuery();
  const userId = (userData as Record<string, unknown>)?.memberId as number | undefined;
  const { data: inheritPoints } = trpc.getInheritPoints.useQuery(
    { userId: userId ?? 0 },
    { enabled: !!userId }
  );

  const blockCustomGeneralName = (gameConst as any)?.consts?.blockCustomGeneralName ?? false;

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
      grade: userData?.grade ?? 1,
      picture: "default.jpg",
      imgsvr: 0,
    }),
    [userData]
  );

  const stats = useMemo<Stats>(() => {
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
    return (c.availablePersonalities || {}) as Record<string, GameIActionInfo>;
  }, [gameConst]);

  const availableInheritSpecial = useMemo(() => {
    const c = (gameConst as any)?.consts || {};
    return (c.availableInheritSpecials || {}) as Record<string, GameIActionInfo>;
  }, [gameConst]);

  const availableInheritCity = useMemo(() => {
    if (!cityData?.cities) return [];
    return cityData.cities.map((c: any) => ({
      id: c.city,
      name: c.name,
      region: c.region,
    }));
  }, [cityData]);

  const inheritTotalPoint = inheritPoints?.points ?? 0;

  const [selectedNation, setSelectedNation] = useState<number>(0);

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

  const [displayTable, setDisplayTable] = useState<boolean>(true);
  const [displayInherit, setDisplayInherit] = useState<boolean>(true);

  const [inheritCity, setInheritCity] = useState<number | undefined>(undefined);
  const [inheritTurnTimeZone, setInheritTurnTimeZone] = useState<number | undefined>(undefined);

  const turnterm = useMemo(() => {
    const c = (gameConst as any)?.consts || {};
    return c.turnTerm ?? MOCK_TURN_TERM;
  }, [gameConst]);

  useEffect(() => {
    setArgs((prev) => ({ ...prev, inheritCity }));
  }, [inheritCity]);

  useEffect(() => {
    setArgs((prev) => ({ ...prev, inheritTurntimeZone: inheritTurnTimeZone }));
  }, [inheritTurnTimeZone]);

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

  const iconPath = useMemo(() => {
    if (args.pic) {
      return getIconPath(member.imgsvr, member.picture);
    }
    return getIconPath(0, "default.jpg");
  }, [args.pic, member.imgsvr, member.picture]);

  const inheritRequiredPoint = useMemo(() => {
    let required = 0;
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
        router.push("/game");
      } else {
        alert(`생성 실패: ${result.error}`);
      }
    } catch (e: any) {
      console.error(e);
      alert(`실패했습니다: ${e.message || e}`);
    }
  }, [args, stats.total, router, createGeneralMutation, member.picture, selectedNation]);

  const updateStat = useCallback((field: "leadership" | "strength" | "intel", value: number) => {
    setArgs((prev) => ({ ...prev, [field]: value }));
  }, []);

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
    <div className="min-h-screen bg-background pb-20">
      <TopBackBar title="장수 생성" type="gateway" />

      <main className="container mx-auto px-4 max-w-5xl py-8 space-y-8">
        <div className="text-center space-y-2 mb-10">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-primary to-primary/60">
            Create Your General
          </h1>
          <p className="text-muted-foreground">
            삼국지 모의전투의 세계에 오신 것을 환영합니다. 당신의 분신이 될 장수를 생성해주세요.
          </p>
        </div>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Crown className="w-6 h-6 text-primary" />
              <span className="text-foreground">소속 국가 선택</span>
            </h2>
            <div className="flex items-center gap-2">
              <Button
                variant={displayTable ? "default" : "outline"}
                size="sm"
                onClick={() => setDisplayTable(!displayTable)}
                className="h-8"
              >
                {displayTable ? "국가 목록 숨기기" : "국가 목록 보기"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              onClick={() => setSelectedNation(0)}
              className={cn(
                "cursor-pointer transition-all duration-300 relative overflow-hidden group rounded-xl border",
                selectedNation === 0
                  ? "bg-primary/10 border-primary shadow-glow-sm ring-1 ring-primary"
                  : "bg-card/40 border-white/10 hover:bg-card/60 hover:border-primary/50"
              )}
            >
              <div className="p-5 flex flex-col h-full gap-3">
                <div className="flex justify-between items-start">
                  <div className="bg-zinc-800 text-white px-3 py-1 rounded text-sm font-bold">
                    재야
                  </div>
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full border flex items-center justify-center",
                      selectedNation === 0 ? "border-primary bg-primary" : "border-white/20"
                    )}
                  >
                    {selectedNation === 0 && <div className="w-2 h-2 rounded-full bg-black" />}
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground">
                    특정 국가에 소속되지 않고 자유롭게 시작합니다.
                  </p>
                </div>
              </div>
            </div>

            {displayTable &&
              nationList.map((nation) => (
                <div
                  key={nation.nation}
                  onClick={() => setSelectedNation(nation.nation)}
                  className={cn(
                    "cursor-pointer transition-all duration-300 relative overflow-hidden group rounded-xl border",
                    selectedNation === nation.nation
                      ? "bg-primary/5 border-primary shadow-glow-sm ring-1 ring-primary"
                      : "bg-card/40 border-white/10 hover:bg-card/60 hover:border-primary/50"
                  )}
                >
                  <div className="p-5 flex flex-col h-full gap-3">
                    <div className="flex justify-between items-start">
                      <div
                        className="px-3 py-1 rounded text-sm font-bold shadow-sm"
                        style={{
                          backgroundColor: nation.color,
                          color: isBrightColor(nation.color) ? "black" : "white",
                        }}
                      >
                        {nation.name}
                      </div>
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
                          selectedNation === nation.nation
                            ? "border-primary bg-primary"
                            : "border-white/20"
                        )}
                      >
                        {selectedNation === nation.nation && (
                          <div className="w-2 h-2 rounded-full bg-black" />
                        )}
                      </div>
                    </div>

                    <div className="mt-2 relative">
                      <div className="text-xs text-muted-foreground/80 overflow-hidden transition-all duration-300 max-h-[150px]">
                        <div dangerouslySetInnerHTML={{ __html: nation.scoutmsg ?? "-" }} />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-card/90 to-transparent pointer-events-none" />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <User className="w-6 h-6 text-primary" />
            <span className="text-foreground">기본 정보</span>
          </h2>

          <div className="glass rounded-xl p-6 md:p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  장수명
                </label>
                {!blockCustomGeneralName ? (
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-lg focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-white/10"
                      placeholder="장수 이름을 입력하세요"
                      value={args.name}
                      onChange={(e) => setArgs((prev) => ({ ...prev, name: e.target.value }))}
                    />
                    <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                  </div>
                ) : (
                  <div className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-lg text-muted-foreground flex items-center gap-2">
                    <Lock className="w-4 h-4" /> 무작위 (서버 설정)
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  * 다른 유저에게 불쾌감을 주는 이름은 제재될 수 있습니다.
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  성격
                </label>
                <div className="space-y-2">
                  <div className="relative">
                    <select
                      className="w-full appearance-none bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-lg focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all cursor-pointer"
                      value={args.character}
                      onChange={(e) => setArgs((prev) => ({ ...prev, character: e.target.value }))}
                    >
                      {Object.entries(availablePersonality).map(([key, p]) => (
                        <option key={key} value={key} className="bg-zinc-900">
                          {p.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 pointer-events-none" />
                  </div>
                  <div className="bg-primary/5 border border-primary/20 rounded-md p-3">
                    <p className="text-sm text-primary/80">
                      <span className="font-bold mr-2">특성:</span>
                      {availablePersonality[args.character]?.info}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-px bg-white/5" />

            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-full md:w-auto flex-shrink-0 flex justify-center">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-xl overflow-hidden border-2 border-white/10 group-hover:border-primary/50 transition-all shadow-2xl">
                    <img
                      src={iconPath}
                      alt="Icon"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/d_pic/icons/default.jpg";
                      }}
                    />
                  </div>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-zinc-900 border border-white/20 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                    {member.name}
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">전용 아이콘 사용</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    개인 설정에서 등록한 전용 아이콘을 사용합니다. 체크 해제 시 기본 이미지가
                    사용됩니다.
                  </p>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div
                      className={cn(
                        "w-12 h-6 rounded-full transition-colors relative",
                        args.pic ? "bg-primary" : "bg-zinc-700"
                      )}
                    >
                      <div
                        className={cn(
                          "absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-md",
                          args.pic ? "left-7" : "left-1"
                        )}
                      />
                    </div>
                    <input
                      type="checkbox"
                      checked={args.pic}
                      onChange={(e) => setArgs((prev) => ({ ...prev, pic: e.target.checked }))}
                      className="hidden"
                    />
                    <span
                      className={cn(
                        "text-sm font-medium transition-colors",
                        args.pic ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      {args.pic ? "사용함" : "사용안함"}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            <span className="text-foreground">능력치 설정</span>
          </h2>

          <div className="glass rounded-xl p-6 md:p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-black/20 border border-white/5 rounded-xl p-5 hover:border-primary/30 transition-all group">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider group-hover:text-primary transition-colors">
                    통솔 (Leadership)
                  </span>
                  <Shield className="w-5 h-5 text-white/20 group-hover:text-primary transition-colors" />
                </div>
                <div className="flex items-end gap-2 mb-4">
                  <span className="text-4xl font-bold tabular-nums text-foreground">
                    {args.leadership}
                  </span>
                  <span className="text-sm text-muted-foreground mb-1.5">/ {stats.max}</span>
                </div>
                <input
                  type="range"
                  min={stats.min}
                  max={stats.max}
                  value={args.leadership}
                  onChange={(e) => updateStat("leadership", parseInt(e.target.value) || 0)}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary hover:accent-primary-glow"
                />
              </div>

              <div className="bg-black/20 border border-white/5 rounded-xl p-5 hover:border-primary/30 transition-all group">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider group-hover:text-primary transition-colors">
                    무력 (Strength)
                  </span>
                  <Zap className="w-5 h-5 text-white/20 group-hover:text-primary transition-colors" />
                </div>
                <div className="flex items-end gap-2 mb-4">
                  <span className="text-4xl font-bold tabular-nums text-foreground">
                    {args.strength}
                  </span>
                  <span className="text-sm text-muted-foreground mb-1.5">/ {stats.max}</span>
                </div>
                <input
                  type="range"
                  min={stats.min}
                  max={stats.max}
                  value={args.strength}
                  onChange={(e) => updateStat("strength", parseInt(e.target.value) || 0)}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary hover:accent-primary-glow"
                />
              </div>

              <div className="bg-black/20 border border-white/5 rounded-xl p-5 hover:border-primary/30 transition-all group">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider group-hover:text-primary transition-colors">
                    지력 (Intellect)
                  </span>
                  <BookOpen className="w-5 h-5 text-white/20 group-hover:text-primary transition-colors" />
                </div>
                <div className="flex items-end gap-2 mb-4">
                  <span className="text-4xl font-bold tabular-nums text-foreground">
                    {args.intel}
                  </span>
                  <span className="text-sm text-muted-foreground mb-1.5">/ {stats.max}</span>
                </div>
                <input
                  type="range"
                  min={stats.min}
                  max={stats.max}
                  value={args.intel}
                  onChange={(e) => updateStat("intel", parseInt(e.target.value) || 0)}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary hover:accent-primary-glow"
                />
              </div>
            </div>

            <div className="bg-primary/5 rounded-lg p-4 border border-primary/10 flex flex-wrap gap-4 items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground uppercase">총합</span>
                  <span
                    className={cn(
                      "text-2xl font-bold tabular-nums",
                      args.leadership + args.strength + args.intel === stats.total
                        ? "text-primary"
                        : "text-orange-400"
                    )}
                  >
                    {args.leadership + args.strength + args.intel}
                  </span>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div className="text-sm text-muted-foreground">
                  목표 총합: <span className="text-white font-medium">{stats.total}</span>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRandStatRandom}
                  className="gap-2"
                >
                  <RefreshCw className="w-3 h-3" /> 랜덤
                </Button>
                <Button variant="outline" size="sm" onClick={handleRandStatLeadPow}>
                  통솔+무력
                </Button>
                <Button variant="outline" size="sm" onClick={handleRandStatLeadInt}>
                  통솔+지력
                </Button>
                <Button variant="outline" size="sm" onClick={handleRandStatPowInt}>
                  무력+지력
                </Button>
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              * 가입 후 {stats.bonusMin} ~ {stats.bonusMax}의 추가 보너스를 획득합니다.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setDisplayInherit(!displayInherit)}
          >
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Dna className="w-6 h-6 text-primary" />
              <span className="text-foreground">유산 포인트 (선택)</span>
            </h2>
            <div className="p-2 rounded-full hover:bg-white/5 transition-colors">
              {displayInherit ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </div>
          </div>

          {displayInherit && (
            <div className="glass rounded-xl p-6 md:p-8 space-y-8 animate-in slide-in-from-top-4 duration-300">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center">
                  <span className="text-sm text-muted-foreground mb-1">보유 포인트</span>
                  <span className="text-3xl font-bold text-white">{inheritTotalPoint}</span>
                </div>
                <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center">
                  <span className="text-sm text-muted-foreground mb-1">필요 포인트</span>
                  <span
                    className={cn(
                      "text-3xl font-bold",
                      inheritRequiredPoint > inheritTotalPoint ? "text-red-500" : "text-primary"
                    )}
                  >
                    {inheritRequiredPoint}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Crown className="w-4 h-4 text-primary" /> 특별 캐릭터
                  </label>
                  <select
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-all"
                    value={args.inheritSpecial ?? ""}
                    onChange={(e) =>
                      setArgs((prev) => ({ ...prev, inheritSpecial: e.target.value || undefined }))
                    }
                  >
                    <option value="">사용안함</option>
                    {Object.entries(availableInheritSpecial).map(([key, special]) => (
                      <option key={key} value={key}>
                        {special.name}
                      </option>
                    ))}
                  </select>
                  {args.inheritSpecial && (
                    <div
                      className="text-xs text-primary/80 bg-primary/5 p-2 rounded border border-primary/10"
                      dangerouslySetInnerHTML={{
                        __html: availableInheritSpecial[args.inheritSpecial]?.info ?? "",
                      }}
                    />
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" /> 시작 도시
                  </label>
                  <select
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-all"
                    value={inheritCity ?? ""}
                    onChange={(e) =>
                      setInheritCity(e.target.value ? parseInt(e.target.value) : undefined)
                    }
                  >
                    <option value="">랜덤 (사용안함)</option>
                    {availableInheritCity.map((city) => (
                      <option key={city.id} value={city.id}>
                        [{city.region}] {city.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" /> 턴 시간 지정
                  </label>
                  <select
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-all"
                    value={inheritTurnTimeZone ?? ""}
                    onChange={(e) =>
                      setInheritTurnTimeZone(e.target.value ? parseInt(e.target.value) : undefined)
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

                <div className="space-y-3">
                  <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" /> 추가 능력치 (Max {stats.bonusMax})
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["통솔", "무력", "지력"].map((label, idx) => (
                      <div key={label} className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-bold">
                          {label}
                        </span>
                        <input
                          type="number"
                          className="w-full bg-black/20 border border-white/10 rounded-lg pl-10 pr-2 py-3 text-center text-sm focus:outline-none focus:border-primary/50 transition-all"
                          value={args.inheritBonusStat[idx]}
                          min={0}
                          max={stats.bonusMax}
                          onChange={(e) =>
                            updateInheritBonusStat(idx, parseInt(e.target.value) || 0)
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        <div className="flex justify-center gap-4 pt-6">
          <Button
            className="w-40 h-12 text-lg font-bold shadow-glow-sm hover:shadow-glow transition-all"
            onClick={handleSubmit}
            disabled={inheritRequiredPoint > inheritTotalPoint}
          >
            장수 생성
          </Button>
          <Button
            variant="outline"
            className="w-40 h-12 text-lg border-white/10 hover:bg-white/5 hover:border-white/20"
            onClick={handleReset}
          >
            초기화
          </Button>
        </div>

        {inheritRequiredPoint > inheritTotalPoint && (
          <p className="text-center text-red-400 text-sm animate-pulse">
            유산 포인트가 부족하여 생성할 수 없습니다.
          </p>
        )}
      </main>
    </div>
  );
}
