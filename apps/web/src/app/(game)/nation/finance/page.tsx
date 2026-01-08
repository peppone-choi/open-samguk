"use client";

import React, { useState } from "react";
import { trpc } from "@/utils/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface CityInfo {
  city: number;
  name: string;
  level: number;
}

export default function NationFinancePage() {
  // TODO: 실제로는 현재 로그인한 유저의 nationId를 가져와야 함
  const nationId = 1;

  const nationQuery = trpc.getNationInfo.useQuery({ nationId });
  const updateConfigMutation = trpc.updateNationConfig.useMutation({
    onSuccess: () => {
      nationQuery.refetch();
    },
  });

  const nation = nationQuery.data;

  const [rate, setRate] = useState<number | null>(null);
  const [bill, setBill] = useState<number | null>(null);
  const [secretLimit, setSecretLimit] = useState<number | null>(null);

  const currentRate = rate ?? nation?.rate ?? 20;
  const currentBill = bill ?? nation?.bill ?? 0;
  const currentSecretLimit = secretLimit ?? nation?.secretLimit ?? 3;

  const cities = (nation?.cities || []) as CityInfo[];

  const handleSave = () => {
    const updates: { rate?: number; bill?: number; secretLimit?: number } = {};

    if (rate !== null && rate !== nation?.rate) {
      updates.rate = rate;
    }
    if (bill !== null && bill !== nation?.bill) {
      updates.bill = bill;
    }
    if (secretLimit !== null && secretLimit !== nation?.secretLimit) {
      updates.secretLimit = secretLimit;
    }

    if (Object.keys(updates).length > 0) {
      updateConfigMutation.mutate({ nationId, data: updates });
    }
  };

  const hasChanges =
    (rate !== null && rate !== nation?.rate) ||
    (bill !== null && bill !== nation?.bill) ||
    (secretLimit !== null && secretLimit !== nation?.secretLimit);

  if (nationQuery.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  if (!nation) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-destructive">국가 정보를 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{nation.name} 내무부</h1>
        <p className="text-muted-foreground mt-2">국가 예산 및 정책을 관리합니다</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-yellow-500">{nation.gold.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">국고 금</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-green-500">{nation.rice.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">국고 쌀</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-blue-500">{nation.tech?.toFixed(1) ?? 0}</div>
            <div className="text-xs text-muted-foreground">기술력</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-purple-500">{cities.length}</div>
            <div className="text-xs text-muted-foreground">보유 도시</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>세금 정책</CardTitle>
            <CardDescription>국가 세율과 봉급을 설정합니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>세율 (Rate)</Label>
                <span className="text-lg font-semibold text-primary">{currentRate}%</span>
              </div>
              <Slider value={currentRate} min={0} max={50} onChange={(v) => setRate(v)} />
              <p className="text-xs text-muted-foreground">
                높을수록 수입이 증가하지만 민심이 하락합니다
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>봉급 (Bill)</Label>
                <span className="text-lg font-semibold text-primary">{currentBill}</span>
              </div>
              <Slider value={currentBill} min={0} max={100} onChange={(v) => setBill(v)} />
              <p className="text-xs text-muted-foreground">장수들에게 지급되는 월급입니다</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>밀서 제한</Label>
                <span className="text-lg font-semibold text-primary">{currentSecretLimit}회</span>
              </div>
              <Slider
                value={currentSecretLimit}
                min={0}
                max={10}
                onChange={(v) => setSecretLimit(v)}
              />
              <p className="text-xs text-muted-foreground">
                장수가 보낼 수 있는 월간 밀서 수입니다
              </p>
            </div>

            <Button
              onClick={handleSave}
              disabled={!hasChanges || updateConfigMutation.isPending}
              className="w-full"
            >
              {updateConfigMutation.isPending ? "저장 중..." : "설정 저장"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>보유 도시</CardTitle>
            <CardDescription>국가가 점령한 도시 목록</CardDescription>
          </CardHeader>
          <CardContent>
            {cities.length === 0 ? (
              <div className="text-muted-foreground text-center py-8">보유 도시가 없습니다</div>
            ) : (
              <div className="space-y-2">
                {cities.map((city) => (
                  <div
                    key={city.city}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="font-medium">{city.name}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">레벨</span>
                      <span className="font-medium text-primary">{city.level}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>국가 정보</CardTitle>
          <CardDescription>세력의 기본 정보</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="text-xs text-muted-foreground">국가 유형</div>
              <div className="font-medium">{nation.type || "중립"}</div>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="text-xs text-muted-foreground">국력</div>
              <div className="font-medium">{nation.power}</div>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="text-xs text-muted-foreground">레벨</div>
              <div className="font-medium">{nation.level}</div>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="text-xs text-muted-foreground">장수 수</div>
              <div className="font-medium">{nation.gennum}명</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
