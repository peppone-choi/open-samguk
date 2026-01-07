import React from "react";
import { trpc } from "../../utils/trpc.js";

interface GeneralListProps {
  nationId: number;
  nationName: string;
}

export const GeneralList: React.FC<GeneralListProps> = ({ nationId, nationName }) => {
  const generalsQuery = trpc.getNationGeneralList.useQuery({ nationId });

  if (generalsQuery.isLoading) return <div>장수 정보 로딩 중...</div>;
  if (generalsQuery.error) return <div>장수 정보를 가져오지 못했습니다.</div>;

  const generals = generalsQuery.data || [];

  return (
    <section style={{ marginBottom: "60px" }}>
      <h2 style={{ marginBottom: "24px" }}>
        {nationName} 소속 장수 ({generals.length}명)
      </h2>
      <div className="premium-card" style={{ padding: "0", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead
            style={{ background: "rgba(255,255,255,0.05)", fontSize: "0.85rem", color: "#888" }}
          >
            <tr>
              <th style={{ padding: "12px 20px" }}>전형</th>
              <th style={{ padding: "12px 20px" }}>이름</th>
              <th style={{ padding: "12px 20px" }}>무력</th>
              <th style={{ padding: "12px 20px" }}>지력</th>
              <th style={{ padding: "12px 20px" }}>통솔</th>
              <th style={{ padding: "12px 20px" }}>병력</th>
              <th style={{ padding: "12px 20px" }}>위치</th>
            </tr>
          </thead>
          <tbody style={{ fontSize: "0.95rem" }}>
            {generals.map((gen: any) => (
              <tr key={gen.no} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <td style={{ padding: "12px 20px" }}>
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: "4px",
                      fontSize: "0.75rem",
                      background:
                        gen.officerLevel === 10 ? "var(--primary)" : "rgba(255,255,255,0.1)",
                    }}
                  >
                    {gen.officerLevel === 10 ? "군주" : "장수"}
                  </span>
                </td>
                <td style={{ padding: "12px 20px", fontWeight: "bold" }}>{gen.name}</td>
                <td style={{ padding: "12px 20px" }}>{gen.leadership}</td>
                <td style={{ padding: "12px 20px" }}>{gen.strength}</td>
                <td style={{ padding: "12px 20px" }}>{gen.intellect}</td>
                <td style={{ padding: "12px 20px" }}>{gen.soldiers.toLocaleString()}</td>
                <td style={{ padding: "12px 20px", color: "var(--primary)" }}>
                  {gen.city?.name || "유랑"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {generals.length === 0 && (
          <div style={{ padding: "40px", textAlign: "center", color: "#888" }}>
            소속된 장수가 없습니다.
          </div>
        )}
      </div>
    </section>
  );
};
