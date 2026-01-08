"use client";

import React from "react";
import { trpc } from "@/utils/trpc";
import { NationList } from "./NationList";
import { GeneralList } from "./GeneralList";
import { ConnectedUsers } from "./ConnectedUsers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Dashboard: React.FC = () => {
  const gameStateQuery = trpc.getGameState.useQuery();
  const citiesQuery = trpc.getCities.useQuery();
  const nationsQuery = trpc.getNations.useQuery();

  if (gameStateQuery.isLoading || citiesQuery.isLoading) {
    return <div className="p-10 text-center text-muted-foreground">로딩 중...</div>;
  }

  if (gameStateQuery.error || citiesQuery.error) {
    return (
      <div className="p-10 text-center text-destructive">
        데이터를 불러오는데 실패했습니다. (API 서버가 실행 중인지 확인하세요)
      </div>
    );
  }

  const gameState = gameStateQuery.data;
  const cities = citiesQuery.data || [];
  const nations = nationsQuery.data || [];
  const firstNation = nations[0];

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl">삼국지 모의전투</h1>
          <p className="text-muted-foreground mt-2">중원 평정을 위한 위대한 여정</p>
        </div>
        <Card className="px-5 py-3">
          <span className="stat-label">현재 날짜</span>
          <div className="stat-value text-primary">
            {gameState?.year}년 {gameState?.month}월
          </div>
        </Card>
      </header>

      <div className="mb-10">
        <ConnectedUsers />
      </div>

      {/* Nation List */}
      <NationList />

      {/* General List */}
      {firstNation && <GeneralList nationId={firstNation.id} nationName={firstNation.name} />}

      {/* City Information */}
      <section className="mb-14">
        <h2 className="mb-6">도시 정보</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {cities.map((city: any) => (
            <Card key={city.id} className="hover:border-primary transition-colors">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-baseline">
                  <CardTitle className="text-lg">{city.name}</CardTitle>
                  <span className="text-primary font-bold text-sm">
                    {city.nation?.name || "공백지"}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <div className="stat-item">
                    <span className="stat-label">인구</span>
                    <span className="stat-value text-base">{city.pop.toLocaleString()}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">치안</span>
                    <span className="stat-value text-base">{city.secu}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">농업</span>
                    <span className="stat-value text-base">{city.agri}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">상업</span>
                    <span className="stat-value text-base">{city.comm}</span>
                  </div>
                </div>
                <Button className="w-full mt-4" variant="default">
                  도시 상세보기
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Recent News */}
      <section>
        <h2 className="mb-6">최근 세계 소식</h2>
        <Card className="h-52 overflow-y-auto">
          <CardContent className="pt-6 text-sm space-y-2">
            <div className="text-muted-foreground">
              [{gameState?.year}년 {gameState?.month}월] 게임 엔진이 구동 중입니다.
            </div>
            <div className="text-primary">
              [알림] tRPC를 통해 원격 서버의 데이터를 실시간으로 가져옵니다.
            </div>
            <div className="text-green-500">
              [시스템] {cities.length}개의 도시 정보가 로드되었습니다.
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};
