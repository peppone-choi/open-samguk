"use client";

import React from "react";
import { useParams } from "next/navigation";
import { trpc } from "@/utils/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { GeneralDetail, GeneralRecordItem } from "@sammo/common";

const OFFICER_LEVELS: Record<number, string> = {
  0: "재야",
  1: "일반",
  2: "종사",
  3: "군사",
  4: "장군",
  5: "태수",
  6: "대도독",
  7: "승상",
  8: "대장군",
  9: "황제",
  10: "군주",
  11: "왕",
  12: "천자",
};

const CREW_TYPES: Record<number, string> = {
  0: "없음",
  1: "보병",
  2: "궁병",
  3: "기병",
  4: "근위병",
  5: "수군",
};

function StatBar({
  label,
  value,
  exp,
  maxValue = 100,
}: {
  label: string;
  value: number;
  exp: number;
  maxValue?: number;
}) {
  const percentage = Math.min((value / maxValue) * 100, 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">
          {value} <span className="text-xs text-muted-foreground">(+{exp})</span>
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-primary transition-all" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

function EquipmentSlot({
  label,
  value,
  onDrop,
  isDropping,
}: {
  label: string;
  value: string | null;
  onDrop?: () => void;
  isDropping?: boolean;
}) {
  const isEmpty = value === "None" || !value;
  return (
    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className={`font-medium ${isEmpty ? "text-muted-foreground" : ""}`}>
          {isEmpty ? "없음" : value}
        </div>
      </div>
      {!isEmpty && onDrop && (
        <Button variant="outline" size="sm" onClick={onDrop} disabled={isDropping}>
          버리기
        </Button>
      )}
    </div>
  );
}

export default function GeneralDetailPage() {
  const params = useParams();
  const generalId = Number(params.id);

  const generalQuery = trpc.getGeneralDetail.useQuery(
    { generalId },
    { enabled: !isNaN(generalId) }
  );

  const logsQuery = trpc.getGeneralLogs.useQuery(
    { generalId, limit: 20 },
    { enabled: !isNaN(generalId) }
  );

  const commandsQuery = trpc.getReservedCommands.useQuery(
    { generalId },
    { enabled: !isNaN(generalId) }
  );

  const dropItemMutation = trpc.dropItem.useMutation({
    onSuccess: () => {
      generalQuery.refetch();
    },
  });

  const general = generalQuery.data as GeneralDetail | undefined;
  const logs = (logsQuery.data || []) as GeneralRecordItem[];
  const commands = commandsQuery.data;

  if (generalQuery.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  if (!general) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-destructive">장수를 찾을 수 없습니다.</div>
      </div>
    );
  }

  const handleDropItem = (itemType: "weapon" | "book" | "horse" | "item") => {
    if (
      confirm(
        `${itemType === "weapon" ? "무기" : itemType === "book" ? "서적" : itemType === "horse" ? "말" : "아이템"}을(를) 버리시겠습니까?`
      )
    ) {
      dropItemMutation.mutate({ generalId, itemType });
    }
  };

  const turnEntries = commands?.turn
    ? Object.entries(commands.turn)
        .map(([idx, cmd]) => ({ turnIdx: Number(idx), ...cmd }))
        .sort((a, b) => a.turnIdx - b.turnIdx)
    : [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{general.name}</h1>
        <p className="text-muted-foreground mt-1">
          {general.nation?.name || "재야"} · {OFFICER_LEVELS[general.officerLevel] || "일반"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
            <CardDescription>장수의 기본 스탯과 정보</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">나이</span>
                <div className="font-medium">{general.age}세</div>
              </div>
              <div>
                <span className="text-muted-foreground">경험</span>
                <div className="font-medium">{general.experience}</div>
              </div>
              <div>
                <span className="text-muted-foreground">공헌</span>
                <div className="font-medium">{general.dedication}</div>
              </div>
              <div>
                <span className="text-muted-foreground">위치</span>
                <div className="font-medium">{general.city?.name || "알 수 없음"}</div>
              </div>
            </div>

            <div className="space-y-3">
              <StatBar label="통솔" value={general.leadership} exp={general.leadershipExp} />
              <StatBar label="무력" value={general.strength} exp={general.strengthExp} />
              <StatBar label="지력" value={general.intel} exp={general.intelExp} />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">성격</span>
                <div className="font-medium">
                  {general.personal === "None" ? "없음" : general.personal}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">특기(내정)</span>
                <div className="font-medium">
                  {general.specialDomestic === "None" || !general.specialDomestic
                    ? "없음"
                    : general.specialDomestic}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">특기(전투)</span>
                <div className="font-medium">
                  {general.specialWar === "None" || !general.specialWar
                    ? "없음"
                    : general.specialWar}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>군사 현황</CardTitle>
            <CardDescription>병력과 자원 상태</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-yellow-500/10 rounded-lg text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {general.gold.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">금</div>
              </div>
              <div className="p-4 bg-green-500/10 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">
                  {general.rice.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">쌀</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <div>
                  <div className="text-xs text-muted-foreground">병력</div>
                  <div className="font-medium">
                    {general.crew.toLocaleString()}명 ({CREW_TYPES[general.crewType] || "없음"})
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-xs text-muted-foreground">훈련도</div>
                  <div className="font-medium">{general.train}</div>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-xs text-muted-foreground">사기</div>
                  <div className="font-medium">{general.atmos}</div>
                </div>
              </div>
              {general.injury > 0 && (
                <div className="p-3 bg-destructive/10 rounded-lg">
                  <div className="text-xs text-destructive">부상</div>
                  <div className="font-medium text-destructive">{general.injury}%</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>장비</CardTitle>
            <CardDescription>보유 중인 아이템</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <EquipmentSlot
              label="무기"
              value={general.weapon}
              onDrop={() => handleDropItem("weapon")}
              isDropping={dropItemMutation.isPending}
            />
            <EquipmentSlot
              label="서적"
              value={general.book}
              onDrop={() => handleDropItem("book")}
              isDropping={dropItemMutation.isPending}
            />
            <EquipmentSlot
              label="말"
              value={general.horse}
              onDrop={() => handleDropItem("horse")}
              isDropping={dropItemMutation.isPending}
            />
            <EquipmentSlot
              label="아이템"
              value={general.item}
              onDrop={() => handleDropItem("item")}
              isDropping={dropItemMutation.isPending}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>명령 예약</span>
              {commands && (
                <span className="text-sm font-normal text-muted-foreground">
                  {commands.year}년 {commands.month}월
                </span>
              )}
            </CardTitle>
            <CardDescription>
              {commands?.turnTerm ? `${commands.turnTerm}분 간격` : "예약된 명령"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {commandsQuery.isLoading ? (
              <div className="text-muted-foreground text-center py-4">로딩 중...</div>
            ) : turnEntries.length === 0 ? (
              <div className="text-muted-foreground text-center py-4">예약된 명령이 없습니다</div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {turnEntries.slice(0, 12).map((cmd) => (
                  <div
                    key={cmd.turnIdx}
                    className="flex items-center gap-3 p-2 bg-muted/50 rounded text-sm"
                  >
                    <span className="w-8 text-center font-mono text-muted-foreground">
                      {cmd.turnIdx + 1}
                    </span>
                    <span className="flex-1">{cmd.brief || cmd.action}</span>
                  </div>
                ))}
                {turnEntries.length > 12 && (
                  <div className="text-center text-xs text-muted-foreground py-2">
                    +{turnEntries.length - 12}개 더 보기
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>활동 기록</CardTitle>
          <CardDescription>최근 활동 내역</CardDescription>
        </CardHeader>
        <CardContent>
          {logsQuery.isLoading ? (
            <div className="text-muted-foreground text-center py-4">로딩 중...</div>
          ) : logs.length === 0 ? (
            <div className="text-muted-foreground text-center py-4">기록이 없습니다</div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {logs.map((log) => (
                <div key={log.id} className="flex gap-3 p-3 bg-muted/30 rounded-lg text-sm">
                  <span className="shrink-0 text-muted-foreground font-mono">
                    {log.year}년 {log.month}월
                  </span>
                  <span className="flex-1">{log.text}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
