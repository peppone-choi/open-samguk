"use client";

import React from "react";
import { trpc } from "@/utils/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const NationList: React.FC = () => {
  const nationsQuery = trpc.getNations.useQuery();

  if (nationsQuery.isLoading) {
    return <div className="text-muted-foreground">국가 정보 로딩 중...</div>;
  }

  if (nationsQuery.error) {
    return <div className="text-destructive">국가 정보를 가져오지 못했습니다.</div>;
  }

  const nations = nationsQuery.data || [];

  return (
    <section className="mb-14">
      <h2 className="mb-6">국가 목록</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {nations.map((nation: any) => (
          <Card
            key={nation.id}
            className="border-l-4 hover:border-primary transition-colors"
            style={{ borderLeftColor: nation.color || "hsl(var(--primary))" }}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-baseline">
                <CardTitle className="text-lg">{nation.name}</CardTitle>
                <span className="text-xs text-muted-foreground">기술 {nation.tech}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-6">
                <div className="stat-item">
                  <span className="stat-label">금</span>
                  <span className="stat-value text-base">{nation.gold.toLocaleString()}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">군량</span>
                  <span className="stat-value text-base">{nation.rice.toLocaleString()}</span>
                </div>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                {nation.cities?.length || 0}개의 도시 지배 중
              </div>
            </CardContent>
          </Card>
        ))}
        {nations.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="py-10 text-center text-muted-foreground">
              현재 건국된 국가가 없습니다.
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
};
