/**
 * NationBasicCard - Nation information card
 * Ported from legacy/hwe/ts/components/NationBasicCard.vue
 */

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
      return "white";
    case 1:
      return "gray";
    case 2:
      return "limegreen";
    case 3:
      return "cyan";
    case 4:
      return "gold";
    case 5:
      return "orange";
    default:
      return "gray";
  }
}

/**
 * Format officer level text based on officer level and nation level
 */
function formatOfficerLevelText(officerLevel: number, nationLevel: number): string {
  const levelTexts: Record<number, Record<number, string>> = {
    12: { 0: "군주", 1: "왕", 2: "황제" },
    11: { 0: "부군주", 1: "승상", 2: "승상" },
  };
  return levelTexts[officerLevel]?.[nationLevel] ?? `Lv.${officerLevel}`;
}

/**
 * Convert tech value to level
 */
function convTechLevel(tech: number, maxLevel: number): number {
  const techPerLevel = 1000;
  return Math.min(Math.floor(tech / techPerLevel) + 1, maxLevel);
}

/**
 * Check if tech is limited
 */
function isTechLimited(
  startYear: number,
  currentYear: number,
  tech: number,
  maxTechLevel: number,
  initialAllowedTechLevel: number,
  techLevelIncYear: number
): boolean {
  const maxAllowed = getMaxRelativeTechLevel(
    startYear,
    currentYear,
    maxTechLevel,
    initialAllowedTechLevel,
    techLevelIncYear
  );
  const currentLevel = convTechLevel(tech, maxAllowed);
  return currentLevel >= maxAllowed;
}

/**
 * Get max relative tech level based on year
 */
function getMaxRelativeTechLevel(
  startYear: number,
  currentYear: number,
  maxTechLevel: number,
  initialAllowedTechLevel: number,
  techLevelIncYear: number
): number {
  const yearsPassed = currentYear - startYear;
  const additionalLevels = Math.floor(yearsPassed / techLevelIncYear);
  return Math.min(initialAllowedTechLevel + additionalLevels, maxTechLevel);
}

interface ChiefInfo {
  name: string;
  npc: number;
}

interface NationType {
  name: string;
  pros: string;
  cons: string;
}

interface NationData {
  id: number;
  name: string;
  color: string;
  level: number;
  type: NationType;
  topChiefs: Record<number, ChiefInfo | undefined>;
  population: {
    now: number;
    max: number;
    cityCnt: number;
  };
  crew: {
    now: number;
    max: number;
    generalCnt: number;
  };
  gold: number;
  rice: number;
  bill: number;
  taxRate: number;
  power: number;
  tech: number;
  strategicCmdLimit: number;
  diplomaticLimit: number;
  prohibitScout: boolean;
  prohibitWar: boolean;
  impossibleStrategicCommand: [string, number][];
}

interface GlobalData {
  startyear: number;
  year: number;
  month: number;
}

interface GameConst {
  maxTechLevel: number;
  initialAllowedTechLevel: number;
  techLevelIncYear: number;
}

interface NationBasicCardProps {
  nation: NationData;
  global: GlobalData;
  gameConst: GameConst;
}

export function NationBasicCard({ nation, global, gameConst }: NationBasicCardProps) {
  const { startyear, year } = global;
  const { maxTechLevel, initialAllowedTechLevel, techLevelIncYear } = gameConst;

  const maxLevel = getMaxRelativeTechLevel(
    startyear,
    year,
    maxTechLevel,
    initialAllowedTechLevel,
    techLevelIncYear
  );
  const currentTechLevel = convTechLevel(nation.tech, maxLevel);
  const onTechLimit = isTechLimited(
    startyear,
    year,
    nation.tech,
    maxTechLevel,
    initialAllowedTechLevel,
    techLevelIncYear
  );

  // Build impossible strategic command text
  let impossibleStrategicCommandText = "";
  if (nation.impossibleStrategicCommand.length > 0) {
    const yearMonth = global.year * 12 + global.month;
    const texts = nation.impossibleStrategicCommand.map(([cmdName, turnCnt]) => {
      const targetYearMonth = yearMonth + turnCnt;
      const targetYear = Math.floor(targetYearMonth / 12);
      const targetMonth = targetYearMonth % 12 || 12;
      return `${cmdName}: ${turnCnt.toLocaleString()}턴 뒤(${targetYear}년 ${targetMonth}월부터)`;
    });
    impossibleStrategicCommandText = texts.join("\n");
  }

  const nameColor = isBrightColor(nation.color) ? "black" : "white";

  return (
    <div className="nation-card-basic bg2">
      <style jsx>{`
        .nation-card-basic {
          width: 500px;
          height: 193px;
          display: grid;
          grid-template-columns: 7fr 18fr 7fr 18fr;
          grid-template-rows: repeat(10, calc(192px / 10));
          border-bottom: solid 1px gray;
          border-right: solid 1px gray;
        }

        .nation-card-basic .name {
          grid-column: 1 / span 4;
        }

        .nation-card-basic .type-body {
          grid-column: 2 / span 3;
        }

        .tb-title {
          text-align: center;
          padding: 0px;
          line-height: calc(193px / 10);
          border-left: solid 1px gray;
          border-top: solid 1px gray;
        }

        .tb-head {
          border-left: solid 1px gray;
          border-top: solid 1px gray;
          text-align: center;
          padding: 0px;
          line-height: calc(193px / 10);
        }

        .tb-body {
          border-top: solid 1px gray;
          padding: 0px;
          line-height: calc(193px / 10);
          text-align: center;
        }
      `}</style>

      {/* Nation Name */}
      <div
        className="name tb-title"
        style={{
          backgroundColor: nation.color,
          color: nameColor,
          fontWeight: "bold",
        }}
      >
        {nation.name}
      </div>

      {/* Type */}
      <div className="type-head tb-head bg1">성향</div>
      <div className="type-body tb-body">
        {nation.type.name} (<span style={{ color: "cyan" }}>{nation.type.pros}</span>
        <span style={{ color: "magenta" }}>{nation.type.cons}</span>)
      </div>

      {/* Chief Level 12 */}
      <div className="c12-head tb-head bg1">{formatOfficerLevelText(12, nation.level)}</div>
      <div
        className="c12-body tb-body"
        style={{ color: getNPCColor(nation.topChiefs[12]?.npc ?? 1) }}
      >
        {nation.topChiefs[12]?.name ?? "-"}
      </div>

      {/* Chief Level 11 */}
      <div className="c11-head tb-head bg1">{formatOfficerLevelText(11, nation.level)}</div>
      <div
        className="c11-body tb-body"
        style={{ color: getNPCColor(nation.topChiefs[11]?.npc ?? 1) }}
      >
        {nation.topChiefs[11]?.name ?? "-"}
      </div>

      {/* Population */}
      <div className="pop-head tb-head bg1">총 주민</div>
      <div className="pop-body tb-body">
        {!nation.id
          ? "해당 없음"
          : `${nation.population.now.toLocaleString()} / ${nation.population.max.toLocaleString()}`}
      </div>

      {/* Crew */}
      <div className="crew-head tb-head bg1">총 병사</div>
      <div className="crew-body tb-body">
        {!nation.id
          ? "해당 없음"
          : `${nation.crew.now.toLocaleString()} / ${nation.crew.max.toLocaleString()}`}
      </div>

      {/* Gold */}
      <div className="gold-head tb-head bg1">국고</div>
      <div className="gold-body tb-body">
        {!nation.id ? "해당 없음" : nation.gold.toLocaleString()}
      </div>

      {/* Rice */}
      <div className="rice-head tb-head bg1">병량</div>
      <div className="rice-body tb-body">
        {!nation.id ? "해당 없음" : nation.rice.toLocaleString()}
      </div>

      {/* Bill */}
      <div className="bill-head tb-head bg1">지급률</div>
      <div className="bill-body tb-body">{!nation.id ? "해당 없음" : `${nation.bill}%`}</div>

      {/* Tax Rate */}
      <div className="taxRate-head tb-head bg1">세율</div>
      <div className="taxRate-body tb-body">{!nation.id ? "해당 없음" : `${nation.taxRate}%`}</div>

      {/* City Count */}
      <div className="cityCnt-head tb-head bg1">속령</div>
      <div className="cityCnt-body tb-body">
        {!nation.id ? "해당 없음" : nation.population.cityCnt.toLocaleString()}
      </div>

      {/* General Count */}
      <div className="genCnt-head tb-head bg1">장수</div>
      <div className="genCnt-body tb-body">
        {!nation.id ? "해당 없음" : nation.crew.generalCnt.toLocaleString()}
      </div>

      {/* Power */}
      <div className="power-head tb-head bg1">국력</div>
      <div className="power-body tb-body">
        {!nation.id ? "해당 없음" : nation.power.toLocaleString()}
      </div>

      {/* Tech */}
      <div className="tech-head tb-head bg1">기술력</div>
      <div className="tech-body tb-body">
        {!nation.id ? (
          "해당 없음"
        ) : (
          <>
            {currentTechLevel}등급 /{" "}
            <span style={{ color: onTechLimit ? "magenta" : "limegreen" }}>
              {Math.floor(nation.tech).toLocaleString()}
            </span>
          </>
        )}
      </div>

      {/* Strategic Command */}
      <div className="strategicClg-head tb-head bg1">전략</div>
      <div
        className="strategicClg-body tb-body"
        title={impossibleStrategicCommandText || undefined}
        style={{
          textDecoration: impossibleStrategicCommandText ? "underline dashed red" : undefined,
        }}
      >
        {!nation.id ? (
          "해당 없음"
        ) : nation.strategicCmdLimit ? (
          <span style={{ color: "red" }}>{nation.strategicCmdLimit.toLocaleString()}턴</span>
        ) : (
          <span style={{ color: impossibleStrategicCommandText ? "yellow" : "limegreen" }}>
            가능
          </span>
        )}
      </div>

      {/* Diplomatic */}
      <div className="diplomaticClg-head tb-head bg1">외교</div>
      <div className="diplomaticClg-body tb-body">
        {!nation.id ? (
          "해당 없음"
        ) : nation.diplomaticLimit ? (
          <span style={{ color: "red" }}>{nation.diplomaticLimit.toLocaleString()}턴</span>
        ) : (
          <span style={{ color: "limegreen" }}>가능</span>
        )}
      </div>

      {/* Scout Prohibition */}
      <div className="prohibitScout-head tb-head bg1">임관</div>
      <div className="prohibitScout-body tb-body">
        {!nation.id ? (
          "해당 없음"
        ) : nation.prohibitScout ? (
          <span style={{ color: "red" }}>금지</span>
        ) : (
          <span style={{ color: "limegreen" }}>허가</span>
        )}
      </div>

      {/* War Prohibition */}
      <div className="prohibitWar-head tb-head bg1">전쟁</div>
      <div className="prohibitWar-body tb-body">
        {!nation.id ? (
          "해당 없음"
        ) : nation.prohibitWar ? (
          <span style={{ color: "red" }}>금지</span>
        ) : (
          <span style={{ color: "limegreen" }}>허가</span>
        )}
      </div>
    </div>
  );
}
