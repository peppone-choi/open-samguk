/**
 * CityBasicCard - City information card
 * Ported from legacy/hwe/ts/components/CityBasicCard.vue
 */

import { SammoBar } from "./SammoBar";

/**
 * Determines if a color is bright (should use black text) or dark (should use white text)
 */
function isBrightColor(hexColor: string): boolean {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128;
}

/**
 * Get NPC color based on npc type
 */
function getNPCColor(npc: number): string {
  switch (npc) {
    case 0:
      return "white"; // User
    case 1:
      return "gray"; // NPC
    case 2:
      return "limegreen"; // NPC (special)
    case 3:
      return "cyan"; // Important NPC
    case 4:
      return "gold"; // Important NPC
    case 5:
      return "orange"; // Scenario NPC
    default:
      return "gray";
  }
}

interface OfficerInfo {
  name: string;
  npc: number;
}

interface NationInfo {
  id: number;
  name: string;
  color: string;
}

interface CityData {
  id: number;
  name: string;
  level: number;
  nationInfo: NationInfo;
  pop: [number, number]; // [current, max]
  trust: number;
  agri: [number, number];
  comm: [number, number];
  secu: [number, number];
  def: [number, number];
  wall: [number, number];
  trade: number | null;
  officerList: Record<number, OfficerInfo | undefined>;
}

interface GameConstStore {
  cityConst: Record<number, { region: number }>;
  cityConstMap: {
    region: Record<number, string>;
    level: Record<number, string>;
  };
}

interface CityBasicCardProps {
  city: CityData;
  gameConstStore: GameConstStore;
}

export function CityBasicCard({ city, gameConstStore }: CityBasicCardProps) {
  const cityInfo = gameConstStore.cityConst[city.id];
  const cityRegionText = gameConstStore.cityConstMap.region[cityInfo?.region ?? 0] ?? "";
  const cityLevelText = gameConstStore.cityConstMap.level[city.level] ?? "";

  let tradeAltText = "상인 없음";
  let tradeBarPercent = 0;
  if (city.trade) {
    tradeAltText = `${city.trade}%`;
    tradeBarPercent = (city.trade - 95) * 10;
  }

  const nameColor = isBrightColor(city.nationInfo.color) ? "black" : "white";

  return (
    <div className="city-card-basic bg2">
      <style jsx>{`
        .city-card-basic {
          display: grid;
          border-right: 1px solid rgba(255, 255, 255, 0.1);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(12px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          border-radius: 8px;
          overflow: hidden;
        }

        .cellText {
          text-align: center;
          line-height: 1.2em;
        }

        .cellTextOnly {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .gPanel {
          display: grid;
          grid-template-columns: 1fr 2fr;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          border-left: 1px solid rgba(255, 255, 255, 0.1);
          transition: background-color 0.2s;
        }

        .gPanel:hover {
          background-color: rgba(255, 255, 255, 0.05);
        }

        .gPanel .gHead {
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: rgba(255, 255, 255, 0.05);
          font-weight: 600;
          color: rgba(255, 255, 255, 0.7);
        }

        .cityNamePanel,
        .nationNamePanel {
          font-weight: bold;
          text-align: center;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          border-left: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        }

        .popPanel {
          grid-column: 1 / 3;
          grid-template-columns: 1fr 5fr;
        }

        /* Desktop: 4 columns */
        @media (min-width: 501px) and (max-width: 1000px) {
          .city-card-basic {
            grid-template-columns: 1fr 1fr 1fr 1fr;
          }

          .cityNamePanel,
          .nationNamePanel {
            grid-column: 1 / 5;
          }

          .officer4Panel {
            grid-column: 4 / 5;
            grid-row: 3 / 4;
          }

          .officer3Panel {
            grid-column: 4 / 5;
            grid-row: 4 / 5;
          }

          .officer2Panel {
            grid-column: 4 / 5;
            grid-row: 5 / 6;
          }
        }

        /* Mobile: 3 columns */
        @media (max-width: 500px) {
          .city-card-basic {
            grid-template-columns: 1fr 1fr 1fr;
          }

          .cityNamePanel,
          .nationNamePanel {
            grid-column: 1 / 4;
          }
        }

        /* Default: 3 columns for wide desktop */
        @media (min-width: 1001px) {
          .city-card-basic {
            grid-template-columns: 1fr 1fr 1fr;
          }

          .cityNamePanel,
          .nationNamePanel {
            grid-column: 1 / 4;
          }
        }
      `}</style>

      {/* City Name Panel */}
      <div
        className="cityNamePanel"
        style={{
          color: nameColor,
          backgroundColor: city.nationInfo.color,
        }}
      >
        <div>
          【{cityRegionText} | {cityLevelText}】 {city.name}
        </div>
      </div>

      {/* Nation Name Panel */}
      <div
        className="nationNamePanel"
        style={{
          color: nameColor,
          backgroundColor: city.nationInfo.color,
        }}
      >
        {city.nationInfo.id ? `지배 국가 【 ${city.nationInfo.name} 】` : "공 백 지"}
      </div>

      {/* Population */}
      <div className="gPanel popPanel">
        <div className="gHead bg1">주민</div>
        <div className="gBody">
          <SammoBar height={7} percent={(city.pop[0] / city.pop[1]) * 100} />
          <div className="cellText">
            {city.pop[0].toLocaleString()} / {city.pop[1].toLocaleString()}
          </div>
        </div>
      </div>

      {/* Trust */}
      <div className="gPanel trustPanel">
        <div className="gHead bg1">민심</div>
        <div className="gBody">
          <SammoBar height={7} percent={city.trust} />
          <div className="cellText">
            {city.trust.toLocaleString(undefined, { maximumFractionDigits: 1 })}
          </div>
        </div>
      </div>

      {/* Agriculture */}
      <div className="gPanel agriPanel">
        <div className="gHead bg1">농업</div>
        <div className="gBody">
          <SammoBar height={7} percent={(city.agri[0] / city.agri[1]) * 100} />
          <div className="cellText">
            {city.agri[0].toLocaleString()} / {city.agri[1].toLocaleString()}
          </div>
        </div>
      </div>

      {/* Commerce */}
      <div className="gPanel commPanel">
        <div className="gHead bg1">상업</div>
        <div className="gBody">
          <SammoBar height={7} percent={(city.comm[0] / city.comm[1]) * 100} />
          <div className="cellText">
            {city.comm[0].toLocaleString()} / {city.comm[1].toLocaleString()}
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="gPanel secuPanel">
        <div className="gHead bg1">치안</div>
        <div className="gBody">
          <SammoBar height={7} percent={(city.secu[0] / city.secu[1]) * 100} />
          <div className="cellText">
            {city.secu[0].toLocaleString()} / {city.secu[1].toLocaleString()}
          </div>
        </div>
      </div>

      {/* Defense */}
      <div className="gPanel defPanel">
        <div className="gHead bg1">수비</div>
        <div className="gBody">
          <SammoBar height={7} percent={(city.def[0] / city.def[1]) * 100} />
          <div className="cellText">
            {city.def[0].toLocaleString()} / {city.def[1].toLocaleString()}
          </div>
        </div>
      </div>

      {/* Wall */}
      <div className="gPanel wallPanel">
        <div className="gHead bg1">성벽</div>
        <div className="gBody">
          <SammoBar height={7} percent={(city.wall[0] / city.wall[1]) * 100} />
          <div className="cellText">
            {city.wall[0].toLocaleString()} / {city.wall[1].toLocaleString()}
          </div>
        </div>
      </div>

      {/* Trade */}
      <div className="gPanel tradePanel">
        <div className="gHead bg1">시세</div>
        <div className="gBody">
          <SammoBar height={7} percent={tradeBarPercent} />
          <div className="cellText">{tradeAltText}</div>
        </div>
      </div>

      {/* Officer 4 (태수) */}
      <div className="gPanel officer4Panel">
        <div className="gHead bg1">태수</div>
        <div
          className="gBody cellTextOnly"
          style={{ color: getNPCColor(city.officerList[4]?.npc ?? 0) }}
        >
          {city.officerList[4]?.name ?? "-"}
        </div>
      </div>

      {/* Officer 3 (군사) */}
      <div className="gPanel officer3Panel">
        <div className="gHead bg1">군사</div>
        <div
          className="gBody cellTextOnly"
          style={{ color: getNPCColor(city.officerList[3]?.npc ?? 0) }}
        >
          {city.officerList[3]?.name ?? "-"}
        </div>
      </div>

      {/* Officer 2 (종사) */}
      <div className="gPanel officer2Panel">
        <div className="gHead bg1">종사</div>
        <div
          className="gBody cellTextOnly"
          style={{ color: getNPCColor(city.officerList[2]?.npc ?? 0) }}
        >
          {city.officerList[2]?.name ?? "-"}
        </div>
      </div>
    </div>
  );
}
