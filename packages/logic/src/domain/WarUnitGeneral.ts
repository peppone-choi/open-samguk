import { RandUtil } from "@sammo/common";
import type { General } from "./entities.js";
import type { WarUnit, WarUnitCity, WarBattleLogEntry } from "./specials/types.js";

/**
 * WarUnit 인터페이스의 장수 구현체
 * 레거시 WarUnitGeneral.php 참조
 */
export class WarUnitGeneral implements WarUnit {
  public crew: number;
  public crewType: number;
  public train: number;
  public atmos: number;
  public dex: Record<number, number>;
  public oppose?: WarUnit | WarUnitCity;
  public battleLog: WarBattleLogEntry[] = [];
  public phase = 0;
  public warPowerMultiplier = 1.0;
  public activatedSkills = new Set<string>();

  constructor(
    public readonly general: General,
    public readonly rng: RandUtil,
    public readonly isAttacker: boolean
  ) {
    this.crew = general.crew;
    this.crewType = general.crewType;
    this.train = general.train;
    this.atmos = general.atmos;
    this.dex = { ...general.dex };
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
}
