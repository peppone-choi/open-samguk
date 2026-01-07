import React from "react";
import { trpc } from "../../utils/trpc.js";

export const NationList: React.FC = () => {
  const nationsQuery = trpc.getNations.useQuery();

  if (nationsQuery.isLoading) return <div>국가 정보 로딩 중...</div>;
  if (nationsQuery.error) return <div>국가 정보를 가져오지 못했습니다.</div>;

  const nations = nationsQuery.data || [];

  return (
    <section style={{ marginBottom: "60px" }}>
      <h2 style={{ marginBottom: "24px" }}>국가 목록</h2>
      <div
        className="stat-grid"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))" }}
      >
        {nations.map((nation: any) => (
          <div
            key={nation.id}
            className="premium-card"
            style={{ borderLeft: `6px solid ${nation.color || "var(--primary)"}` }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: "12px",
              }}
            >
              <h3 style={{ margin: 0 }}>{nation.name}</h3>
              <span style={{ fontSize: "0.8rem", color: "#888" }}>기술 {nation.tech}</span>
            </div>
            <div style={{ display: "flex", gap: "20px" }}>
              <div className="stat-item">
                <span className="stat-label">금</span>
                <span className="stat-value" style={{ fontSize: "1.1rem" }}>
                  {nation.gold.toLocaleString()}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">군량</span>
                <span className="stat-value" style={{ fontSize: "1.1rem" }}>
                  {nation.rice.toLocaleString()}
                </span>
              </div>
            </div>
            <div style={{ marginTop: "16px", fontSize: "0.85rem", color: "#ccc" }}>
              {nation.cities?.length || 0}개의 도시 지배 중
            </div>
          </div>
        ))}
        {nations.length === 0 && (
          <div
            className="premium-card"
            style={{ gridColumn: "1 / -1", textAlign: "center", color: "#888" }}
          >
            현재 건국된 국가가 없습니다.
          </div>
        )}
      </div>
    </section>
  );
};
