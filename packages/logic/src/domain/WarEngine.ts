import { RandUtil } from "@sammo/common";
import { WorldSnapshot, WorldDelta, General, City, Nation } from "./entities.js";
import { WarUnitGeneral } from "./WarUnitGeneral.js";
import { WarUnitCity } from "./WarUnitCity.js";
import { WarUnitTriggerRegistry, RaiseType } from "./WarUnitTriggerRegistry.js";
import type { WarUnit, WarUnitCity as IWarUnitCity } from "./specials/types.js";
import { getItemRegistry } from "./items/ItemRegistry.js";
import { StatMultiplierTrigger } from "./triggers/war/index.js";
import { SpecialityHelper } from "./specials/SpecialityHelper.js";
import { UnitAbilityRegistry } from "./UnitAbilityRegistry.js";

/**
 * 전투 상수
 */
const WarConst = {
  armperphase: 500, // 페이즈당 기본 감소 병사 수
  maxAtmosByWar: 150,
  maxTrainByWar: 110,
  damageVariance: 0.1, // 데미지 변동폭 (±10%)
} as const;

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
 * 전투 시뮬레이션 엔진
 * 레거시 WarEngine.php를 TypeScript로 포팅하여 결정론적 전투 결과를 계산합니다.
 */
export class WarEngine {
  /**
   * 전투를 실행하고 결과를 요약하여 반환합니다.
   *
   * @param rng 난수 생성기 (결정론적 결과를 위해 필수)
   * @param snapshot 월드 스냅샷 (장수, 도시, 국가 정보)
   * @param attackerId 공격자 장수 ID
   * @param cityId 대상 도시 ID (수비측)
   * @returns 전투 결과 및 발생한 상태 변경 델타
   */
  public execute(
    rng: RandUtil,
    snapshot: WorldSnapshot,
    attackerId: number,
    cityId: number
  ): WarResult {
    const attackerGeneral = snapshot.generals[attackerId];
    const city = snapshot.cities[cityId];
    const attackerNation = snapshot.nations[attackerGeneral.nationId];
    const defenderNation = city.nationId ? snapshot.nations[city.nationId] : null;

    if (!attackerGeneral || !city) {
      throw new Error("장수 또는 도시 정보를 찾을 수 없습니다.");
    }

    const battleLog: string[] = [];
    const gameYear = snapshot.gameTime.year;
    const startYear = snapshot.env.startyear || 184;

    // 공격자 유닛(WarUnit) 초기화
    const attacker = new WarUnitGeneral(attackerGeneral, rng, true, attackerNation);

    // 수비 도시의 수비 장수 목록 필터링 (공격자 제외, 같은 도시/국가 장수)
    const defenderGenerals = Object.values(snapshot.generals).filter(
      (g) => g.cityId === city.id && g.nationId === city.nationId && g.id !== attackerId
    );

    // 전투 순번(추장 관직 등)에 따라 수비군 정렬
    const sortedDefenders = defenderGenerals
      .map((g) => ({ general: g, order: extractBattleOrder(g) }))
      .filter((d) => d.order > 0)
      .sort((a, b) => b.order - a.order);

    // 도시 성벽/수비대 유닛 생성
    const cityUnit = new WarUnitCity(city, defenderNation, rng, gameYear, startYear);

    battleLog.push(`${attackerGeneral.name} 부대가 ${city.name} 성을 공격합니다!`);

    let phase = 0;
    let cityConquered = false;
    const allDeltas: WorldDelta[] = [];
    let totalDefenderKilled = 0;
    let totalDefenderDead = 0;

    // 수비 장수들과 순차적으로 대결
    for (const defenderData of sortedDefenders) {
      const defender = new WarUnitGeneral(defenderData.general, rng, false, defenderNation);
      const registry = new WarUnitTriggerRegistry();

      // 상대 유닛 설정
      attacker.setOppose(defender);
      defender.setOppose(attacker);

      // 아이템, 특기, 병종 등의 전투 트리거 등록
      this.registerUnitTriggers(attacker, registry);
      this.registerUnitTriggers(defender, registry);

      // 전투 루프 (최대 100페이즈 제한)
      while (phase < 100) {
        phase++;
        attacker.phase = phase;
        defender.phase = phase;

        attacker.resetPhaseState();
        defender.resetPhaseState();

        // 트리거 발동 (필살기, 회피 등 스킬 로직)
        const { deltas, stopped } = registry.fire(attacker, defender, rng, phase);
        for (const d of deltas) {
          if (d) {
            allDeltas.push(d);
            if (d.logs?.global) {
              battleLog.push(...d.logs.global);
            }
          }
        }

        // 기본 전투력 계산 및 데미지 적용
        const { attackerPower, defenderPower } = computeWarPower(rng, attacker, defender);

        const attackerDamage = calcDamage(rng, defenderPower);
        const defenderDamage = calcDamage(rng, attackerPower);

        attacker.decreaseHP(attackerDamage);
        defender.decreaseHP(defenderDamage);

        attacker.increaseKilled(defenderDamage);
        defender.increaseKilled(attackerDamage);

        // 퇴각 또는 괴멸 여부 체크
        const attStatus = attacker.canContinue();
        const defStatus = defender.canContinue();

        if (!attStatus.canContinue || !defStatus.canContinue || stopped) {
          break;
        }
      }

      totalDefenderKilled += defender.getKilled();
      totalDefenderDead += defender.getDead();

      // 공격자가 패배하면 다음 수비군과의 전투 중단
      if (!attacker.canContinue().canContinue) break;
    }

    // 성벽과 전투 (수비 장수를 모두 이겼거나 수비군이 없는 경우)
    if (attacker.canContinue().canContinue) {
      attacker.setOppose(cityUnit);
      cityUnit.setOppose(attacker);

      const registry = new WarUnitTriggerRegistry();
      this.registerUnitTriggers(attacker, registry);

      while (phase < 100) {
        phase++;
        attacker.phase = phase;
        cityUnit.phase = phase;

        attacker.resetPhaseState();

        const { deltas, stopped } = registry.fire(attacker, cityUnit as any, rng, phase);
        for (const d of deltas) {
          if (d) {
            allDeltas.push(d);
            if (d.logs?.global) {
              battleLog.push(...d.logs.global);
            }
          }
        }

        const { attackerPower, defenderPower } = computeWarPower(rng, attacker, cityUnit);
        const attackerDamage = calcDamage(rng, defenderPower);
        const cityDamage = calcDamage(rng, attackerPower);

        attacker.decreaseHP(attackerDamage);
        cityUnit.decreaseHP(cityDamage);

        attacker.increaseKilled(cityDamage);
        if (cityUnit.getCrew() <= 0) {
          // 성벽 파괴 및 점령 성공
          cityConquered = true;
          break;
        }

        if (!attacker.canContinue().canContinue || stopped) break;
      }
    }

    return {
      delta: this.mergeDeltas(
        allDeltas,
        attacker,
        cityUnit,
        attackerNation,
        defenderNation,
        cityConquered
      ),
      battleLog,
      victory: cityConquered,
      cityConquered,
      attackerKilled: attacker.getKilled(),
      attackerDead: attacker.getDead(),
      totalDefenderKilled,
      totalDefenderDead,
    };
  }

  /**
   * 장수가 보유한 아이템, 특기, 병종 어빌리티에 따른 전투 트리거를 등록합니다.
   */
  private registerUnitTriggers(unit: WarUnit, registry: WarUnitTriggerRegistry): void {
    const g = unit.general;
    if (g.id > 0) {
      const reg = getItemRegistry();
      // 장착 아이템 트리거 등록 (무기, 명마, 서적, 보물)
      for (const itemCode of [g.weapon, g.horse, g.book, g.item]) {
        if (!itemCode) continue;
        const item = reg.create(itemCode);
        if (item) {
          if (item.getBattleInitSkillTriggerList) {
            const triggers = item.getBattleInitSkillTriggerList(unit);
            if (triggers) registry.registerMany(...triggers.getTriggers());
          }
          if (item.getBattlePhaseSkillTriggerList) {
            const triggers = item.getBattlePhaseSkillTriggerList(unit);
            if (triggers) registry.registerMany(...triggers.getTriggers());
          }
          // 아이템에 의한 상시 공격력/방어력 비율 보정
          registry.register(
            new StatMultiplierTrigger(
              unit,
              (u: WarUnit) => item.getWarPowerMultiplier(u),
              RaiseType.ITEM
            )
          );

          // 스탯 보정 적용 (예: 초기 페이즈 가속)
          if (unit instanceof WarUnitGeneral) {
            const extraPhase = item.onCalcStat(unit.general, "initWarPhase", 0);
            if (extraPhase > 0) {
              unit.addSpeed(extraPhase);
            }
          }
        }
      }

      // 전투 특기(Speciality) 트리거 등록
      if (g.special2) {
        const special = SpecialityHelper.getWarSpecial(g.special2);
        if (special) {
          if (special.getBattleInitSkillTriggerList) {
            const triggers = special.getBattleInitSkillTriggerList(unit);
            if (triggers) registry.registerMany(...triggers.getTriggers());
          }
          if (special.getBattlePhaseSkillTriggerList) {
            const triggers = special.getBattlePhaseSkillTriggerList(unit);
            if (triggers) registry.registerMany(...triggers.getTriggers());
          }

          // 특기에 의한 상시 배율 보정
          registry.register(
            new StatMultiplierTrigger(
              unit,
              (u: WarUnit) => special.getWarPowerMultiplier(u),
              RaiseType.SPECIAL
            )
          );
        }
      }
    }

    // 병종(CrewType) 고유 어빌리티 및 트리거 등록
    const unitTriggers = UnitAbilityRegistry.getTriggersForUnit(unit);
    if (unitTriggers.length > 0) {
      registry.registerMany(...unitTriggers);
    }
  }

  /**
   * 전투 중 발생한 여러 델타들을 하나로 병합하고 최종 결과를 반영합니다.
   */
  private mergeDeltas(
    deltas: WorldDelta[],
    attacker: WarUnitGeneral,
    cityUnit: WarUnitCity,
    attNation: Nation | null,
    _defNation: Nation | null,
    conquered: boolean
  ): WorldDelta {
    const finalDelta: WorldDelta = {
      generals: { [attacker.general.id]: attacker.applyToGeneral() },
      cities: { [cityUnit.city.id]: cityUnit.applyToCity() },
      nations: {},
      logs: { general: {}, global: [] },
    };

    // 도시 함락 시 처리 (통치 국가 변경 및 내정 수치 감소)
    if (conquered) {
      const cityDelta = finalDelta.cities![cityUnit.city.id];
      cityDelta.nationId = attacker.general.nationId;
      cityDelta.supply = 1;
      cityDelta.agri = Math.round(cityUnit.city.agri * 0.7);
      cityDelta.comm = Math.round(cityUnit.city.comm * 0.7);
      cityDelta.secu = Math.round(cityUnit.city.secu * 0.7);
    }

    // 각 트리거에서 발생한 델타 병합
    for (const d of deltas) {
      if (d.generals) {
        for (const [id, g] of Object.entries(d.generals)) {
          finalDelta.generals![Number(id)] = { ...finalDelta.generals![Number(id)], ...g };
        }
      }
      if (d.cities) {
        for (const [id, c] of Object.entries(d.cities)) {
          finalDelta.cities![Number(id)] = { ...finalDelta.cities![Number(id)], ...c };
        }
      }
    }
    return finalDelta;
  }
}

/**
 * 기본 전투력 계산 로직
 * 장수의 스탯, 병종 상성, 숙련도, 사기, 훈련도 등을 종합하여 페이즈별 전투력을 산출합니다.
 *
 * @param rng 난수 생성기
 * @param attacker 공격 측 유닛
 * @param defender 수비 측 유닛
 * @returns { attackerPower, defenderPower }
 */
function computeWarPower(
  rng: RandUtil,
  attacker: WarUnit,
  defender: WarUnit
): { attackerPower: number; defenderPower: number } {
  const attAttack = attacker.getAttack();
  const defDefense = defender.getDefense();

  // 1. 기본 전투력: 기본 감소치 + 공격력 - 방어력
  let warPower = WarConst.armperphase + attAttack - defDefense;

  // 2. 최소 전투력 보정 (너무 낮은 데미지 방지)
  if (warPower < 100) {
    warPower = Math.max(0, warPower);
    warPower = (warPower + 100) / 2;
    warPower = rng.nextRangeInt(Math.round(warPower), 100);
  }

  // 3. 사기 및 훈련 보정
  warPower *= attacker.atmos / 100;
  warPower /= defender.train / 100;

  // 4. 숙련도(Dexterity) 보합/상성 보정 (로그 스케일)
  const attDex = attacker.dex[attacker.crewType] || 0;
  const defDex = defender.dex[attacker.crewType] || 0;
  warPower *= getDexLog(attDex, defDex);

  // 5. 트리거 및 스킬 배수 적용
  warPower *= attacker.warPowerMultiplier;

  // --- 수비측의 반격 전투력 계산 (동일 로직) ---
  let defWarPower = WarConst.armperphase + defender.getAttack() - attacker.getDefense();

  if (defWarPower < 100) {
    defWarPower = Math.max(0, defWarPower);
    defWarPower = (defWarPower + 100) / 2;
    defWarPower = rng.nextRangeInt(Math.round(defWarPower), 100);
  }

  defWarPower *= defender.atmos / 100;
  defWarPower /= attacker.train / 100;

  const defAttDex = defender.dex[defender.crewType] || 0;
  const attDefDex = attacker.dex[defender.crewType] || 0;
  defWarPower *= getDexLog(defAttDex, attDefDex);

  defWarPower *= defender.warPowerMultiplier || 1.0;

  return { attackerPower: warPower, defenderPower: defWarPower };
}

/**
 * 최종 데미지 산출 (계산된 전투력에 일정한 변동폭 적용)
 *
 * @param rng 난수 생성기
 * @param warPower 산출된 기초 전투력
 * @returns 변동폭(±10%)이 적용된 정수 데미지
 */
function calcDamage(rng: RandUtil, warPower: number): number {
  const variance = warPower * WarConst.damageVariance;
  return rng.nextRangeInt(Math.round(warPower - variance), Math.round(warPower + variance));
}

/**
 * 숙련도 격차에 따른 보정값을 계산합니다.
 */
function getDexLog(attDex: number, defDex: number): number {
  return (Math.log10(attDex + 100) + 1) / (Math.log10(defDex + 100) + 1);
}

/**
 * 장수의 전투 출진 순서(우선순위)를 결정합니다.
 * 관직이 높거나 스탯 합산이 높은 장수가 먼저 수비에 나섭니다.
 *
 * @param general 대상 장수
 * @returns 출진 우선순위 점수
 */
function extractBattleOrder(general: General): number {
  // TODO: 실제 레거시의 관직 기반 우선순위 로직 보강 필요
  return (general.leadership + general.strength + general.intel) / 3;
}
