"use client";

import React from "react";
import { trpc } from "@/utils/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const DIPLOMACY_STATES: Record<number, { label: string; color: string }> = {
  0: { label: "무관계", color: "text-muted-foreground" },
  1: { label: "전쟁", color: "text-red-500" },
  2: { label: "휴전", color: "text-yellow-500" },
  3: { label: "불가침", color: "text-blue-500" },
  4: { label: "동맹제안", color: "text-purple-400" },
  5: { label: "동맹", color: "text-purple-500" },
  6: { label: "화친제안", color: "text-green-400" },
  7: { label: "불가침제안", color: "text-blue-400" },
};

interface NationInfo {
  nation: number;
  name: string;
  color: string;
  level: number;
  power: number;
  gennum: number;
  cities: string[];
}

interface ConflictInfo {
  cityId: number;
  cityName: string;
  conflict: Record<number, number>;
}

export default function DiplomacyPage() {
  const nationId = 1;

  const statusQuery = trpc.getDiplomacyStatus.useQuery({ viewerNationId: nationId });
  const proposalsQuery = trpc.getDiplomacyProposals.useQuery({ nationId });

  const data = statusQuery.data;
  const proposals = proposalsQuery.data;

  const nations = (data?.nations || []) as NationInfo[];
  const diplomacyList = data?.diplomacyList || {};
  const conflicts = (data?.conflicts || []) as ConflictInfo[];

  const getNationName = (id: number) => nations.find((n) => n.nation === id)?.name || `국가${id}`;

  if (statusQuery.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">중원 정보</h1>
        <p className="text-muted-foreground mt-2">외교 현황 및 분쟁 정보를 확인합니다</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-primary">{nations.length}</div>
            <div className="text-xs text-muted-foreground">활동 세력</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-red-500">{conflicts.length}</div>
            <div className="text-xs text-muted-foreground">분쟁 지역</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-blue-500">
              {proposals?.incoming?.length || 0}
            </div>
            <div className="text-xs text-muted-foreground">받은 제안</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-purple-500">
              {proposals?.outgoing?.length || 0}
            </div>
            <div className="text-xs text-muted-foreground">보낸 제안</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>세력 현황</CardTitle>
          <CardDescription>활동 중인 세력 목록</CardDescription>
        </CardHeader>
        <CardContent>
          {nations.length === 0 ? (
            <div className="text-muted-foreground text-center py-8">활동 중인 세력이 없습니다</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">세력</th>
                    <th className="text-center py-3 px-2 font-medium text-muted-foreground">
                      국력
                    </th>
                    <th className="text-center py-3 px-2 font-medium text-muted-foreground">
                      장수
                    </th>
                    <th className="text-center py-3 px-2 font-medium text-muted-foreground">
                      도시
                    </th>
                    <th className="text-center py-3 px-2 font-medium text-muted-foreground">
                      외교
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {nations.map((nation) => {
                    const myDiplomacy = diplomacyList[nationId]?.[nation.nation] ?? 0;
                    const stateInfo = DIPLOMACY_STATES[myDiplomacy] || DIPLOMACY_STATES[0];

                    return (
                      <tr
                        key={nation.nation}
                        className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                      >
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: nation.color }}
                            />
                            <span className="font-medium">{nation.name}</span>
                          </div>
                        </td>
                        <td className="text-center py-3 px-2 font-medium text-primary">
                          {nation.power.toLocaleString()}
                        </td>
                        <td className="text-center py-3 px-2">{nation.gennum}명</td>
                        <td className="text-center py-3 px-2">{nation.cities.length}개</td>
                        <td className={`text-center py-3 px-2 font-medium ${stateInfo.color}`}>
                          {nation.nation === nationId ? "-" : stateInfo.label}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {conflicts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>분쟁 지역</CardTitle>
            <CardDescription>현재 전투가 벌어지고 있는 도시</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {conflicts.map((conflict) => (
                <div key={conflict.cityId} className="p-4 bg-muted/50 rounded-lg">
                  <div className="font-medium mb-2">{conflict.cityName}</div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(conflict.conflict).map(([nId, percentage]) => (
                      <div key={nId} className="px-2 py-1 bg-background rounded text-xs">
                        <span className="text-muted-foreground">{getNationName(Number(nId))}</span>
                        <span className="ml-1 font-medium text-red-500">{percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {((proposals?.incoming?.length || 0) > 0 || (proposals?.outgoing?.length || 0) > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {(proposals?.incoming?.length || 0) > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>받은 외교 제안</CardTitle>
                <CardDescription>다른 세력에서 보낸 제안</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {proposals?.incoming?.map((p: any) => (
                    <div
                      key={p.no}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{p.srcNation?.name}</div>
                        <div className="text-xs text-muted-foreground">{p.textBrief}</div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(p.date).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {(proposals?.outgoing?.length || 0) > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>보낸 외교 제안</CardTitle>
                <CardDescription>우리 세력에서 보낸 제안</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {proposals?.outgoing?.map((p: any) => (
                    <div
                      key={p.no}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{p.destNation?.name}</div>
                        <div className="text-xs text-muted-foreground">{p.textBrief}</div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(p.date).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
