/**
 * 초기 이벤트 실행기
 *
 * 시나리오 로드 시 초기화 이벤트(initialEvents)와
 * 게임 진행 이벤트(events)를 처리
 */
import type {
  Condition,
  Action,
  InitialEvent,
  GameEventData,
  Scenario,
  ConditionOperator,
} from "./schema.js";
import type { WorldSnapshot, WorldDelta } from "../entities.js";
import { EventTarget, EventRegistry, GameEvent } from "../events/types.js";

/**
 * 이벤트 실행 컨텍스트
 */
export interface EventContext {
  /** 게임 시작 연도 */
  startYear: number;
  /** 현재 연도 */
  currentYear: number;
  /** 현재 월 */
  currentMonth: number;
  /** 삭제할 이벤트 ID 목록 */
  eventsToDelete: Set<string>;
  /** 추가 컨텍스트 데이터 */
  extra?: Record<string, unknown>;
}

/**
 * 초기 이벤트 실행 결과
 */
export interface InitialEventResult {
  /** 성공 여부 */
  success: boolean;
  /** 실행된 이벤트 수 */
  executedCount: number;
  /** 월드 상태 변화 */
  delta: WorldDelta;
  /** 오류 메시지 (실패 시) */
  errors: string[];
}

/**
 * 조건 평가 에러
 */
export class ConditionEvaluationError extends Error {
  constructor(
    message: string,
    public readonly condition: unknown
  ) {
    super(`조건 평가 실패: ${message}`);
    this.name = "ConditionEvaluationError";
  }
}

/**
 * 액션 실행 에러
 */
export class ActionExecutionError extends Error {
  constructor(
    message: string,
    public readonly action: unknown
  ) {
    super(`액션 실행 실패: ${message}`);
    this.name = "ActionExecutionError";
  }
}

/**
 * 초기 이벤트 실행기 클래스
 */
export class InitialEventRunner {
  private actionHandlers: Map<string, ActionHandler> = new Map();

  constructor() {
    this.registerDefaultHandlers();
  }

  /**
   * 기본 액션 핸들러 등록
   */
  private registerDefaultHandlers(): void {
    // CreateManyNPC: NPC 다수 생성
    this.registerAction("CreateManyNPC", (args, snapshot, ctx) => {
      // args[0]: 최소 수, args[1]: 최대 수
      // 실제 NPC 생성은 게임 로직에서 처리
      return {
        logs: {
          global: [`NPC ${args[0]}~${args[1]}명 생성 예정`],
        },
      };
    });

    // RaiseNPCNation: NPC 국가 거병
    this.registerAction("RaiseNPCNation", (_args, snapshot, ctx) => {
      return {
        logs: {
          global: ["NPC 국가 거병"],
        },
      };
    });

    // OpenNationBetting: 국가 배팅 오픈
    this.registerAction("OpenNationBetting", (args, snapshot, ctx) => {
      // args[0]: 배팅 타입, args[1]: 금액
      return {
        env: {
          nationBetting: {
            type: args[0] as number,
            amount: args[1] as number,
            opened: true,
          },
        },
      };
    });

    // BlockScoutAction: 정찰 액션 차단
    this.registerAction("BlockScoutAction", (_args, snapshot, ctx) => {
      return {
        env: {
          blockScout: true,
        },
      };
    });

    // DeleteEvent: 현재 이벤트 삭제
    this.registerAction("DeleteEvent", (_args, snapshot, ctx) => {
      // eventsToDelete에 추가됨
      return {};
    });

    // NoticeToHistoryLog: 역사 로그 기록
    this.registerAction("NoticeToHistoryLog", (args, snapshot, ctx) => {
      const message = args[0] as string;
      return {
        logs: {
          global: [message],
        },
      };
    });

    // ChangeCity: 도시 속성 변경
    this.registerAction("ChangeCity", (args, snapshot, ctx) => {
      const cityName = args[0] as string;
      const changes = args[1] as Record<string, unknown>;

      const city = Object.values(snapshot.cities).find((c) => c.name === cityName);
      if (!city) return {};

      return {
        cities: {
          [city.id]: changes as Partial<typeof city>,
        },
      };
    });
  }

  /**
   * 액션 핸들러 등록
   */
  registerAction(name: string, handler: ActionHandler): void {
    this.actionHandlers.set(name, handler);
  }

  /**
   * 초기 이벤트 실행
   */
  runInitialEvents(scenario: Scenario, snapshot: WorldSnapshot): InitialEventResult {
    const ctx = this.createContext(scenario, snapshot);
    const result: InitialEventResult = {
      success: true,
      executedCount: 0,
      delta: {},
      errors: [],
    };

    if (!scenario.initialEvents) {
      return result;
    }

    for (const event of scenario.initialEvents) {
      try {
        const [condition, ...actions] = event;

        if (this.evaluateCondition(condition as Condition | boolean, snapshot, ctx)) {
          for (const action of actions) {
            const actionArray = action as unknown as Action;
            const delta = this.executeAction(actionArray, snapshot, ctx);
            this.mergeDelta(result.delta, delta);
          }
          result.executedCount++;
        }
      } catch (error) {
        result.errors.push((error as Error).message);
      }
    }

    if (result.errors.length > 0) {
      result.success = false;
    }

    return result;
  }

  /**
   * 게임 이벤트 등록
   */
  registerGameEvents(scenario: Scenario, registry: EventRegistry, startYear: number): void {
    if (!scenario.events) {
      return;
    }

    let eventIndex = 0;
    for (const eventData of scenario.events) {
      const [target, priority, condition, ...actions] = eventData;
      const eventId = `scenario_event_${eventIndex++}`;

      const gameEvent = this.createGameEvent(
        eventId,
        target as string,
        priority as number,
        condition as Condition | boolean,
        actions as unknown as Action[],
        startYear
      );

      registry.register(gameEvent);
    }
  }

  /**
   * GameEvent 객체 생성
   */
  private createGameEvent(
    id: string,
    target: string,
    priority: number,
    condition: Condition | boolean,
    actions: Action[],
    startYear: number
  ): GameEvent {
    const runner = this;

    return {
      id,
      name: `ScenarioEvent_${id}`,
      target: this.mapEventTarget(target),
      priority,

      condition(snapshot: WorldSnapshot, context?: unknown): boolean {
        const ctx = runner.createContextFromSnapshot(snapshot, startYear);
        return runner.evaluateCondition(condition, snapshot, ctx);
      },

      action(snapshot: WorldSnapshot, context?: unknown): WorldDelta {
        const ctx = runner.createContextFromSnapshot(snapshot, startYear);
        let combinedDelta: WorldDelta = {};

        for (const action of actions) {
          const delta = runner.executeAction(action, snapshot, ctx);
          runner.mergeDelta(combinedDelta, delta);
        }

        return combinedDelta;
      },
    };
  }

  /**
   * 이벤트 타겟 매핑
   */
  private mapEventTarget(target: string): EventTarget {
    const mapping: Record<string, EventTarget> = {
      month: EventTarget.MONTH,
      pre_month: EventTarget.PRE_MONTH,
      destroy_nation: EventTarget.DESTROY_NATION,
      occupy_city: EventTarget.OCCUPY_CITY,
      united: EventTarget.UNITED,
    };
    return mapping[target] ?? EventTarget.MONTH;
  }

  /**
   * 컨텍스트 생성
   */
  private createContext(scenario: Scenario, snapshot: WorldSnapshot): EventContext {
    return {
      startYear: scenario.startYear,
      currentYear: snapshot.gameTime.year,
      currentMonth: snapshot.gameTime.month,
      eventsToDelete: new Set(),
    };
  }

  /**
   * 스냅샷에서 컨텍스트 생성
   */
  private createContextFromSnapshot(snapshot: WorldSnapshot, startYear: number): EventContext {
    return {
      startYear,
      currentYear: snapshot.gameTime.year,
      currentMonth: snapshot.gameTime.month,
      eventsToDelete: new Set(),
    };
  }

  /**
   * 조건 평가
   */
  evaluateCondition(
    condition: Condition | boolean,
    snapshot: WorldSnapshot,
    ctx: EventContext
  ): boolean {
    // 상수 부울
    if (typeof condition === "boolean") {
      return condition;
    }

    // 배열 조건
    if (!Array.isArray(condition)) {
      throw new ConditionEvaluationError("알 수 없는 조건 형식", condition);
    }

    const [type, ...args] = condition;

    switch (type) {
      case "and":
        return (args as Condition[]).every((c) => this.evaluateCondition(c, snapshot, ctx));

      case "or":
        return (args as Condition[]).some((c) => this.evaluateCondition(c, snapshot, ctx));

      case "Date":
        return this.evaluateDateCondition(
          args as [ConditionOperator, number | null, number | null],
          snapshot,
          ctx
        );

      case "DateRelative":
        return this.evaluateDateRelativeCondition(
          args as [ConditionOperator, number],
          snapshot,
          ctx
        );

      case "RemainNation":
        return this.evaluateRemainNationCondition(args as [ConditionOperator, number], snapshot);

      default:
        throw new ConditionEvaluationError(`알 수 없는 조건 타입: ${type}`, condition);
    }
  }

  /**
   * 날짜 조건 평가
   */
  private evaluateDateCondition(
    args: [ConditionOperator, number | null, number | null],
    snapshot: WorldSnapshot,
    ctx: EventContext
  ): boolean {
    const [op, year, month] = args;
    const { year: currentYear, month: currentMonth } = snapshot.gameTime;

    // year가 null이면 월만 비교
    if (year === null) {
      return this.compareWithOp(currentMonth, month!, op);
    }

    // month가 null이면 연도만 비교
    if (month === null) {
      return this.compareWithOp(currentYear, year, op);
    }

    // 둘 다 있으면 연월 비교
    const currentDate = currentYear * 100 + currentMonth;
    const targetDate = year * 100 + month;
    return this.compareWithOp(currentDate, targetDate, op);
  }

  /**
   * 상대 날짜 조건 평가
   */
  private evaluateDateRelativeCondition(
    args: [ConditionOperator, number],
    snapshot: WorldSnapshot,
    ctx: EventContext
  ): boolean {
    const [op, years] = args;
    const elapsedYears = snapshot.gameTime.year - ctx.startYear;
    return this.compareWithOp(elapsedYears, years, op);
  }

  /**
   * 남은 국가 수 조건 평가
   */
  private evaluateRemainNationCondition(
    args: [ConditionOperator, number],
    snapshot: WorldSnapshot
  ): boolean {
    const [op, count] = args;
    const nationCount = Object.keys(snapshot.nations).length;
    return this.compareWithOp(nationCount, count, op);
  }

  /**
   * 연산자 비교
   */
  private compareWithOp(a: number, b: number, op: ConditionOperator): boolean {
    switch (op) {
      case "==":
        return a === b;
      case "!=":
        return a !== b;
      case ">":
        return a > b;
      case "<":
        return a < b;
      case ">=":
        return a >= b;
      case "<=":
        return a <= b;
      default:
        return false;
    }
  }

  /**
   * 액션 실행
   */
  executeAction(action: Action, snapshot: WorldSnapshot, ctx: EventContext): WorldDelta {
    const [name, ...args] = action;
    const handler = this.actionHandlers.get(name);

    if (!handler) {
      // 알 수 없는 액션은 로그만 남기고 진행
      console.warn(`알 수 없는 액션: ${name}`);
      return {};
    }

    try {
      return handler(args, snapshot, ctx);
    } catch (error) {
      throw new ActionExecutionError((error as Error).message, action);
    }
  }

  /**
   * 델타 병합
   */
  private mergeDelta(target: WorldDelta, source: WorldDelta): void {
    if (source.generals) {
      target.generals = { ...target.generals, ...source.generals };
    }
    if (source.nations) {
      target.nations = { ...target.nations, ...source.nations };
    }
    if (source.cities) {
      target.cities = { ...target.cities, ...source.cities };
    }
    if (source.diplomacy) {
      target.diplomacy = { ...target.diplomacy, ...source.diplomacy };
    }
    if (source.troops) {
      target.troops = { ...target.troops, ...source.troops };
    }
    if (source.messages) {
      target.messages = [...(target.messages ?? []), ...source.messages];
    }
    if (source.gameTime) {
      target.gameTime = { ...target.gameTime, ...source.gameTime };
    }
    if (source.env) {
      target.env = { ...target.env, ...source.env };
    }
    if (source.logs) {
      if (!target.logs) {
        target.logs = {};
      }
      if (source.logs.global) {
        target.logs.global = [...(target.logs.global ?? []), ...source.logs.global];
      }
      if (source.logs.nation) {
        target.logs.nation = { ...target.logs.nation, ...source.logs.nation };
      }
      if (source.logs.general) {
        target.logs.general = { ...target.logs.general, ...source.logs.general };
      }
    }
  }
}

/**
 * 액션 핸들러 타입
 */
export type ActionHandler = (
  args: unknown[],
  snapshot: WorldSnapshot,
  ctx: EventContext
) => WorldDelta;
