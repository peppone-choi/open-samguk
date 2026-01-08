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
 * 레거시 WarEngine.php를 TypeScript로 포팅
 */
export class WarEngine {
  /**
   * 전투 실행
   * @param snapshot 월드 스냅샷 (장수, 도시, 국가 정보)
   * @param attackerId 공격자 장수 ID
   * @param cityId 대상 도시 ID
   * @returns 전투 결과 및 발생한 변화(Delta)
   */
  public execute(snapshot: WorldSnapshot, attackerId: number, cityId: number): WarResult {
    const rng = new RandUtil(snapshot.env.rand_seed);
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

    // 공격자 유닛 생성
    const attacker = new WarUnitGeneral(attackerGeneral, rng, true, attackerNation);

    // 수비자 목록 생성
    const defenderGenerals = Object.values(snapshot.generals).filter(
      (g) => g.cityId === city.id && g.nationId === city.nationId && g.id !== attackerId
    );

    const sortedDefenders = defenderGenerals
      .map((g) => ({ general: g, order: extractBattleOrder(g) }))
      .filter((d) => d.order > 0)
      .sort((a, b) => b.order - a.order);

    const cityUnit = new WarUnitCity(city, defenderNation, rng, gameYear, startYear);

    battleLog.push(`${attackerGeneral.name} 부대가 ${city.name} 성을 공격합니다!`);

    let phase = 0;
    let cityConquered = false;
    const allDeltas: WorldDelta[] = [];
    let totalDefenderKilled = 0;
    let totalDefenderDead = 0;

    // 수비진과 차례로 전투
    for (const defenderData of sortedDefenders) {
      const defender = new WarUnitGeneral(defenderData.general, rng, false, defenderNation);
      const registry = new WarUnitTriggerRegistry();

      attacker.setOppose(defender);
      defender.setOppose(attacker);

      this.registerUnitTriggers(attacker, registry);
      this.registerUnitTriggers(defender, registry);

      // 전투 루프 (최대 100페이즈)
      while (phase < 100) {
        phase++;
        attacker.phase = phase;
        defender.phase = phase;

        attacker.resetPhaseState();
        defender.resetPhaseState();

        // 트리거 발동
        const { deltas, stopped } = registry.fire(attacker, defender, rng, phase);
        for (const d of deltas) {
          if (d) {
            allDeltas.push(d);
            if (d.logs?.global) {
              battleLog.push(...d.logs.global);
            }
          }
        }

        const { attackerPower, defenderPower } = computeWarPower(rng, attacker, defender);

        const attackerDamage = calcDamage(rng, defenderPower);
        const defenderDamage = calcDamage(rng, attackerPower);

        attacker.decreaseHP(attackerDamage);
        defender.decreaseHP(defenderDamage);

        attacker.increaseKilled(defenderDamage);
        defender.increaseKilled(attackerDamage);

        // 결과 체크
        const attStatus = attacker.canContinue();
        const defStatus = defender.canContinue();

        if (!attStatus.canContinue || !defStatus.canContinue || stopped) {
          break;
        }
      }

      totalDefenderKilled += defender.getKilled();
      totalDefenderDead += defender.getDead();

      if (!attacker.canContinue().canContinue) break;
    }

    // 성벽과 전투 (공격자가 살아있고 성이 비었거나 모든 수비군 격파 시)
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
        // cityUnit은 별도의 리셋 로직이 필요할 수 있으나 현재는 성벽만 있으므로 스킵

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
          cityConquered = true;
          break;
        }

        if (!attacker.canContinue().canContinue || stopped) break;
      }
    }

    return {
      delta: this.mergeDeltas(allDeltas, attacker, cityUnit, attackerNation, defenderNation, cityConquered),
      battleLog,
      victory: cityConquered,
      cityConquered,
      attackerKilled: attacker.getKilled(),
      attackerDead: attacker.getDead(),
      totalDefenderKilled,
      totalDefenderDead,
    };
  }

  private registerUnitTriggers(unit: WarUnit, registry: WarUnitTriggerRegistry): void {
    const g = unit.general;
    if (g.id > 0) {
      const reg = getItemRegistry();
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
          // 상시 배율 보정 트리거 등록
          registry.register(
            new StatMultiplierTrigger(unit, (u: WarUnit) => item.getWarPowerMultiplier(u), RaiseType.ITEM)
          );

          // 스탯 보정 적용 (예: 추가 페이즈)
          if (unit instanceof WarUnitGeneral) {
            const extraPhase = item.onCalcStat(unit.general, "initWarPhase", 0);
            if (extraPhase > 0) {
              unit.addSpeed(extraPhase);
            }
          }
        }
      }

      // 특기 등록
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

          // 특기 배율 보정
          registry.register(
            new StatMultiplierTrigger(unit, (u: WarUnit) => special.getWarPowerMultiplier(u), RaiseType.SPECIAL)
          );
        }
      }
    }

    // 병종 어빌리티 등록
    const unitTriggers = UnitAbilityRegistry.getTriggersForUnit(unit);
    if (unitTriggers.length > 0) {
      registry.registerMany(...unitTriggers);
    }
  }

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

    if (conquered) {
      const cityDelta = finalDelta.cities![cityUnit.city.id];
      cityDelta.nationId = attacker.general.nationId;
      cityDelta.supply = 1;
      cityDelta.agri = Math.round(cityUnit.city.agri * 0.7);
      cityDelta.comm = Math.round(cityUnit.city.comm * 0.7);
      cityDelta.secu = Math.round(cityUnit.city.secu * 0.7);
    }

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
  warPower *= attacker.atmos / 100;
  warPower /= defender.train / 100;

  // 숙련도 보정
  const attDex = attacker.dex[attacker.crewType] || 0;
  const defDex = defender.dex[attacker.crewType] || 0;
  warPower *= getDexLog(attDex, defDex);

  // 트리거 배수 적용
  warPower *= attacker.warPowerMultiplier;

  // 수비측 전투력 계산
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

  // 수비측 트리거 배수 적용
  defWarPower *= defender.warPowerMultiplier || 1.0;

  return { attackerPower: warPower, defenderPower: defWarPower };
}

/**
 * 데미지 계산 (변동폭 적용)
 */
function calcDamage(rng: RandUtil, warPower: number): number {
  const variance = warPower * WarConst.damageVariance;
  return rng.nextRangeInt(Math.round(warPower - variance), Math.round(warPower + variance));
}

/**
 * 숙련도 로그 보정식
 */
function getDexLog(attDex: number, defDex: number): number {
  return (Math.log10(attDex + 100) + 1) / (Math.log10(defDex + 100) + 1);
}

/**
 * 장수의 출진 순서 결정 (레거시 extractBattleOrder)
 */
function extractBattleOrder(general: General): number {
  // 관직 등에 따른 우선순위 (필요시 상세 구현)
  return (general.leadership + general.strength + general.intel) / 3;
}
