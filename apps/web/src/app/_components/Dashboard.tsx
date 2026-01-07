import React from "react";
import { trpc } from "../../utils/trpc.js";
import { NationList } from "./NationList.js";
import { GeneralList } from "./GeneralList.js";

export const Dashboard: React.FC = () => {
  const gameStateQuery = trpc.getGameState.useQuery();
  const citiesQuery = trpc.getCities.useQuery();
  const nationsQuery = trpc.getNations.useQuery();

  if (gameStateQuery.isLoading || citiesQuery.isLoading) {
    return <div style={{ padding: "40px", textAlign: "center", color: "#888" }}>로딩 중...</div>;
  }

  if (gameStateQuery.error || citiesQuery.error) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#f44336" }}>
        데이터를 불러오는데 실패했습니다. (API 서버가 실행 중인지 확인하세요)
      </div>
    );
  }

  const gameState = gameStateQuery.data;
  const cities = citiesQuery.data || [];
  const nations = nationsQuery.data || [];
  const firstNation = nations[0];

  return (
    <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
      <header
        style={{
          marginBottom: "40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1 style={{ fontSize: "2.5rem", margin: "0" }}>삼국지 모의전투</h1>
          <p style={{ color: "#888", marginTop: "8px" }}>중원 평정을 위한 위대한 여정</p>
        </div>
        <div className="premium-card" style={{ padding: "10px 20px" }}>
          <span className="stat-label">현재 날짜</span>
          <div className="stat-value" style={{ color: "var(--primary)" }}>
            {gameState?.year}년 {gameState?.month}월
          </div>
        </div>
      </header>

      <NationList />

      {firstNation && <GeneralList nationId={firstNation.id} nationName={firstNation.name} />}

      <section style={{ marginBottom: "60px" }}>
        <h2 style={{ marginBottom: "24px" }}>도시 정보</h2>
        <div className="stat-grid">
          {cities.map((city: any) => (
            <div key={city.id} className="premium-card">
              <div
                style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}
              >
                <h3 style={{ margin: "0", color: "#fff" }}>{city.name}</h3>
                <span style={{ color: "var(--primary)", fontWeight: "bold" }}>
                  {city.nation?.name || "공백지"}
                </span>
              </div>
              <div className="stat-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="stat-item">
                  <span className="stat-label">인구</span>
                  <span className="stat-value">{city.pop.toLocaleString()}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">치안</span>
                  <span className="stat-value">{city.secu}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">농업</span>
                  <span className="stat-value">{city.agri}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">상업</span>
                  <span className="stat-value">{city.comm}</span>
                </div>
              </div>
              <div style={{ marginTop: "20px" }}>
                <button className="btn-primary" style={{ width: "100%" }}>
                  도시 상세보기
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 style={{ marginBottom: "24px" }}>최근 세계 소식</h2>
        <div
          className="premium-card"
          style={{ height: "200px", overflowY: "auto", fontSize: "0.9rem" }}
        >
          <div style={{ color: "#aaa", marginBottom: "8px" }}>
            [{gameState?.year}년 {gameState?.month}월] 게임 엔진이 구동 중입니다.
          </div>
          <div style={{ color: "var(--primary)", marginBottom: "8px" }}>
            [알림] tRPC를 통해 원격 서버의 데이터를 실시간으로 가져옵니다.
          </div>
          <div style={{ color: "#4caf50", marginBottom: "8px" }}>
            [시스템] {cities.length}개의 도시 정보가 로드되었습니다.
          </div>
        </div>
      </section>
    </div>
  );
};
