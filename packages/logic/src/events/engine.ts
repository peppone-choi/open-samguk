// 이벤트 엔진.
// 매 월마다 이벤트 핸들러들을 평가하고 실행한다.
// 레거시 sammo\Event\Engine 포팅.

import { LiteHashDRBG, RandUtil } from '@sammo-ts/common';

import type { City, General, GeneralTriggerState, Nation } from '../domain/entities.js';
import type { LogEntryDraft } from '../logging/types.js';
import type {
    EventAction,
    EventActionResult,
    EventCondition,
    EventContext,
    EventEngineConfig,
    EventEngineResult,
    EventHandlerDefinition,
    EventHandlerResult,
    EventWorldAccess,
    MonthlyEventSchedule,
} from './types.js';

/**
 * 이벤트 핸들러 실행기.
 * 조건을 평가하고 액션을 실행한다.
 */
export class EventHandler<TriggerState extends GeneralTriggerState = GeneralTriggerState> {
    constructor(
        private readonly id: string | undefined,
        private readonly condition: EventCondition,
        private readonly actions: EventAction<TriggerState>[]
    ) {}

    static fromDefinition<TriggerState extends GeneralTriggerState = GeneralTriggerState>(
        definition: EventHandlerDefinition<TriggerState>
    ): EventHandler<TriggerState> {
        return new EventHandler(definition.id, definition.condition, definition.actions);
    }

    /**
     * 이벤트를 실행한다.
     * 조건이 충족되면 모든 액션을 순차 실행한다.
     */
    tryRun(
        context: EventContext<TriggerState>,
        worldAccess: EventWorldAccess<TriggerState>
    ): EventHandlerResult<TriggerState> {
        const conditionResult = this.condition.evaluate(context);

        if (!conditionResult.value) {
            return { conditionResult };
        }

        const actionResults: EventActionResult<TriggerState>[] = [];
        for (const action of this.actions) {
            const result = action.run(context, worldAccess);
            actionResults.push(result);
        }

        return {
            conditionResult,
            actionResults,
        };
    }

    getId(): string | undefined {
        return this.id;
    }
}

/**
 * 이벤트 엔진.
 * 월별 이벤트 스케줄을 관리하고 실행한다.
 */
export class EventEngine<TriggerState extends GeneralTriggerState = GeneralTriggerState> {
    private readonly config: EventEngineConfig;
    private readonly monthlySchedule: Map<number, EventHandler<TriggerState>[]> = new Map();
    private readonly everyMonthHandlers: EventHandler<TriggerState>[] = [];

    constructor(config: EventEngineConfig) {
        this.config = config;
    }

    /**
     * 월별 이벤트 스케줄을 등록한다.
     * @param schedule 월별 이벤트 정의
     */
    registerSchedule(schedule: MonthlyEventSchedule<TriggerState>): void {
        const handlers = schedule.handlers.map((def) => EventHandler.fromDefinition(def));

        if (schedule.month === 0) {
            this.everyMonthHandlers.push(...handlers);
        } else {
            const existing = this.monthlySchedule.get(schedule.month) ?? [];
            existing.push(...handlers);
            this.monthlySchedule.set(schedule.month, existing);
        }
    }

    /**
     * 단일 핸들러를 특정 월에 등록한다.
     */
    registerHandler(month: number, handler: EventHandlerDefinition<TriggerState>): void {
        const wrappedHandler = EventHandler.fromDefinition(handler);

        if (month === 0) {
            this.everyMonthHandlers.push(wrappedHandler);
        } else {
            const existing = this.monthlySchedule.get(month) ?? [];
            existing.push(wrappedHandler);
            this.monthlySchedule.set(month, existing);
        }
    }

    /**
     * 특정 월의 이벤트들을 실행한다.
     */
    runMonth(
        year: number,
        month: number,
        worldAccess: EventWorldAccess<TriggerState>,
        seed?: string
    ): EventEngineResult<TriggerState> {
        const rng = new RandUtil(LiteHashDRBG.build(seed ?? `${this.config.hiddenSeed ?? ''}:event:${year}:${month}`));

        const context: EventContext<TriggerState> = {
            year,
            month,
            startYear: this.config.startYear,
            rng,
            ...(this.config.hiddenSeed !== undefined ? { hiddenSeed: this.config.hiddenSeed } : {}),
            meta: {
                nationCount: worldAccess.listNations().filter((n) => n.id > 0).length,
            },
        };

        const handlerResults: Array<{ handlerId?: string; result: EventHandlerResult<TriggerState> }> = [];
        const allGenerals: General<TriggerState>[] = [];
        const allCities: City[] = [];
        const allNations: Nation[] = [];
        const allLogs: LogEntryDraft[] = [];

        // 매월 실행 핸들러
        for (const handler of this.everyMonthHandlers) {
            const result = handler.tryRun(context, worldAccess);
            const handlerId = handler.getId();
            handlerResults.push(handlerId !== undefined ? { handlerId, result } : { result });
            this.collectResults(result, allGenerals, allCities, allNations, allLogs);
        }

        // 해당 월 전용 핸들러
        const monthHandlers = this.monthlySchedule.get(month) ?? [];
        for (const handler of monthHandlers) {
            const result = handler.tryRun(context, worldAccess);
            const handlerId = handler.getId();
            handlerResults.push(handlerId !== undefined ? { handlerId, result } : { result });
            this.collectResults(result, allGenerals, allCities, allNations, allLogs);
        }

        return {
            handlerResults,
            generals: allGenerals,
            cities: allCities,
            nations: allNations,
            logs: allLogs,
        };
    }

    private collectResults(
        result: EventHandlerResult<TriggerState>,
        generals: General<TriggerState>[],
        cities: City[],
        nations: Nation[],
        logs: LogEntryDraft[]
    ): void {
        if (!result.actionResults) {
            return;
        }

        for (const actionResult of result.actionResults) {
            if (actionResult.generals) {
                generals.push(...actionResult.generals);
            }
            if (actionResult.cities) {
                cities.push(...actionResult.cities);
            }
            if (actionResult.nations) {
                nations.push(...actionResult.nations);
            }
            if (actionResult.logs) {
                logs.push(...actionResult.logs);
            }
        }
    }
}

/**
 * 기본 이벤트 엔진을 생성한다.
 * 표준 월별 이벤트들(봉급, 재해 등)이 등록된다.
 */
export const createDefaultEventEngine = <TriggerState extends GeneralTriggerState = GeneralTriggerState>(
    config: EventEngineConfig
): EventEngine<TriggerState> => {
    const engine = new EventEngine<TriggerState>(config);

    // 기본 이벤트 스케줄은 actions에서 import하여 등록한다.
    // 이 함수는 빈 엔진을 반환하고, 호출자가 필요한 이벤트를 등록한다.

    return engine;
};
