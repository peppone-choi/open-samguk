"use client";

import React from "react";
import Link from "next/link";
import { trpc } from "@/utils/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

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

const OFFICER_COLORS: Record<number, string> = {
  0: "text-muted-foreground",
  1: "text-foreground",
  2: "text-blue-500",
  3: "text-blue-600",
  4: "text-purple-500",
  5: "text-purple-600",
  6: "text-orange-500",
  7: "text-orange-600",
  8: "text-red-500",
  9: "text-red-600",
  10: "text-yellow-500",
  11: "text-yellow-600",
  12: "text-yellow-700",
};

interface GeneralListItem {
  no: number;
  name: string;
  officerLevel: number;
  gold: number;
  rice: number;
  leadership: number;
  strength: number;
  intel: number;
  experience: number;
  dedication: number;
  picture: string;
  imgSvr: number;
}

export default function NationGeneralsPage() {
  // TODO: 실제로는 현재 로그인한 유저의 nationId를 가져와야 함
  const nationId = 1;

  const nationQuery = trpc.getNationInfo.useQuery({ nationId });
  const generalsQuery = trpc.getNationGeneralList.useQuery({ nationId });

  const nation = nationQuery.data;
  const generals = (generalsQuery.data || []) as GeneralListItem[];

  const totalStats = generals.reduce(
    (acc, g) => ({
      leadership: acc.leadership + g.leadership,
      strength: acc.strength + g.strength,
      intel: acc.intel + g.intel,
      gold: acc.gold + g.gold,
      rice: acc.rice + g.rice,
    }),
    { leadership: 0, strength: 0, intel: 0, gold: 0, rice: 0 }
  );

  if (generalsQuery.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{nation?.name || "세력"} 장수 목록</h1>
        <p className="text-muted-foreground mt-2">
          총 {generals.length}명의 장수가 소속되어 있습니다
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-primary">{generals.length}</div>
            <div className="text-xs text-muted-foreground">총 인원</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-blue-500">
              {Math.round(totalStats.leadership / Math.max(generals.length, 1))}
            </div>
            <div className="text-xs text-muted-foreground">평균 통솔</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-red-500">
              {Math.round(totalStats.strength / Math.max(generals.length, 1))}
            </div>
            <div className="text-xs text-muted-foreground">평균 무력</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-green-500">
              {Math.round(totalStats.intel / Math.max(generals.length, 1))}
            </div>
            <div className="text-xs text-muted-foreground">평균 지력</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-yellow-500">
              {totalStats.gold.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">총 금</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>장수 목록</CardTitle>
          <CardDescription>직위순으로 정렬됩니다</CardDescription>
        </CardHeader>
        <CardContent>
          {generals.length === 0 ? (
            <div className="text-muted-foreground text-center py-8">소속 장수가 없습니다</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">이름</th>
                    <th className="text-center py-3 px-2 font-medium text-muted-foreground">
                      직위
                    </th>
                    <th className="text-center py-3 px-2 font-medium text-muted-foreground">
                      통솔
                    </th>
                    <th className="text-center py-3 px-2 font-medium text-muted-foreground">
                      무력
                    </th>
                    <th className="text-center py-3 px-2 font-medium text-muted-foreground">
                      지력
                    </th>
                    <th className="text-right py-3 px-2 font-medium text-muted-foreground">금</th>
                    <th className="text-right py-3 px-2 font-medium text-muted-foreground">쌀</th>
                    <th className="text-center py-3 px-2 font-medium text-muted-foreground">
                      경험
                    </th>
                    <th className="text-center py-3 px-2 font-medium text-muted-foreground">
                      공헌
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {generals.map((general) => (
                    <tr
                      key={general.no}
                      className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-3 px-2">
                        <Link
                          href={`/general/${general.no}`}
                          className="font-medium hover:text-primary transition-colors"
                        >
                          {general.name}
                        </Link>
                      </td>
                      <td
                        className={`text-center py-3 px-2 ${OFFICER_COLORS[general.officerLevel] || ""}`}
                      >
                        {OFFICER_LEVELS[general.officerLevel] || "일반"}
                      </td>
                      <td className="text-center py-3 px-2 text-blue-500 font-medium">
                        {general.leadership}
                      </td>
                      <td className="text-center py-3 px-2 text-red-500 font-medium">
                        {general.strength}
                      </td>
                      <td className="text-center py-3 px-2 text-green-500 font-medium">
                        {general.intel}
                      </td>
                      <td className="text-right py-3 px-2 text-yellow-600">
                        {general.gold.toLocaleString()}
                      </td>
                      <td className="text-right py-3 px-2 text-green-600">
                        {general.rice.toLocaleString()}
                      </td>
                      <td className="text-center py-3 px-2 text-muted-foreground">
                        {general.experience}
                      </td>
                      <td className="text-center py-3 px-2 text-muted-foreground">
                        {general.dedication}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
