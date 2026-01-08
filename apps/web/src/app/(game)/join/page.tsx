"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/utils/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectOption } from "@/components/ui/select";

const STAT_SUM_LIMIT = 180;
const STAT_MIN = 10;
const STAT_MAX = 100;
const DEFAULT_STAT = 60;

const SPECIALS = [
  { value: "None", label: "없음" },
  { value: "farming", label: "농업" },
  { value: "commerce", label: "상업" },
  { value: "construction", label: "축성" },
  { value: "defense", label: "수비" },
  { value: "insight", label: "통찰" },
  { value: "invention", label: "발명" },
  { value: "strategy", label: "책략" },
  { value: "benevolence", label: "인덕" },
  { value: "cavalry", label: "기병" },
  { value: "infantry", label: "보병" },
  { value: "archery", label: "궁병" },
  { value: "siege", label: "공성" },
  { value: "charge", label: "돌격" },
  { value: "fury", label: "분노" },
  { value: "medicine", label: "의술" },
];

const PICTURES = [
  "default_m_01",
  "default_m_02",
  "default_m_03",
  "default_m_04",
  "default_m_05",
  "default_f_01",
  "default_f_02",
  "default_f_03",
  "default_f_04",
  "default_f_05",
];

export default function JoinPage() {
  const router = useRouter();
  const nationsQuery = trpc.getNations.useQuery();
  const createGeneralMutation = trpc.createGeneral.useMutation();

  const [name, setName] = useState("");
  const [leadership, setLeadership] = useState(DEFAULT_STAT);
  const [strength, setStrength] = useState(DEFAULT_STAT);
  const [intel, setIntel] = useState(DEFAULT_STAT);
  const [nationId, setNationId] = useState(0);
  const [special, setSpecial] = useState("None");
  const [picture, setPicture] = useState(PICTURES[0]);
  const [error, setError] = useState<string | null>(null);

  const statSum = leadership + strength + intel;
  const remainingPoints = STAT_SUM_LIMIT - statSum;
  const isStatValid = statSum <= STAT_SUM_LIMIT;

  const nations = nationsQuery.data || [];

  const handleStatChange = (stat: "leadership" | "strength" | "intel", value: number) => {
    const clampedValue = Math.max(STAT_MIN, Math.min(STAT_MAX, value));

    switch (stat) {
      case "leadership":
        setLeadership(clampedValue);
        break;
      case "strength":
        setStrength(clampedValue);
        break;
      case "intel":
        setIntel(clampedValue);
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("장수 이름을 입력해주세요.");
      return;
    }

    if (name.length < 2 || name.length > 20) {
      setError("장수 이름은 2~20자 사이여야 합니다.");
      return;
    }

    if (!isStatValid) {
      setError(`스탯 합계가 ${STAT_SUM_LIMIT}을 초과합니다.`);
      return;
    }

    try {
      const result = await createGeneralMutation.mutateAsync({
        ownerId: 1, // TODO: 실제 로그인한 유저 ID로 교체
        name: name.trim(),
        picture,
        nationId,
        leadership,
        strength,
        intel,
        special,
      });

      if (result.success && result.generalId) {
        router.push(`/general/${result.generalId}`);
      } else {
        setError(result.error || "장수 생성에 실패했습니다.");
      }
    } catch (err) {
      setError("장수 생성 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">장수 생성</h1>
        <p className="text-muted-foreground mt-2">새로운 장수를 만들어 삼국지 세계에 입문하세요</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
            <CardDescription>장수의 이름과 외모를 설정합니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">장수 이름</Label>
              <Input
                id="name"
                placeholder="장수 이름을 입력하세요 (2~20자)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={20}
              />
            </div>

            <div className="space-y-2">
              <Label>외모 선택</Label>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                {PICTURES.map((pic) => (
                  <button
                    key={pic}
                    type="button"
                    onClick={() => setPicture(pic)}
                    className={`aspect-square rounded-lg border-2 transition-all ${
                      picture === pic
                        ? "border-primary ring-2 ring-primary/50"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="w-full h-full bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">
                      {pic.includes("_m_") ? "M" : "F"}
                      {pic.slice(-2)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>능력치 분배</span>
              <span
                className={`text-sm font-normal ${
                  remainingPoints < 0 ? "text-destructive" : "text-muted-foreground"
                }`}
              >
                잔여 포인트: {remainingPoints} / {STAT_SUM_LIMIT}
              </span>
            </CardTitle>
            <CardDescription>
              통솔, 무력, 지력의 합계는 {STAT_SUM_LIMIT}을 넘을 수 없습니다 (각 {STAT_MIN}~
              {STAT_MAX})
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>통솔 (Leadership)</Label>
                <span className="text-lg font-semibold text-primary">{leadership}</span>
              </div>
              <Slider
                value={leadership}
                min={STAT_MIN}
                max={STAT_MAX}
                onChange={(v) => handleStatChange("leadership", v)}
              />
              <p className="text-xs text-muted-foreground">
                병력 징집량, 훈련/사기 상승량, 부대 지휘력에 영향
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>무력 (Strength)</Label>
                <span className="text-lg font-semibold text-primary">{strength}</span>
              </div>
              <Slider
                value={strength}
                min={STAT_MIN}
                max={STAT_MAX}
                onChange={(v) => handleStatChange("strength", v)}
              />
              <p className="text-xs text-muted-foreground">
                전투 공격력, 일기토 승률, 물리 피해량에 영향
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>지력 (Intelligence)</Label>
                <span className="text-lg font-semibold text-primary">{intel}</span>
              </div>
              <Slider
                value={intel}
                min={STAT_MIN}
                max={STAT_MAX}
                onChange={(v) => handleStatChange("intel", v)}
              />
              <p className="text-xs text-muted-foreground">
                계략 성공률, 내정 효율, 첩보 활동에 영향
              </p>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">{leadership}</div>
                  <div className="text-xs text-muted-foreground">통솔</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">{strength}</div>
                  <div className="text-xs text-muted-foreground">무력</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">{intel}</div>
                  <div className="text-xs text-muted-foreground">지력</div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-border text-center">
                <span className="text-sm text-muted-foreground">합계: </span>
                <span
                  className={`text-lg font-bold ${
                    !isStatValid ? "text-destructive" : "text-foreground"
                  }`}
                >
                  {statSum}
                </span>
                <span className="text-sm text-muted-foreground"> / {STAT_SUM_LIMIT}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>소속 및 특기</CardTitle>
            <CardDescription>시작 국가와 특기를 선택합니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nation">소속 국가</Label>
              <Select
                id="nation"
                value={nationId.toString()}
                onChange={(e) => setNationId(Number(e.target.value))}
              >
                <SelectOption value="0">재야 (무소속)</SelectOption>
                {nations.map((nation: any) => (
                  <SelectOption key={nation.id} value={nation.id.toString()}>
                    {nation.name}
                  </SelectOption>
                ))}
              </Select>
              <p className="text-xs text-muted-foreground">
                재야로 시작하면 나중에 원하는 국가에 임관할 수 있습니다
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="special">특기</Label>
              <Select id="special" value={special} onChange={(e) => setSpecial(e.target.value)}>
                {SPECIALS.map((s) => (
                  <SelectOption key={s.value} value={s.value}>
                    {s.label}
                  </SelectOption>
                ))}
              </Select>
              <p className="text-xs text-muted-foreground">
                특기는 특정 행동에 보너스를 제공합니다
              </p>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/50 rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>
            취소
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={!isStatValid || !name.trim() || createGeneralMutation.isPending}
          >
            {createGeneralMutation.isPending ? "생성 중..." : "장수 생성"}
          </Button>
        </div>
      </form>
    </div>
  );
}
