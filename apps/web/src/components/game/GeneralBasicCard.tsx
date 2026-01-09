/**
 * GeneralBasicCard - General (장수) information card
 * Ported from legacy/hwe/ts/components/GeneralBasicCard.vue
 * Complex 350-line Vue component with grid layout
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
 * Format injury text and color
 */
function formatInjury(injury: number): [string, string] {
  if (injury === 0) return ["건강", "limegreen"];
  if (injury <= 20) return ["경상", "yellow"];
  if (injury <= 50) return ["중상", "orange"];
  if (injury <= 80) return ["위독", "orangered"];
  return ["빈사", "red"];
}

/**
 * Calculate stat with injury penalty
 */
function calcInjury(statName: "leadership" | "strength" | "intel", general: GeneralData): number {
  const baseStat = general[statName];
  const injuryPenalty = Math.floor(baseStat * (general.injury / 200));
  return baseStat - injuryPenalty;
}

/**
 * Format general type call based on stats
 */
function formatGeneralTypeCall(
  leadership: number,
  strength: number,
  intel: number,
  gameConst: GameConst
): string {
  const threshold = gameConst.chipiLimit ?? 60;
  const isHighLeadership = leadership >= threshold;
  const isHighStrength = strength >= threshold;
  const isHighIntel = intel >= threshold;

  const count = [isHighLeadership, isHighStrength, isHighIntel].filter(Boolean).length;

  if (count === 3) return "만능";
  if (count === 2) {
    if (!isHighLeadership) return "무지";
    if (!isHighStrength) return "지장";
    if (!isHighIntel) return "용장";
  }
  if (count === 1) {
    if (isHighLeadership) return "통장";
    if (isHighStrength) return "무장";
    if (isHighIntel) return "책사";
  }
  return "졸장";
}

/**
 * Format city name (태수 도시 표시용)
 */
function formatCityName(
  target: { city?: number } | number,
  gameConstStore: GameConstStore
): string {
  const cityId = typeof target === "number" ? target : target.city;
  if (!cityId) return "";
  const city = gameConstStore.cityConst[cityId];
  return city?.name ?? `도시${cityId}`;
}

/**
 * Calculate remaining exp to next level
 */
function nextExpLevelRemain(experience: number, explevel: number): [number, number] {
  // Simplified calculation - actual formula may differ
  const expPerLevel = 1000;
  const currentLevelExp = explevel * expPerLevel;
  const nextLevelExp = (explevel + 1) * expPerLevel;
  const currentProgress = experience - currentLevelExp;
  const required = nextLevelExp - currentLevelExp;
  return [Math.max(0, currentProgress), required];
}

/**
 * Format refresh score display
 */
function formatRefreshScore(score: number | undefined): string {
  if (!score) return "";
  if (score >= 10000) return "위험";
  if (score >= 5000) return "경고";
  if (score >= 1000) return "주의";
  return "";
}

// Type definitions
interface GameIActionInfo {
  value: string;
  name: string;
  info: string;
}

interface ReservedCommand {
  action: string;
}

interface GeneralData {
  name: string;
  imgsvr: number;
  picture: string;
  officerLevel: number;
  officerLevelText: string;
  officer_city?: number;
  turntime: string;
  leadership: number;
  strength: number;
  intel: number;
  leadership_exp: number;
  strength_exp: number;
  intel_exp: number;
  lbonus: number;
  injury: number;
  horse: string;
  weapon: string;
  book: string;
  item: string;
  gold: number;
  rice: number;
  crewtype: number;
  crew: number;
  personal: string;
  train: number;
  atmos: number;
  specialDomestic: string;
  specialWar: string;
  age: number;
  specage: number;
  specage2: number;
  explevel: number;
  experience: number;
  defence_train: number;
  killturn: number;
  city: number;
  refreshScore?: number;
  refreshScoreTotal?: number;
  reservedCommand?: ReservedCommand[];
}

interface TroopInfo {
  leader: {
    city: number;
    reservedCommand?: ReservedCommand[];
  };
  name: string;
}

interface NationStaticItem {
  color: string;
}

interface GameConst {
  upgradeLimit: number;
  retirementYear: number;
  chipiLimit?: number;
}

interface GameConstStore {
  gameConst: GameConst;
  cityConst: Record<number, { name: string }>;
  iActionInfo: {
    item: Record<string, GameIActionInfo>;
    crewtype: Record<number, GameIActionInfo>;
    personality: Record<string, GameIActionInfo>;
    specialDomestic: Record<string, GameIActionInfo>;
    specialWar: Record<string, GameIActionInfo>;
  };
}

interface GeneralBasicCardProps {
  general: GeneralData;
  troopInfo?: TroopInfo;
  nation: NationStaticItem;
  turnTerm: number;
  lastExecuted: Date;
  gameConstStore: GameConstStore;
  imagePath?: string;
}

const dummyInfo: GameIActionInfo = { value: "None", name: "-", info: "" };

export function GeneralBasicCard({
  general,
  troopInfo,
  nation,
  turnTerm,
  lastExecuted,
  gameConstStore,
  imagePath = "/game",
}: GeneralBasicCardProps) {
  const { gameConst, iActionInfo } = gameConstStore;
  const statUpThreshold = gameConst.upgradeLimit;

  // Get icon path
  const iconPath = general.picture
    ? `${imagePath}/general/${general.imgsvr}/${general.picture}`
    : `${imagePath}/general/default.png`;

  // Injury info
  const [injuryText, injuryColor] = formatInjury(general.injury);

  // General type call
  const generalTypeCall = formatGeneralTypeCall(
    general.leadership,
    general.strength,
    general.intel,
    gameConst
  );

  // Age color
  const retirementYear = gameConst.retirementYear;
  let ageColor = "limegreen";
  if (general.age >= retirementYear) {
    ageColor = "red";
  } else if (general.age >= retirementYear * 0.75) {
    ageColor = "yellow";
  }

  // Items
  const isValidObjKey = (key: string | number): boolean => key !== "None" && key !== "";
  const horse = isValidObjKey(general.horse) ? iActionInfo.item[general.horse] : dummyInfo;
  const weapon = isValidObjKey(general.weapon) ? iActionInfo.item[general.weapon] : dummyInfo;
  const book = isValidObjKey(general.book) ? iActionInfo.item[general.book] : dummyInfo;
  const item = isValidObjKey(general.item) ? iActionInfo.item[general.item] : dummyInfo;
  const crewtype = iActionInfo.crewtype[general.crewtype] ?? dummyInfo;
  const personal = isValidObjKey(general.personal)
    ? iActionInfo.personality[general.personal]
    : dummyInfo;

  // Special abilities
  const specialDomestic = isValidObjKey(general.specialDomestic)
    ? iActionInfo.specialDomestic[general.specialDomestic]
    : { value: "None", name: `${Math.max(general.age + 1, general.specage)}세`, info: "-" };
  const specialWar = isValidObjKey(general.specialWar)
    ? iActionInfo.specialWar[general.specialWar]
    : { value: "None", name: `${Math.max(general.age + 1, general.specage2)}세`, info: "-" };

  // Calculate next execute minute
  const parseTime = (timeStr: string): Date => new Date(timeStr);
  let turnTime = parseTime(general.turntime);
  if (turnTime.getTime() < lastExecuted.getTime()) {
    turnTime = new Date(turnTime.getTime() + turnTerm * 60000);
  }
  const nextExecuteMinute = Math.floor(
    Math.max(0, Math.min(999, (turnTime.getTime() - lastExecuted.getTime()) / 60000))
  );

  // Exp level progress
  const [expProgress, expRequired] = nextExpLevelRemain(general.experience, general.explevel);

  // Name color
  const nameColor = isBrightColor(nation.color) ? "#000" : "#fff";

  return (
    <div className="general-card-basic bg2">
      <style jsx>{`
        .general-card-basic {
          display: grid;
          grid-template-columns: 64px repeat(3, 2fr 5fr);
          grid-template-rows: repeat(9, calc(64px / 3));
          text-align: center;
          font-size: 14px;
          border-bottom: 1px solid gray;
          border-right: 1px solid gray;
        }

        .general-card-basic > div.bg1,
        .general-card-basic > .general-crew-type-icon,
        .general-card-basic > .general-icon {
          border-left: 1px solid gray;
        }

        .general-card-basic > div {
          border-top: 1px solid gray;
        }

        .general-icon {
          width: 64px;
          height: 64px;
          background-size: contain;
          background-repeat: no-repeat;
          grid-row: 1 / 4;
        }

        .general-name {
          grid-row: 1 / 2;
          grid-column: 2 / 8;
          font-weight: bold;
        }

        .general-crew-type-icon {
          width: 64px;
          height: 64px;
          background-size: contain;
          background-repeat: no-repeat;
          grid-row: 4 / 7;
        }

        .general-exp-level-bar {
          grid-column: 3 / 6;
        }

        .general-defence-train {
          grid-column: 2 / 4;
        }

        .general-troop {
          grid-column: 2 / 4;
        }

        .general-refresh-score-total {
          grid-column: 5 / 8;
        }

        .row {
          display: flex;
          gap: 0;
        }

        .col {
          flex: 1;
        }

        .align-self-center {
          align-self: center;
        }

        .d-grid {
          display: grid;
        }
      `}</style>

      {/* General Icon */}
      <div className="general-icon" style={{ backgroundImage: `url('${iconPath}')` }} />

      {/* General Name */}
      <div
        className="general-name"
        style={{
          color: nameColor,
          backgroundColor: nation.color,
        }}
      >
        {general.name} 【
        {general.officerLevel >= 2 && general.officerLevel <= 4 && general.officer_city && (
          <>{formatCityName(general.officer_city, gameConstStore)}</>
        )}
        {general.officerLevelText} | {generalTypeCall} |{" "}
        <span style={{ color: injuryColor }}>{injuryText}</span>】{" "}
        {general.turntime.substring(11, 19)}
      </div>

      {/* Leadership */}
      <div className="bg1">통솔</div>
      <div>
        <div className="row">
          <div className="col">
            <span style={{ color: injuryColor }}>{calcInjury("leadership", general)}</span>
            {general.lbonus > 0 && <span style={{ color: "cyan" }}>+{general.lbonus}</span>}
          </div>
          <div className="col align-self-center">
            <SammoBar height={10} percent={(general.leadership_exp / statUpThreshold) * 100} />
          </div>
        </div>
      </div>

      {/* Strength */}
      <div className="bg1">무력</div>
      <div>
        <div className="row">
          <div className="col" style={{ color: injuryColor }}>
            {calcInjury("strength", general)}
          </div>
          <div className="col align-self-center">
            <SammoBar height={10} percent={(general.strength_exp / statUpThreshold) * 100} />
          </div>
        </div>
      </div>

      {/* Intel */}
      <div className="bg1">지력</div>
      <div>
        <div className="row">
          <div className="col" style={{ color: injuryColor }}>
            {calcInjury("intel", general)}
          </div>
          <div className="col align-self-center">
            <SammoBar height={10} percent={(general.intel_exp / statUpThreshold) * 100} />
          </div>
        </div>
      </div>

      {/* Horse */}
      <div className="bg1">명마</div>
      <div title={horse.info || undefined}>{horse.name}</div>

      {/* Weapon */}
      <div className="bg1">무기</div>
      <div title={weapon.info || undefined}>{weapon.name}</div>

      {/* Book */}
      <div className="bg1">서적</div>
      <div title={book.info || undefined}>{book.name}</div>

      {/* Gold */}
      <div className="bg1">자금</div>
      <div>{general.gold.toLocaleString()}</div>

      {/* Rice */}
      <div className="bg1">군량</div>
      <div>{general.rice.toLocaleString()}</div>

      {/* Item */}
      <div className="bg1">도구</div>
      <div title={item.info || undefined}>{item.name}</div>

      {/* Crew Type Icon */}
      <div
        className="general-crew-type-icon"
        style={{
          backgroundImage: `url('${imagePath}/crewtype${general.crewtype}.png')`,
        }}
      />

      {/* Crew Type */}
      <div className="bg1">병종</div>
      <div title={crewtype.info || undefined}>{crewtype.name}</div>

      {/* Crew */}
      <div className="bg1">병사</div>
      <div>{general.crew.toLocaleString()}</div>

      {/* Personality */}
      <div className="bg1">성격</div>
      <div title={personal.info || undefined}>{personal.name}</div>

      {/* Train */}
      <div className="bg1">훈련</div>
      <div>{general.train}</div>

      {/* Atmos */}
      <div className="bg1">사기</div>
      <div>{general.atmos}</div>

      {/* Specials */}
      <div className="bg1">특기</div>
      <div>
        <span title={specialDomestic.info || undefined}> {specialDomestic.name}</span>
        {" / "}
        <span title={specialWar.info || undefined}> {specialWar.name}</span>
      </div>

      {/* Level */}
      <div className="bg1">Lv</div>
      <div className="general-exp-level">{general.explevel}</div>
      <div className="general-exp-level-bar d-grid">
        <div className="align-self-center">
          <SammoBar height={10} percent={(expProgress / expRequired) * 100} />
        </div>
      </div>

      {/* Age */}
      <div className="bg1">연령</div>
      <div style={{ color: ageColor }}>{general.age}세</div>

      {/* Defence */}
      <div className="bg1">수비</div>
      <div className="general-defence-train">
        {general.defence_train === 999 ? (
          <span style={{ color: "red" }}>수비 안함</span>
        ) : (
          <span style={{ color: "limegreen" }}>수비 함(훈사{general.defence_train})</span>
        )}
      </div>

      {/* Kill Turn */}
      <div className="bg1">삭턴</div>
      <div>{general.killturn} 턴</div>

      {/* Execute */}
      <div className="bg1">실행</div>
      <div>{nextExecuteMinute}분 남음</div>

      {/* Troop */}
      <div className="bg1">부대</div>
      <div className="general-troop">
        {!troopInfo ? (
          "-"
        ) : troopInfo.leader.reservedCommand &&
          troopInfo.leader.reservedCommand[0]?.action !== "che_집합" ? (
          <s style={{ color: "gray" }}>{troopInfo.name}</s>
        ) : troopInfo.leader.city === general.city ? (
          <span>{troopInfo.name}</span>
        ) : (
          <span style={{ color: "orange" }}>
            {troopInfo.name}({formatCityName(troopInfo.leader, gameConstStore)})
          </span>
        )}
      </div>

      {/* Refresh Score */}
      <div className="bg1">벌점</div>
      <div className="general-refresh-score-total">
        {formatRefreshScore(general.refreshScoreTotal)}{" "}
        {(general.refreshScoreTotal ?? 0).toLocaleString()}점(
        {general.refreshScore ?? 0})
      </div>
    </div>
  );
}
