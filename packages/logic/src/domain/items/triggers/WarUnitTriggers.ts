import { BaseWarUnitTrigger } from "./BaseTrigger.js";
import type { WarUnitTriggerContext, TriggerResult } from "./types.js";
import { TriggerType } from "./types.js";

/**
 * 저격 시도 트리거
 *
 * 새 상대와 전투 시 저격 발동 확률 체크
 * 비도, 매화수전, 수극 등에서 사용
 */
export class 저격시도Trigger extends BaseWarUnitTrigger {
  readonly triggerType = "che_저격시도" as const;
  readonly triggerId: number;

  /** 저격 발동 확률 */
  private readonly triggerRate: number;
  /** 저격 성공 시 사기 보너스 */
  private readonly atmosBonus: number;
  /** 저격 성공 시 대미지 보너스 */
  private readonly damageBonus: number;

  constructor(
    triggerId: number = TriggerType.TYPE_ITEM,
    triggerRate: number = 0.5,
    atmosBonus: number = 20,
    damageBonus: number = 40
  ) {
    super();
    this.triggerId = triggerId;
    this.triggerRate = triggerRate;
    this.atmosBonus = atmosBonus;
    this.damageBonus = damageBonus;
  }

  execute(context: WarUnitTriggerContext): TriggerResult {
    const { rng, phase } = context;

    // 첫 페이즈에서만 발동 (새 상대와의 첫 전투)
    if (phase !== 0) {
      return this.skip("첫 페이즈 아님");
    }

    // 저격 확률 판정
    if (rng.nextFloat() >= this.triggerRate) {
      return this.skip("저격 판정 실패");
    }

    return this.success("저격 시도 성공!", {
      atmosBonus: this.atmosBonus,
      damageBonus: this.damageBonus,
    });
  }
}

/**
 * 저격 발동 트리거
 *
 * 저격 성공 시 효과 적용
 */
export class 저격발동Trigger extends BaseWarUnitTrigger {
  readonly triggerType = "che_저격발동" as const;
  readonly triggerId: number;

  constructor(triggerId: number = TriggerType.TYPE_ITEM) {
    super();
    this.triggerId = triggerId;
  }

  execute(context: WarUnitTriggerContext): TriggerResult {
    // 저격 시도 결과 확인
    const attemptResult = context.aux?.["저격시도결과"] as TriggerResult | undefined;
    if (!attemptResult?.triggered) {
      return this.skip("저격 시도 없음");
    }

    const atmosBonus = (attemptResult.data?.["atmosBonus"] as number) ?? 0;

    return this.success(`저격 발동! 사기 +${atmosBonus}`, {
      atmosApplied: atmosBonus,
    });
  }
}

/**
 * 전투 치료 시도 트리거
 *
 * 페이즈마다 치료 발동 확률 체크
 * 청낭서, 태평청령 등에서 사용
 */
export class 전투치료시도Trigger extends BaseWarUnitTrigger {
  readonly triggerType = "che_전투치료시도" as const;
  readonly triggerId: number;

  /** 치료 발동 확률 */
  private readonly triggerRate: number;

  constructor(triggerId: number = TriggerType.TYPE_ITEM, triggerRate: number = 0.4) {
    super();
    this.triggerId = triggerId;
    this.triggerRate = triggerRate;
  }

  execute(context: WarUnitTriggerContext): TriggerResult {
    const { rng } = context;

    // 치료 확률 판정
    if (rng.nextFloat() >= this.triggerRate) {
      return this.skip("치료 판정 실패");
    }

    return this.success("치료 시도 성공!", {
      healTriggered: true,
    });
  }
}

/**
 * 전투 치료 발동 트리거
 *
 * 치료 성공 시 아군 피해 감소, 부상 회복
 */
export class 전투치료발동Trigger extends BaseWarUnitTrigger {
  readonly triggerType = "che_전투치료발동" as const;
  readonly triggerId: number;

  /** 피해 감소율 */
  private readonly damageReduction: number;

  constructor(triggerId: number = TriggerType.TYPE_ITEM, damageReduction: number = 0.3) {
    super();
    this.triggerId = triggerId;
    this.damageReduction = damageReduction;
  }

  execute(context: WarUnitTriggerContext): TriggerResult {
    // 치료 시도 결과 확인
    const attemptResult = context.aux?.["치료시도결과"] as TriggerResult | undefined;
    if (!attemptResult?.triggered) {
      return this.skip("치료 시도 없음");
    }

    return this.success(`치료 발동! 피해 ${this.damageReduction * 100}% 감소`, {
      damageReduction: this.damageReduction,
      injuryHealed: true,
    });
  }
}

/**
 * 필살 시도 트리거
 *
 * 공격 시 필살 확률 체크
 */
export class 필살시도Trigger extends BaseWarUnitTrigger {
  readonly triggerType = "che_필살시도" as const;
  readonly triggerId: number;

  /** 필살 발동 확률 보너스 */
  private readonly criticalBonus: number;

  constructor(triggerId: number = TriggerType.TYPE_ITEM, criticalBonus: number = 0.2) {
    super();
    this.triggerId = triggerId;
    this.criticalBonus = criticalBonus;
  }

  execute(context: WarUnitTriggerContext): TriggerResult {
    // 필살 확률은 스탯 계산에서 적용됨
    // 이 트리거는 필살 발동 체크만 수행
    const { rng, aux } = context;
    const baseCriticalRate = (aux?.["baseCriticalRate"] as number) ?? 0;
    const totalRate = baseCriticalRate + this.criticalBonus;

    if (rng.nextFloat() >= totalRate) {
      return this.skip("필살 판정 실패");
    }

    return this.success("필살 시도 성공!", {
      criticalTriggered: true,
    });
  }
}

/**
 * 회피 시도 트리거
 *
 * 피격 시 회피 확률 체크
 */
export class 회피시도Trigger extends BaseWarUnitTrigger {
  readonly triggerType = "che_회피시도" as const;
  readonly triggerId: number;

  /** 회피 발동 확률 보너스 */
  private readonly avoidBonus: number;

  constructor(triggerId: number = TriggerType.TYPE_ITEM, avoidBonus: number = 0.2) {
    super();
    this.triggerId = triggerId;
    this.avoidBonus = avoidBonus;
  }

  execute(context: WarUnitTriggerContext): TriggerResult {
    const { rng, aux } = context;
    const baseAvoidRate = (aux?.["baseAvoidRate"] as number) ?? 0;
    const totalRate = baseAvoidRate + this.avoidBonus;

    if (rng.nextFloat() >= totalRate) {
      return this.skip("회피 판정 실패");
    }

    return this.success("회피 성공!", {
      avoidTriggered: true,
    });
  }
}
