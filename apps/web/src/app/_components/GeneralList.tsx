"use client";

import React from "react";
import { trpc } from "@/utils/trpc";
import { Card, CardContent } from "@/components/ui/card";

interface GeneralListProps {
  nationId: number;
  nationName: string;
}

export const GeneralList: React.FC<GeneralListProps> = ({ nationId, nationName }) => {
  const generalsQuery = trpc.getNationGeneralList.useQuery({ nationId });

  if (generalsQuery.isLoading) {
    return <div className="text-muted-foreground">장수 정보 로딩 중...</div>;
  }

  if (generalsQuery.error) {
    return <div className="text-destructive">장수 정보를 가져오지 못했습니다.</div>;
  }

  // Handle both array response and {list: []} response format
  const rawData = generalsQuery.data;
  const generals: unknown[] = Array.isArray(rawData)
    ? rawData
    : (((rawData as Record<string, unknown>)?.list as unknown[]) ?? []);

  return (
    <section className="mb-14">
      <h2 className="mb-6">
        {nationName} 소속 장수 ({generals.length}명)
      </h2>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted/50 text-sm text-muted-foreground border-b border-border">
              <tr>
                <th className="px-5 py-3 font-medium">전형</th>
                <th className="px-5 py-3 font-medium">이름</th>
                <th className="px-5 py-3 font-medium">통솔</th>
                <th className="px-5 py-3 font-medium">무력</th>
                <th className="px-5 py-3 font-medium">지력</th>
                <th className="px-5 py-3 font-medium">병력</th>
                <th className="px-5 py-3 font-medium">위치</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {generals.map((gen: any) => (
                <tr
                  key={gen.no}
                  className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-5 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        gen.officerLevel === 10
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {gen.officerLevel === 10 ? "군주" : "장수"}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-semibold">{gen.name}</td>
                  <td className="px-5 py-3">{gen.leadership}</td>
                  <td className="px-5 py-3">{gen.strength}</td>
                  <td className="px-5 py-3">{gen.intellect}</td>
                  <td className="px-5 py-3">{gen.soldiers.toLocaleString()}</td>
                  <td className="px-5 py-3 text-primary">{gen.city?.name || "유랑"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {generals.length === 0 && (
          <CardContent className="py-10 text-center text-muted-foreground">
            소속된 장수가 없습니다.
          </CardContent>
        )}
      </Card>
    </section>
  );
};
