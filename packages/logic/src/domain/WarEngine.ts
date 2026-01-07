import { RandUtil } from "@sammo/common";
import { WorldSnapshot, WorldDelta, General, City, Nation } from "./entities.js";
import { GameConst } from "./GameConst.js";

/**
 * 전투 상수
 */
const WarConst = {
  armperphase: 500, // 페이즈당 기본 감소 병사 수
  maxAtmosByWar: 150,
  maxTrainByWar: 110,
  defaultCityTrainAtmos: 80, // 기본 도시 훈련/사기
  minWarPower: 50, // 최소 전투력 보장
  damageVariance: 0.1, // 데미지 변동폭 (±10%)
  woundChance: 0.05, // 부상 확률
  woundMin: 10,
  woundMax: 80,
  criticalDamageMin: 1.3,
  criticalDamageMax: 2.0,
} as const;

/**
 * 전투 유닛 인터페이스
 */
export interface WarUnit {
  getId(): number;
  getName(): string;
  getHP(): number;
  getCrew(): number;
  getCrewType(): number;
  getTrain(): number;
  getAtmos(): number;
  getNationId(): number;
  getAttack(): number;
  getDefense(): number;
  getDex(crewType: number): number;
  getSpeed(): number;

  decreaseHP(damage: number): number;
  increaseKilled(damage: number): void;

  canContinue(): { canContinue: boolean; noRice: boolean };
  isFinished(): boolean;
  setFinished(): void;

  isAttacker(): boolean;

  getKilled(): number;
  getDead(): number;
}

/**
 * 전투 결과 요약
 */
export interface WarResult {
  delta: WorldDelta;
  battleLog: string[];
  victory: boolean;
  cityConquered: boolean;
  attackerKilled: number;
  attackerDead: number;
  totalDefenderKilled: number;
  totalDefenderDead: number;
}

/**
 * 장수 전투 유닛
 */
export class WarUnitGeneral implements WarUnit {
  private crew: number;
  private rice: number;
  private train: number;
  private atmos: number;
  private killed = 0;
  private dead = 0;
  private finished = false;

  constructor(
    private readonly general: General,
    private readonly nation: Nation | null,
    private readonly rng: RandUtil,
    private readonly _isAttacker: boolean
  ) {
    this.crew = general.crew;
    this.rice = general.rice;
    this.train = general.train;
    this.atmos = general.atmos;
  }

  getId(): number {
    return this.general.id;
  }
  getName(): string {
    return this.general.name;
  }
  getHP(): number {
    return this.crew;
  }
  getCrew(): number {
    return this.crew;
  }
  getCrewType(): number {
    return this.general.crewType;
  }
  getTrain(): number {
    return Math.min(this.train, WarConst.maxTrainByWar);
  }
  getAtmos(): number {
    return Math.min(this.atmos, WarConst.maxAtmosByWar);
  }
  getNationId(): number {
    return this.general.nationId || 0;
  }
  getSpeed(): number {
    // 기본 속도 7 (병종에 따라 다를 수 있음)
    return 7;
  }

  getAttack(): number {
    // 기본 공격력 100 + 기술 보너스
    const baseStat = 100;
    const techBonus = this.nation ? this.nation.tech * 0.5 : 0;
    return baseStat + techBonus;
  }

  getDefense(): number {
    // 기본 방어력 100 + 기술 보너스
    const baseStat = 100;
    const techBonus = this.nation ? this.nation.tech * 0.5 : 0;
    return baseStat + techBonus;
  }

  getDex(crewType: number): number {
    return this.general.dex[crewType] || 0;
  }

  decreaseHP(damage: number): number {
    const actualDamage = Math.min(damage, this.crew);
    this.crew -= actualDamage;
    this.dead += actualDamage;

    // 쌀 소모 (살상당 0.8~1.0% 쌀 소모)
    const riceConsumption = (actualDamage / 100) * (this._isAttacker ? 1.0 : 0.8);
    this.rice = Math.max(0, this.rice - riceConsumption);

    return this.crew;
  }

  increaseKilled(damage: number): void {
    this.killed += damage;
  }

  canContinue(): { canContinue: boolean; noRice: boolean } {
    if (this.crew <= 0) {
      return { canContinue: false, noRice: false };
    }
    if (this.rice <= this.crew / 100) {
      return { canContinue: false, noRice: true };
    }
    return { canContinue: true, noRice: false };
  }

  isFinished(): boolean {
    return this.finished;
  }
  setFinished(): void {
    this.finished = true;
  }

  isAttacker(): boolean {
    return this._isAttacker;
  }

  getKilled(): number {
    return this.killed;
  }
  getDead(): number {
    return this.dead;
  }

  getRemainingRice(): number {
    return this.rice;
  }

  getRemainingCrew(): number {
    return this.crew;
  }

  getRemainingTrain(): number {
    return this.train;
  }

  getRemainingAtmos(): number {
    return this.atmos;
  }

  applyToGeneral(): Partial<General> {
    return {
      crew: Math.round(this.crew),
      rice: Math.round(this.rice),
      train: Math.round(Math.min(this.train, WarConst.maxTrainByWar)),
      atmos: Math.round(Math.min(this.atmos, WarConst.maxAtmosByWar)),
    };
  }
}

/**
 * 도시 전투 유닛 (성벽 수비)
 */
export class WarUnitCity implements WarUnit {
  private hp: number; // def * 10
  private killed = 0;
  private dead = 0;
  private finished = false;
  private cityTrainAtmos: number;
  private wallDamage = 0;

  constructor(
    private readonly city: City,
    private readonly nation: Nation | null,
    private readonly rng: RandUtil,
    private readonly gameYear: number,
    private readonly startYear: number
  ) {
    this.hp = city.def * 10;
    // 도시 훈사: 시작년도 기준 60~110
    this.cityTrainAtmos = Math.min(110, Math.max(60, gameYear - startYear + 59));
  }

  getId(): number {
    return this.city.id;
  }
  getName(): string {
    return this.city.name;
  }
  getHP(): number {
    return this.hp;
  }
  getCrew(): number {
    return this.hp;
  }
  getCrewType(): number {
    return GameConst.armType.CASTLE;
  }
  getTrain(): number {
    return this.cityTrainAtmos;
  }
  getAtmos(): number {
    return this.cityTrainAtmos;
  }
  getNationId(): number {
    return this.city.nationId || 0;
  }
  getSpeed(): number {
    return 7;
  }

  getAttack(): number {
    // 도시 공격력: (def + wall*9) / 500 + 200
    return (this.city.def + this.city.wall * 9) / 500 + 200;
  }

  getDefense(): number {
    // 도시 방어력: (def + wall*9) / 500 + 200
    return (this.city.def + this.city.wall * 9) / 500 + 200;
  }

  getDex(crewType: number): number {
    // 도시 숙련도: (훈사 - 60) * 7200
    return (this.cityTrainAtmos - 60) * 7200;
  }

  decreaseHP(damage: number): number {
    const actualDamage = Math.min(damage, this.hp);
    this.hp -= actualDamage;
    this.dead += actualDamage;
    // 성벽 손상
    this.wallDamage += actualDamage / 20;
    return this.hp;
  }

  increaseKilled(damage: number): void {
    this.killed += damage;
  }

  canContinue(): { canContinue: boolean; noRice: boolean } {
    if (this.hp <= 0) {
      return { canContinue: false, noRice: false };
    }
    return { canContinue: true, noRice: false };
  }

  isFinished(): boolean {
    return this.finished;
  }
  setFinished(): void {
    this.finished = true;
  }

  isAttacker(): boolean {
    return false;
  }

  getKilled(): number {
    return this.killed;
  }
  getDead(): number {
    return this.dead;
  }

  getWallDamage(): number {
    return this.wallDamage;
  }

  applyToCity(): Partial<City> {
    return {
      def: Math.max(0, Math.round(this.hp / 10)),
      wall: Math.max(0, Math.round(this.city.wall - this.wallDamage)),
    };
  }
}

/**
 * 숙련도 로그 함수 (dex log)
 */
function getDexLog(attDex: number, defDex: number): number {
  const ratio = (attDex + 1000) / (defDex + 1000);
  // 로그 스케일로 보정 (레거시와 동일)
  return Math.pow(ratio, 0.15);
}

/**
 * 전투력 계산
 */
function computeWarPower(
  rng: RandUtil,
  attacker: WarUnit,
  defender: WarUnit
): { attackerPower: number; defenderPower: number } {
  const attAttack = attacker.getAttack();
  const defDefense = defender.getDefense();

  // 기본 전투력: armperphase + 공격력 - 방어력
  let warPower = WarConst.armperphase + attAttack - defDefense;

  // 최소 전투력 보장
  if (warPower < 100) {
    warPower = Math.max(0, warPower);
    warPower = (warPower + 100) / 2;
    warPower = rng.nextRangeInt(Math.round(warPower), 100);
  }

  // 사기 / 훈련 보정
  warPower *= attacker.getAtmos() / 100;
  warPower /= defender.getTrain() / 100;

  // 숙련도 보정
  const attDex = attacker.getDex(attacker.getCrewType());
  const defDex = defender.getDex(attacker.getCrewType());
  warPower *= getDexLog(attDex, defDex);

  // 수비측 전투력 계산 (반대 방향)
  let defWarPower = WarConst.armperphase + defender.getAttack() - attacker.getDefense();

  if (defWarPower < 100) {
    defWarPower = Math.max(0, defWarPower);
    defWarPower = (defWarPower + 100) / 2;
    defWarPower = rng.nextRangeInt(Math.round(defWarPower), 100);
  }

  defWarPower *= defender.getAtmos() / 100;
  defWarPower /= attacker.getTrain() / 100;

  const defAttDex = defender.getDex(defender.getCrewType());
  const attDefDex = attacker.getDex(defender.getCrewType());
  defWarPower *= getDexLog(defAttDex, attDefDex);

  return { attackerPower: warPower, defenderPower: defWarPower };
}

/**
 * 데미지 계산 (변동폭 적용)
 */
function calcDamage(rng: RandUtil, warPower: number): number {
  const variance = rng.nextRange(1 - WarConst.damageVariance, 1 + WarConst.damageVariance);
  return Math.round(warPower * variance);
}

/**
 * 수비 순서 점수 계산
 */
function extractBattleOrder(defender: General): number {
  if (defender.crew === 0) return 0;
  if (defender.rice <= defender.crew / 100) return 0;
  if (defender.train < defender.defenceTrain) return 0;
  if (defender.atmos < defender.defenceTrain) return 0;

  const totalStat = defender.leadership + defender.strength + defender.intel;
  const crewScore = (defender.crew / 1000000) * Math.pow(defender.train * defender.atmos, 1.5);

  return totalStat + crewScore / 100;
}

/**
 * 전투 엔진
 * 레거시: processWar_NG 로직의 TS 이식판
 */
export class WarEngine {
  /**
   * 공격 전투 실행
   */
  public executeBattle(
    rng: RandUtil,
    snapshot: WorldSnapshot,
    attackerId: number,
    destCityId: number
  ): WarResult {
    const battleLog: string[] = [];
    const delta: WorldDelta = {
      generals: {},
      nations: {},
      cities: {},
      logs: { general: {}, global: [] },
    };

    const attacker = snapshot.generals[attackerId];
    const city = snapshot.cities[destCityId];

    if (!attacker || !city) {
      return {
        delta,
        battleLog: ["전투 대상을 찾을 수 없습니다."],
        victory: false,
        cityConquered: false,
        attackerKilled: 0,
        attackerDead: 0,
        totalDefenderKilled: 0,
        totalDefenderDead: 0,
      };
    }

    const attackerNation = attacker.nationId ? snapshot.nations[attacker.nationId] : null;
    const defenderNation = city.nationId ? snapshot.nations[city.nationId] : null;

    const gameYear = snapshot.gameTime.year;
    const startYear = snapshot.env.startyear || 184;

    // 공격자 유닛 생성
    const attackerUnit = new WarUnitGeneral(attacker, attackerNation, rng, true);

    // 수비자 목록 생성 (해당 도시의 장수들)
    const defenderGenerals = Object.values(snapshot.generals).filter(
      (g) => g.cityId === city.id && g.nationId === city.nationId && g.id !== attackerId
    );

    // 수비 순서로 정렬 (높은 순)
    const sortedDefenders = defenderGenerals
      .map((g) => ({ general: g, order: extractBattleOrder(g) }))
      .filter((d) => d.order > 0)
      .sort((a, b) => b.order - a.order);

    // 도시 유닛 생성 (수비자가 없거나 모두 격파 후 공성)
    const cityUnit = new WarUnitCity(city, defenderNation, rng, gameYear, startYear);

    battleLog.push(`${attacker.name} 부대가 ${city.name} 성을 공격합니다!`);

    // 전투 변수
    let phase = 0;
    const maxPhase = attackerUnit.getSpeed();
    let defenderIdx = 0;
    let currentDefender: WarUnit | null = null;
    let cityConquered = false;
    let totalDefenderKilled = 0;
    let totalDefenderDead = 0;

    // 다음 수비자 가져오기
    const getNextDefender = (): WarUnit | null => {
      if (defenderIdx < sortedDefenders.length) {
        const d = sortedDefenders[defenderIdx++];
        return new WarUnitGeneral(d.general, defenderNation, rng, false);
      }
      return null;
    };

    currentDefender = getNextDefender();

    // 전투 루프
    while (phase < maxPhase) {
      // 수비자가 없으면 도시 공성
      if (currentDefender === null) {
        currentDefender = cityUnit;
        battleLog.push(`${attacker.name}이(가) 성벽을 공격합니다.`);
      }

      // 전투력 계산
      const { attackerPower, defenderPower } = computeWarPower(rng, attackerUnit, currentDefender);

      // 데미지 계산
      let damageToDefender = calcDamage(rng, attackerPower);
      let damageToAttacker = calcDamage(rng, defenderPower);

      const attackerHP = attackerUnit.getHP();
      const defenderHP = currentDefender.getHP();

      // 병력 부족시 데미지 조정
      if (damageToAttacker > attackerHP || damageToDefender > defenderHP) {
        const attackerRatio = damageToAttacker / Math.max(1, attackerHP);
        const defenderRatio = damageToDefender / Math.max(1, defenderHP);

        if (defenderRatio > attackerRatio) {
          damageToAttacker = Math.round(damageToAttacker / defenderRatio);
          damageToDefender = defenderHP;
        } else {
          damageToDefender = Math.round(damageToDefender / attackerRatio);
          damageToAttacker = attackerHP;
        }
      }

      damageToAttacker = Math.min(Math.ceil(damageToAttacker), attackerHP);
      damageToDefender = Math.min(Math.ceil(damageToDefender), defenderHP);

      // 데미지 적용
      attackerUnit.decreaseHP(damageToAttacker);
      currentDefender.decreaseHP(damageToDefender);

      attackerUnit.increaseKilled(damageToDefender);
      currentDefender.increaseKilled(damageToAttacker);

      battleLog.push(
        `${phase + 1}페: ${attackerUnit.getName()} ${attackerUnit.getHP()}(-${damageToAttacker}) vs ${currentDefender.getName()} ${currentDefender.getHP()}(-${damageToDefender})`
      );

      phase++;

      // 공격자 계속 전투 가능 여부
      const attackerStatus = attackerUnit.canContinue();
      if (!attackerStatus.canContinue) {
        if (attackerStatus.noRice) {
          battleLog.push(`${attacker.name} 군량 부족으로 퇴각합니다.`);
        } else {
          battleLog.push(`${attacker.name} 부대가 전멸했습니다.`);
        }
        break;
      }

      // 수비자 계속 전투 가능 여부
      const defenderStatus = currentDefender.canContinue();
      if (!defenderStatus.canContinue) {
        totalDefenderKilled += currentDefender.getKilled();
        totalDefenderDead += currentDefender.getDead();

        if (currentDefender instanceof WarUnitCity) {
          // 도시 점령 성공
          battleLog.push(`${city.name} 성을 점령하였습니다!`);
          cityConquered = true;
          break;
        } else if (currentDefender instanceof WarUnitGeneral) {
          if (defenderStatus.noRice) {
            battleLog.push(`${currentDefender.getName()} 군량 부족으로 패퇴했습니다.`);
          } else {
            battleLog.push(`${currentDefender.getName()} 부대가 전멸했습니다.`);
          }

          // 다음 수비자
          currentDefender.setFinished();
          currentDefender = getNextDefender();
        }
      }
    }

    // 전투 종료 - 도시를 점령하지 못했으면 퇴각
    if (!cityConquered && phase >= maxPhase) {
      battleLog.push("공격 페이즈가 종료되어 퇴각합니다.");
    }

    // 델타 생성
    // 1. 공격자 상태 업데이트
    delta.generals![attackerId] = attackerUnit.applyToGeneral();

    // 3. 도시 상태 업데이트
    if (cityUnit.getDead() > 0 || cityConquered) {
      const cityDelta = cityUnit.applyToCity();

      if (cityConquered) {
        // 점령 시 도시 소속 변경
        cityDelta.nationId = attacker.nationId;
        cityDelta.supply = 1;

        // 내정 감소
        const currentAgri = city.agri;
        const currentComm = city.comm;
        const currentSecu = city.secu;
        cityDelta.agri = Math.round(currentAgri * 0.7);
        cityDelta.comm = Math.round(currentComm * 0.7);
        cityDelta.secu = Math.round(currentSecu * 0.7);
      }

      delta.cities![city.id] = cityDelta;
    }

    // 4. 국가 기술 증가
    if (attackerNation) {
      const attackerIncTech = attackerUnit.getDead() * 0.012;
      delta.nations![attackerNation.id] = {
        tech:
          attackerNation.tech +
          attackerIncTech / Math.max(GameConst.initialNationGenLimit, attackerNation.gennum),
      };
    }

    if (defenderNation && totalDefenderDead > 0) {
      const defenderIncTech = attackerUnit.getKilled() * 0.009;
      const existingNationDelta = delta.nations![defenderNation.id] || {};
      delta.nations![defenderNation.id] = {
        ...existingNationDelta,
        tech:
          defenderNation.tech +
          defenderIncTech / Math.max(GameConst.initialNationGenLimit, defenderNation.gennum),
      };
    }

    return {
      delta,
      battleLog,
      victory: cityConquered,
      cityConquered,
      attackerKilled: attackerUnit.getKilled(),
      attackerDead: attackerUnit.getDead(),
      totalDefenderKilled,
      totalDefenderDead,
    };
  }
}
