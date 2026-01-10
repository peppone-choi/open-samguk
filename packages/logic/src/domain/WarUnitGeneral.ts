import { RandUtil } from "@sammo/common";
import type { General, Nation } from "./entities.js";
import type { WarUnit, WarUnitCity, WarBattleLogEntry } from "./specials/types.js";
import { WarStatHelper } from "./WarStatHelper.js";
import { UnitRegistry } from "./UnitRegistry.js";
import type { UnitData } from "./scenario/schema.js";

/**
 * 전투 유닛(WarUnit) 인터페이스의 장수 구현체
 * 레거시 WarUnitGeneral.php 실장 로직을 바탕으로 전투 중인 장수의 상태와 행동을 관리합니다.
 */
export class WarUnitGeneral implements WarUnit {
  /** 현재 부대 병력 */
  public crew: number;
  /** 병종 코드 */
  public crewType: number;
  private _train: number;
  private _atmos: number;
  /** 병종별 숙련도 맵 */
  public dex: Record<number, number>;
  /** 현재 대항 주체 (상대 장수 또는 성벽) */
  public oppose?: WarUnit | WarUnitCity;
  /** 개별 페이즈 전투 로그 */
  public battleLog: WarBattleLogEntry[] = [];
  /** 현재 전투 페이즈 */
  public phase = 0;
  /** 전투력 보정 배율 (버프/디버프 합산) */
  public warPowerMultiplier = 1.0;
  /** 현재 페이즈에서 활성화된 스킬/트리거 목록 */
  public activatedSkills = new Set<string>();

  /** 장수가 소지한 군량 (전투 중 소모됨) */
  public rice: number;
  /** 상대에게 입힌 살상수 */
  public killed = 0;
  /** 자신이 입은 피해(사망자 수) */
  public dead = 0;
  /** 전투 종료 여부 */
  public finished = false;
  /** 병종 정적 데이터 */
  public unitData?: UnitData;
  /** 아이템이나 특기에 의한 추가 공격 횟수/속도 */
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
    // 유닛 레지스트리에서 해당 병종의 상세 데이터를 가져옴
    this.unitData = UnitRegistry.getInstance().getUnit(this.crewType)?.unitData;
  }

  /** 아이템 및 상대방 디버프가 반영된 실시간 훈련도 산출 */
  get train(): number {
    let val = this._train;
    val = WarStatHelper.calcStat(this, "bonusTrain", val, { isAttacker: this.isAttacker });
    return val;
  }

  set train(val: number) {
    this._train = val;
  }

  /** 아이템 및 상대방 디버프가 반영된 실시간 사기치 산출 */
  get atmos(): number {
    let val = this._atmos;
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

  /** 특정 스킬의 로그 기록 횟수 확인 */
  hasActivatedSkillOnLog(skillName: string): number {
    return this.battleLog.filter((entry) => entry.skillName === skillName && entry.activated)
      .length;
  }

  getCrew(): number {
    return this.crew;
  }

  /** 
   * 데미지를 적용하고 병력 감소 및 군량 소모를 처리합니다.
   * 군량 소모는 살상량에 비례하며 공격자가 수비자보다 더 많이 소모합니다.
   */
  decreaseHP(damage: number): number {
    const actualDamage = Math.min(damage, this.crew);
    this.crew -= actualDamage;
    this.dead += actualDamage;

    // 전투 중 군량 소모 로직 (살상당 특정 비율로 소모)
    const riceConsumption = (actualDamage / 100) * (this.isAttacker ? 1.0 : 0.8);
    this.rice = Math.max(0, this.rice - riceConsumption);

    return this.crew;
  }

  increaseKilled(damage: number): void {
    this.killed += damage;
  }

  /** 
   * 현재 부대가 계속 전투를 수행할 수 있는지 확인합니다.
   * 병력이 전멸했거나 군량이 바닥나면(병력의 1% 미만) 전투 불능 상태가 됩니다.
   */
  canContinue(): { canContinue: boolean; noRice: boolean } {
    if (this.crew <= 0) {
      return { canContinue: false, noRice: false };
    }
    if (this.rice <= this.crew / 100) {
      return { canContinue: false, noRice: true };
    }
    return { canContinue: true, noRice: false };
  }

  /** 기초 공격력 계산 (기본값 + 국가 기술력 보너스) */
  getAttack(): number {
    const baseStat = 100;
    const techBonus = this.nation ? this.nation.tech * 0.5 : 0;
    return baseStat + techBonus;
  }

  /** 기초 방어력 계산 (기본값 + 국가 기술력 보너스) */
  getDefense(): number {
    const baseStat = 100;
    const techBonus = this.nation ? this.nation.tech * 0.5 : 0;
    return baseStat + techBonus;
  }

  /** 전투 페이즈 속도 (기본 7 + 추가 보정) */
  getSpeed(): number {
    return 7 + this.extraSpeed;
  }

  /** 속도(공격 횟수 등) 보정치 추가 */
  addSpeed(speed: number): void {
    this.extraSpeed += speed;
  }

  /** 스킬 상태 활성화 */
  activateSkill(skill: string): void {
    this.activatedSkills.add(skill);
  }

  /** 스킬 상태 비활성화 */
  deactivateSkill(skill: string): void {
    this.activatedSkills.delete(skill);
  }

  /** 스킬 활성화 여부 확인 */
  hasActivatedSkill(skill: string): boolean {
    return this.activatedSkills.has(skill);
  }

  /** 전체 전투력 배율에 곱연산 적용 */
  multiplyWarPower(multiplier: number): void {
    this.warPowerMultiplier *= multiplier;
  }

  getKilled(): number {
    return this.killed;
  }

  getDead(): number {
    return this.dead;
  }

  addBattleLog(entry: WarBattleLogEntry): void {
    this.battleLog.push(entry);
  }

  setOppose(oppose: WarUnit | WarUnitCity): void {
    this.oppose = oppose;
  }

  advancePhase(): void {
    this.phase++;
  }

  /** 매 페이즈 시작 전 상태를 초기화합니다. */
  resetPhaseState(): void {
    this.activatedSkills.clear();
    this.warPowerMultiplier = 1.0;
  }

  /** 전투 종료 후 변경된 수치를 장수 엔티티의 델타 형식으로 반환합니다. */
  applyToGeneral(): Partial<General> {
    return {
      crew: Math.round(this.crew),
      rice: Math.round(this.rice),
      train: Math.round(Math.min(this.train, 110)),
      atmos: Math.round(Math.min(this.atmos, 150)),
    };
  }
}
