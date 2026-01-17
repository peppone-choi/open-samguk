// 이벤트 엔진과 TurnCalendarHandler 인터페이스를 연결하는 어댑터.
// InMemoryWorld에서 월/연 변경 시 이벤트를 발생시키기 위한 브릿지 역할.

import type { City, General, GeneralTriggerState, Nation } from '../domain/entities.js';
import type { LogEntryDraft } from '../logging/types.js';
import { EventEngine, MonthCondition, NewYearAction, ProcessIncomeAction, RaiseDisasterAction } from './index.js';
import type { EventEngineConfig, EventHandlerDefinition, EventWorldAccess } from './types.js';

/**
 * TurnCalendarHandler와 호환되는 컨텍스트.
 * InMemoryWorld.advanceMonth에서 전달하는 구조와 동일.
 */
export interface CalendarContext {
    previousYear: number;
    previousMonth: number;
    currentYear: number;
    currentMonth: number;
    turnTime: Date;
}

/**
 * 이벤트 월드 어댑터 인터페이스.
 * InMemoryTurnWorld가 제공하는 API를 EventWorldAccess로 변환.
 */
export interface EventWorldAdapter<TriggerState extends GeneralTriggerState = GeneralTriggerState> {
    listGenerals(): General<TriggerState>[];
    listCities(): City[];
    listNations(): Nation[];
    getGeneralById(id: number): General<TriggerState> | null;
    getCityById(id: number): City | null;
    getNationById(id: number): Nation | null;
    updateGeneral(id: number, patch: Partial<General<TriggerState>>): General<TriggerState> | null;
    updateCity(id: number, patch: Partial<City>): City | null;
    updateNation(id: number, patch: Partial<Nation>): Nation | null;
    pushLog(log: LogEntryDraft): void;
}

/**
 * EventWorldAccess 구현체.
 * EventWorldAdapter를 EventWorldAccess 인터페이스로 래핑.
 */
class WorldAccessImpl<
    TriggerState extends GeneralTriggerState = GeneralTriggerState,
> implements EventWorldAccess<TriggerState> {
    constructor(private readonly adapter: EventWorldAdapter<TriggerState>) {}

    listGenerals(): General<TriggerState>[] {
        return this.adapter.listGenerals();
    }

    listCities(): City[] {
        return this.adapter.listCities();
    }

    listNations(): Nation[] {
        return this.adapter.listNations();
    }

    getGeneralById(id: number): General<TriggerState> | null {
        return this.adapter.getGeneralById(id);
    }

    getCityById(id: number): City | null {
        return this.adapter.getCityById(id);
    }

    getNationById(id: number): Nation | null {
        return this.adapter.getNationById(id);
    }

    getCitiesByNationId(nationId: number): City[] {
        return this.adapter.listCities().filter((c) => c.nationId === nationId);
    }

    getGeneralsByNationId(nationId: number): General<TriggerState>[] {
        return this.adapter.listGenerals().filter((g) => g.nationId === nationId);
    }

    updateGeneral(id: number, patch: Partial<General<TriggerState>>): General<TriggerState> | null {
        return this.adapter.updateGeneral(id, patch);
    }

    updateCity(id: number, patch: Partial<City>): City | null {
        return this.adapter.updateCity(id, patch);
    }

    updateNation(id: number, patch: Partial<Nation>): Nation | null {
        return this.adapter.updateNation(id, patch);
    }

    pushLog(log: LogEntryDraft): void {
        this.adapter.pushLog(log);
    }
}

/**
 * 이벤트 캘린더 핸들러 옵션.
 */
export interface EventCalendarHandlerOptions {
    /** 시나리오 시작 연도 */
    startYear: number;
    /** 숨겨진 시드 (RNG 생성용) */
    hiddenSeed?: string;
    /** 커스텀 이벤트 핸들러 (추가할 핸들러들) - month와 handler 쌍의 배열 */
    customHandlers?: Array<{ month: number; handler: EventHandlerDefinition }>;
}

/**
 * 이벤트 기반 캘린더 핸들러.
 * TurnCalendarHandler 인터페이스를 구현하여 월/연 변경 시 이벤트를 발생시킴.
 * InMemoryTurnWorldOptions.calendarHandler에 전달하여 사용.
 */
export class EventCalendarHandler<TriggerState extends GeneralTriggerState = GeneralTriggerState> {
    private readonly engine: EventEngine<TriggerState>;
    private readonly config: EventEngineConfig;

    constructor(
        private readonly worldAdapter: EventWorldAdapter<TriggerState>,
        options: EventCalendarHandlerOptions
    ) {
        this.config = {
            startYear: options.startYear,
            ...(options.hiddenSeed !== undefined ? { hiddenSeed: options.hiddenSeed } : {}),
        };
        this.engine = new EventEngine<TriggerState>(this.config);

        // 기본 이벤트 핸들러 등록
        this.registerDefaultHandlers();

        // 커스텀 핸들러 추가
        if (options.customHandlers) {
            for (const { month, handler } of options.customHandlers) {
                this.engine.registerHandler(month, handler as EventHandlerDefinition<TriggerState>);
            }
        }
    }

    /**
     * 월 변경 시 호출 (TurnCalendarHandler.onMonthChanged 호환).
     */
    onMonthChanged(context: CalendarContext): void {
        const worldAccess = new WorldAccessImpl(this.worldAdapter);

        // 월별 이벤트 실행
        this.engine.runMonth(context.currentYear, context.currentMonth, worldAccess);
    }

    /**
     * 연 변경 시 호출 (TurnCalendarHandler.onYearChanged 호환).
     * 월 변경 후 연 변경이 호출되므로, 연간 이벤트는 1월 조건으로 처리.
     */
    onYearChanged(_context: CalendarContext): void {
        // 연간 이벤트는 1월 월별 이벤트에서 처리됨 (MonthCondition 1월)
        // 별도 처리 필요 없음
    }

    /**
     * 기본 이벤트 핸들러 등록.
     * 레거시 sammo\Event\Manager의 기본 이벤트 구성을 재현.
     */
    private registerDefaultHandlers(): void {
        // 1월 - 연초 처리 (나이/호봉 증가)
        this.engine.registerHandler(1, {
            id: 'new-year',
            condition: new MonthCondition(1),
            actions: [new NewYearAction<TriggerState>()],
        });

        // 1월 - 금 수입 지급
        this.engine.registerHandler(1, {
            id: 'income-gold',
            condition: new MonthCondition(1),
            actions: [new ProcessIncomeAction<TriggerState>('gold')],
        });

        // 1월, 4월, 7월, 10월 - 재해/호황
        const quarterlyMonths = [1, 4, 7, 10];
        for (const month of quarterlyMonths) {
            this.engine.registerHandler(month, {
                id: `disaster-${month}`,
                condition: new MonthCondition(month),
                actions: [new RaiseDisasterAction<TriggerState>()],
            });
        }

        // 7월 - 쌀 수입 지급
        this.engine.registerHandler(7, {
            id: 'income-rice',
            condition: new MonthCondition(7),
            actions: [new ProcessIncomeAction<TriggerState>('rice')],
        });
    }

    /**
     * 외부에서 핸들러 추가.
     */
    addHandler(month: number, handler: EventHandlerDefinition<TriggerState>): void {
        this.engine.registerHandler(month, handler);
    }

    /**
     * 엔진 인스턴스 반환 (테스트용).
     */
    getEngine(): EventEngine<TriggerState> {
        return this.engine;
    }
}

/**
 * 기본 이벤트 캘린더 핸들러 생성 팩토리.
 * InMemoryTurnWorld에서 사용하기 위한 간편 생성 함수.
 */
export function createEventCalendarHandler<TriggerState extends GeneralTriggerState = GeneralTriggerState>(
    worldAdapter: EventWorldAdapter<TriggerState>,
    options: EventCalendarHandlerOptions
): EventCalendarHandler<TriggerState> {
    return new EventCalendarHandler(worldAdapter, options);
}
