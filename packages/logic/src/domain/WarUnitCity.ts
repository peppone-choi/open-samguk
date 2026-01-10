import { RandUtil } from "@sammo/common";
import { City, Nation } from "./entities.js";
import { GameConst } from "./GameConst.js";
import type { WarUnit, WarUnitCity as IWarUnitCity, WarBattleLogEntry } from "./specials/types.js";

/**
 * 전투 유닛(WarUnit) 인터페이스의 도시(성벽) 구현체
 * 레거시 WarUnitCity.php의 로직을 기반으로 도시 수비 측의 성벽 및 수비대 동작을 정의합니다.
 */
export class WarUnitCity implements WarUnit, IWarUnitCity {
  /** 현재 방어 수치 */
  public def: number;
  /** 현재 성벽 수치 */
  public wall: number;
  /** 현재 민심 */
  public trust: number;

  /** 수비대 병력 (방어 수치 * 10) */
  public crew: number;
  /** 병종 (항상 성벽 타입) */
  public crewType: number = GameConst.armType.CASTLE;
  /** 훈련도 (시나리오 연도에 따라 자동 계산) */
  public train: number;
  /** 사기 (시나리오 연도에 따라 자동 계산) */
  public atmos: number;
  /** 숙련도 (병종별 숙련도 맵) */
  public dex: Record<number, number>;
  /** 현재 대항 주체 (공격자) */
  public oppose?: WarUnit | IWarUnitCity;
  /** 전투 로그 엔트리 배열 */
  public battleLog: WarBattleLogEntry[] = [];
  /** 현재 전투 페이즈 */
  public phase = 0;
  /** 전투력 배율 (기본 1.0) */
  public warPowerMultiplier = 1.0;
  /** 해당 페이즈에 발동된 스킬 목록 */
  public activatedSkills = new Set<string>();

  private killed = 0;
  private dead = 0;
  private wallDamage = 0;

  constructor(
    public readonly city: City,
    public readonly nation: Nation | null,
    public readonly rng: RandUtil,
    public readonly gameYear: number,
    public readonly startYear: number
  ) {
    this.def = city.def;
    this.wall = city.wall;
    this.trust = city.trust;

    this.crew = city.def * 10;
    // 도시의 기본 훈련/사기는 시나리오 시작 시점부터 경과된 시간에 비례 (60~110 범위)
    const cityTrainAtmos = Math.min(110, Math.max(60, gameYear - startYear + 59));
    this.train = cityTrainAtmos;
    this.atmos = cityTrainAtmos;

    // 도시는 기본적으로 전투 숙련도가 높게 설정됨
    const cityDexValue = (cityTrainAtmos - 60) * 7200;
    this.dex = { [this.crewType]: cityDexValue };
  }

  /** 도시 엔티티를 장수 객체처럼 취급하기 위한 프록시 정보 */
  get general(): any {
    return { name: this.city.name, id: -this.city.id };
  }

  /** 도시는 항상 수비 측임 */
  get isAttacker(): boolean {
    return false;
  }

  getGeneral(): any {
    return this.general;
  }

  getOppose(): WarUnit | IWarUnitCity | undefined {
    return this.oppose;
  }

  /** 특정 스킬이 로그에 기록될 만큼 활성화되었는지 횟수 확인 */
  hasActivatedSkillOnLog(skillName: string): number {
    return this.battleLog.filter((entry) => entry.skillName === skillName && entry.activated)
      .length;
  }

  /** 페이즈 중 스킬 상태 활성화 */
  activateSkill(skill: string): void {
    this.activatedSkills.add(skill);
  }

  /** 페이즈 중 스킬 상태 비활성화 */
  deactivateSkill(skill: string): void {
    this.activatedSkills.delete(skill);
  }

  /** 페이즈 중 스킬 활성화 여부 확인 */
  hasActivatedSkill(skill: string): boolean {
    return this.activatedSkills.has(skill);
  }

  /** 전체 전투력 배율 조정 */
  multiplyWarPower(multiplier: number): void {
    this.warPowerMultiplier *= multiplier;
  }

  /** 도시의 공격력 산출 (수비/성벽 수치 기반) */
  getAttack(): number {
    return (this.def + this.wall * 9) / 500 + 200;
  }

  /** 도시의 방어력 산출 (수비/성벽 수치 기반) */
  getDefense(): number {
    return (this.def + this.wall * 9) / 500 + 200;
  }

  /** 도시 전투 속도 (기본값 7) */
  getSpeed(): number {
    return 7;
  }

  /** 현재 남은 수비대 규모 반환 */
  getCrew(): number {
    return this.crew;
  }

  /** 데미지를 적용하고 수비대 감소 및 성벽 피해를 계산합니다. */
  decreaseHP(damage: number): number {
    const actualDamage = Math.min(damage, this.crew);
    this.crew -= actualDamage;
    this.dead += actualDamage;
    // 성벽에 가해지는 누적 데미지 계산 (병력 데미지의 5%가 성벽 수치 감소로 이어짐)
    this.wallDamage += actualDamage / 20;
    return this.crew;
  }

  /** 상대에게 입힌 피해량을 기록합니다. */
  increaseKilled(damage: number): void {
    this.killed += damage;
  }

  /** 수비대가 전멸했는지 확인합니다. */
  canContinue(): { canContinue: boolean; noRice: boolean } {
    if (this.crew <= 0) {
      return { canContinue: false, noRice: false };
    }
    return { canContinue: true, noRice: false };
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

  /** 전투 결과를 실제 도시 엔티티에 반영하기 위한 델타 객체를 생성합니다. */
  applyToCity(): Partial<City> {
    return {
      def: Math.max(0, Math.round(this.crew / 10)),
      wall: Math.max(0, Math.round(this.city.wall - this.wallDamage)),
    };
  }

  addBattleLog(entry: WarBattleLogEntry): void {
    this.battleLog.push(entry);
  }

  setOppose(oppose: WarUnit | IWarUnitCity): void {
    this.oppose = oppose;
  }

  advancePhase(): void {
    this.phase++;
  }

  /** 매 페이즈(개별 턴) 시작 전 상태를 초기화합니다. */
  resetPhaseState(): void {
    this.activatedSkills.clear();
    this.warPowerMultiplier = 1.0;
  }
}
