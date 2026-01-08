import { RandUtil } from "@sammo/common";
import type { General, Nation } from "./entities.js";
import type { WarUnit, WarUnitCity, WarBattleLogEntry } from "./specials/types.js";
import { WarStatHelper } from "./WarStatHelper.js";
import { UnitRegistry } from "./UnitRegistry.js";
import type { UnitData } from "./scenario/schema.js";

/**
 * WarUnit 인터페이스의 장수 구현체
 * 레거시 WarUnitGeneral.php 참조
 */
export class WarUnitGeneral implements WarUnit {
  public crew: number;
  public crewType: number;
  private _train: number;
  private _atmos: number;
  public dex: Record<number, number>;
  public oppose?: WarUnit | WarUnitCity;
  public battleLog: WarBattleLogEntry[] = [];
  public phase = 0;
  public warPowerMultiplier = 1.0;
  public activatedSkills = new Set<string>();

  public rice: number;
  public killed = 0;
  public dead = 0;
  public finished = false;
  public unitData?: UnitData;
  private extraSpeed = 0;

  constructor(
    public readonly general: General,
    public readonly rng: RandUtil,
    public readonly isAttacker: boolean,
    public readonly nation: Nation | null = null
  ) {
    this.crew = general.crew;
    this.rice = general.rice;
    this.crewType = general.crewType;
    this._train = general.train;
    this._atmos = general.atmos;
    this.dex = { ...general.dex };
    this.unitData = UnitRegistry.getInstance().getUnit(this.crewType)?.unitData;
  }

  get train(): number {
    let val = this._train;
    // 아이템/상대방 보정 적용
    val = WarStatHelper.calcStat(this, "bonusTrain", val, { isAttacker: this.isAttacker });
    return val;
  }

  set train(val: number) {
    this._train = val;
  }

  get atmos(): number {
    let val = this._atmos;
    // 아이템/상대방 보정 적용
    val = WarStatHelper.calcStat(this, "bonusAtmos", val, { isAttacker: this.isAttacker });
    return val;
  }

  set atmos(val: number) {
    this._atmos = val;
  }

  getGeneral(): General {
    return this.general;
  }

  getOppose(): WarUnit | WarUnitCity | undefined {
    return this.oppose;
  }

  hasActivatedSkillOnLog(skillName: string): number {
    return this.battleLog.filter((entry) => entry.skillName === skillName && entry.activated)
      .length;
  }

  getCrew(): number {
    return this.crew;
  }

  decreaseHP(damage: number): number {
    const actualDamage = Math.min(damage, this.crew);
    this.crew -= actualDamage;
    this.dead += actualDamage;

    // 쌀 소모 (살상당 0.8~1.0% 쌀 소모)
    const riceConsumption = (actualDamage / 100) * (this.isAttacker ? 1.0 : 0.8);
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

  getSpeed(): number {
    return 7 + this.extraSpeed;
  }

  addSpeed(speed: number): void {
    this.extraSpeed += speed;
  }

  /**
   * 스킬 활성화
   */
  activateSkill(skill: string): void {
    this.activatedSkills.add(skill);
  }

  /**
   * 스킬 비활성화
   */
  deactivateSkill(skill: string): void {
    this.activatedSkills.delete(skill);
  }

  /**
   * 스킬 활성화 여부 확인
   */
  hasActivatedSkill(skill: string): boolean {
    return this.activatedSkills.has(skill);
  }

  /**
   * 전투력 배수 적용
   */
  multiplyWarPower(multiplier: number): void {
    this.warPowerMultiplier *= multiplier;
  }

  /**
   * 결과 조회
   */
  getKilled(): number {
    return this.killed;
  }

  getDead(): number {
    return this.dead;
  }

  /**
   * 전투 로그 추가
   */
  addBattleLog(entry: WarBattleLogEntry): void {
    this.battleLog.push(entry);
  }

  /**
   * 상대 유닛 설정
   */
  setOppose(oppose: WarUnit | WarUnitCity): void {
    this.oppose = oppose;
  }

  /**
   * 페이즈 진행
   */
  advancePhase(): void {
    this.phase++;
  }

  /**
   * 스킬 및 상태 초기화 (페이즈 시작 시)
   */
  resetPhaseState(): void {
    this.activatedSkills.clear();
    this.warPowerMultiplier = 1.0;
  }

  applyToGeneral(): Partial<General> {
    return {
      crew: Math.round(this.crew),
      rice: Math.round(this.rice),
      train: Math.round(Math.min(this.train, 110)),
      atmos: Math.round(Math.min(this.atmos, 150)),
    };
  }
}
