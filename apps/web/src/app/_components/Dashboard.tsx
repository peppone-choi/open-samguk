"use client";

import React from "react";
import { trpc } from "@/utils/trpc";
import { NationList } from "./NationList";
import { GeneralList } from "./GeneralList";
import { ConnectedUsers } from "./ConnectedUsers";
import { Button } from "@/components/ui/button";

export const Dashboard: React.FC = () => {
  const gameStateQuery = trpc.getGameState.useQuery();
  const citiesQuery = trpc.getCities.useQuery();
  const nationsQuery = trpc.getNations.useQuery();

  if (gameStateQuery.isLoading || citiesQuery.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-xl text-primary animate-pulse">전략을 수립하는 중...</div>
      </div>
    );
  }

  if (gameStateQuery.error || citiesQuery.error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="glass p-8 rounded-xl border-red-500/30 text-center">
          <h3 className="text-xl text-red-500 font-bold mb-2">통신 오류</h3>
          <p className="text-muted-foreground">
            데이터를 불러오는데 실패했습니다.
            <br />
            (API 서버 상태를 확인해주세요)
          </p>
        </div>
      </div>
    );
  }

  const gameState = gameStateQuery.data;
  const cities = citiesQuery.data || [];
  const nations = nationsQuery.data || [];
  const firstNation = nations[0];

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-white/5">
        <div className="relative">
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl opacity-20 pointer-events-none" />
          <h1 className="text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-primary to-primary/60 tracking-tight drop-shadow-sm">
            삼국지 모의전투
          </h1>
          <p className="text-muted-foreground mt-2 text-lg font-light tracking-wide pl-1">
            중원 평정을 위한 위대한 여정
          </p>
        </div>

        <div className="glass px-6 py-4 rounded-xl border-primary/20 flex items-center gap-4 bg-gradient-to-br from-black/40 to-black/20">
          <div className="flex flex-col items-end">
            <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-1">
              Current Date
            </span>
            <div className="text-2xl font-bold font-mono text-primary drop-shadow-[0_0_10px_rgba(234,179,8,0.3)]">
              {gameState?.year}년 {gameState?.month}월
            </div>
          </div>
        </div>
      </header>

      <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <ConnectedUsers />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-10">
          <section className="space-y-4">
            <NationList />
          </section>

          {firstNation && (
            <section className="space-y-4">
              <GeneralList nationId={firstNation.id} nationName={firstNation.name} />
            </section>
          )}
        </div>

        <div className="lg:col-span-4 space-y-8">
          <section className="premium-card relative group">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
              <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                최근 세계 소식
              </h2>
            </div>

            <div className="h-[400px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              <div className="p-3 rounded bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-muted-foreground">
                    [{gameState?.year}년 {gameState?.month}월]
                  </span>
                  <span className="text-xs font-bold text-emerald-400 border border-emerald-400/30 px-1.5 rounded bg-emerald-400/10">
                    SYSTEM
                  </span>
                </div>
                <p className="text-sm text-gray-300">게임 엔진이 정상 구동 중입니다.</p>
              </div>

              <div className="p-3 rounded bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-primary border border-primary/30 px-1.5 rounded bg-primary/10">
                    NOTICE
                  </span>
                </div>
                <p className="text-sm text-gray-300">
                  tRPC를 통해 원격 서버의 데이터를 실시간으로 동기화하고 있습니다.
                </p>
              </div>

              <div className="p-3 rounded bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-blue-400 border border-blue-400/30 px-1.5 rounded bg-blue-400/10">
                    INFO
                  </span>
                </div>
                <p className="text-sm text-gray-300">
                  {cities.length}개의 도시 정보가 로드되었습니다.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <span className="w-1 h-8 bg-gradient-to-b from-primary to-transparent rounded-full" />
            주요 도시 현황
          </h2>
          <span className="text-sm text-muted-foreground">총 {cities.length}개 도시</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {cities.slice(0, 12).map((city: any) => (
            <div
              key={city.id}
              className="glass group hover:bg-card/80 transition-all duration-300 rounded-xl overflow-hidden hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 border border-white/5"
            >
              <div className="p-4 border-b border-white/5 bg-gradient-to-r from-white/5 to-transparent">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                    {city.name}
                  </h3>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded border ${
                      city.nation
                        ? "text-primary border-primary/30 bg-primary/10"
                        : "text-gray-500 border-gray-500/30 bg-gray-500/10"
                    }`}
                  >
                    {city.nation?.name || "공백지"}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="stat-item bg-black/40">
                    <span className="stat-label text-[10px]">POPULATION</span>
                    <span className="stat-value text-sm text-gray-300">
                      {city.pop.toLocaleString()}
                    </span>
                  </div>
                  <div className="stat-item bg-black/40">
                    <span className="stat-label text-[10px]">SECURITY</span>
                    <span className="stat-value text-sm text-gray-300">{city.secu}</span>
                  </div>
                  <div className="stat-item bg-black/40">
                    <span className="stat-label text-[10px]">AGRICULTURE</span>
                    <span className="stat-value text-sm text-gray-300">{city.agri}</span>
                  </div>
                  <div className="stat-item bg-black/40">
                    <span className="stat-label text-[10px]">COMMERCE</span>
                    <span className="stat-value text-sm text-gray-300">{city.comm}</span>
                  </div>
                </div>

                <Button className="w-full btn-primary h-9 text-xs" variant="default">
                  상세 정보 확인
                </Button>
              </div>
            </div>
          ))}
        </div>
        {cities.length > 12 && (
          <div className="flex justify-center pt-4">
            <Button
              variant="outline"
              className="border-white/10 hover:bg-white/5 text-muted-foreground hover:text-primary"
            >
              전체 도시 보기 ({cities.length - 12}개 더보기)
            </Button>
          </div>
        )}
      </section>
    </div>
  );
};
