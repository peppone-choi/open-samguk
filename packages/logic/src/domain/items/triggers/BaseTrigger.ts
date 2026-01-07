import type {
  IGeneralTrigger,
  IWarUnitTrigger,
  GeneralTriggerType,
  WarUnitTriggerType,
  GeneralTriggerContext,
  WarUnitTriggerContext,
  TriggerResult,
} from "./types.js";

/**
 * 장수 트리거 기본 클래스
 */
export abstract class BaseGeneralTrigger implements IGeneralTrigger {
  abstract readonly triggerType: GeneralTriggerType;
  abstract readonly triggerId: number;

  /**
   * 트리거 실행
   * 하위 클래스에서 반드시 구현
   */
  abstract execute(context: GeneralTriggerContext): TriggerResult;

  /**
   * 트리거 발동 성공 결과 생성
   */
  protected success(message?: string, data?: Record<string, unknown>): TriggerResult {
    return { triggered: true, message, data };
  }

  /**
   * 트리거 미발동 결과 생성
   */
  protected skip(message?: string): TriggerResult {
    return { triggered: false, message };
  }
}

/**
 * 전투 트리거 기본 클래스
 */
export abstract class BaseWarUnitTrigger implements IWarUnitTrigger {
  abstract readonly triggerType: WarUnitTriggerType;
  abstract readonly triggerId: number;

  /**
   * 트리거 실행
   * 하위 클래스에서 반드시 구현
   */
  abstract execute(context: WarUnitTriggerContext): TriggerResult;

  /**
   * 트리거 발동 성공 결과 생성
   */
  protected success(message?: string, data?: Record<string, unknown>): TriggerResult {
    return { triggered: true, message, data };
  }

  /**
   * 트리거 미발동 결과 생성
   */
  protected skip(message?: string): TriggerResult {
    return { triggered: false, message };
  }
}

/**
 * 장수 트리거 호출자
 */
export class GeneralTriggerCaller {
  readonly triggers: IGeneralTrigger[];

  constructor(...triggers: IGeneralTrigger[]) {
    this.triggers = triggers;
  }

  /**
   * 모든 트리거 실행
   * 중복 ID 트리거는 첫 번째만 실행
   */
  executeAll(context: GeneralTriggerContext): TriggerResult[] {
    const executedIds = new Set<number>();
    const results: TriggerResult[] = [];

    for (const trigger of this.triggers) {
      // 중복 ID 트리거 스킵
      if (executedIds.has(trigger.triggerId)) {
        continue;
      }
      executedIds.add(trigger.triggerId);

      const result = trigger.execute(context);
      results.push(result);
    }

    return results;
  }
}

/**
 * 전투 트리거 호출자
 */
export class WarUnitTriggerCaller {
  readonly triggers: IWarUnitTrigger[];

  constructor(...triggers: IWarUnitTrigger[]) {
    this.triggers = triggers;
  }

  /**
   * 모든 트리거 실행
   * 중복 ID 트리거는 첫 번째만 실행
   */
  executeAll(context: WarUnitTriggerContext): TriggerResult[] {
    const executedIds = new Set<number>();
    const results: TriggerResult[] = [];

    for (const trigger of this.triggers) {
      // 중복 ID 트리거 스킵
      if (executedIds.has(trigger.triggerId)) {
        continue;
      }
      executedIds.add(trigger.triggerId);

      const result = trigger.execute(context);
      results.push(result);
    }

    return results;
  }
}
