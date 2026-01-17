// 이벤트 캘린더 핸들러 팩토리.
// InMemoryTurnWorld와 EventCalendarHandler 연결을 담당.

import type { City, General, GeneralTriggerState, LogEntryDraft, Nation } from '@sammo-ts/logic';
import { createEventCalendarHandler, type EventCalendarHandler, type EventWorldAdapter } from '@sammo-ts/logic';

import type { InMemoryTurnWorld } from './inMemoryWorld.js';
import type { TurnGeneral } from './types.js';

/**
 * InMemoryTurnWorld를 EventWorldAdapter로 래핑하는 어댑터 클래스.
 * TurnGeneral과 General 사이의 타입 변환을 담당.
 */
class TurnWorldEventAdapter implements EventWorldAdapter {
    private pendingLogs: LogEntryDraft[] = [];

    constructor(private readonly world: InMemoryTurnWorld) {}

    listGenerals(): General[] {
        return this.world.listGenerals().map(toGeneral);
    }

    listCities(): City[] {
        return this.world.listCities();
    }

    listNations(): Nation[] {
        return this.world.listNations();
    }

    getGeneralById(id: number): General | null {
        const general = this.world.getGeneralById(id);
        return general ? toGeneral(general) : null;
    }

    getCityById(id: number): City | null {
        return this.world.getCityById(id);
    }

    getNationById(id: number): Nation | null {
        return this.world.getNationById(id);
    }

    updateGeneral(id: number, patch: Partial<General>): General | null {
        // TurnGeneral에 맞게 patch 변환
        const turnPatch: Partial<TurnGeneral> = { ...patch };
        const result = this.world.updateGeneral(id, turnPatch);
        return result ? toGeneral(result) : null;
    }

    updateCity(id: number, patch: Partial<City>): City | null {
        return this.world.updateCity(id, patch);
    }

    updateNation(id: number, patch: Partial<Nation>): Nation | null {
        return this.world.updateNation(id, patch);
    }

    pushLog(log: LogEntryDraft): void {
        this.pendingLogs.push(log);
    }

    /**
     * 적재된 로그를 반환하고 초기화.
     */
    consumeLogs(): LogEntryDraft[] {
        const logs = [...this.pendingLogs];
        this.pendingLogs = [];
        return logs;
    }
}

/**
 * TurnGeneral을 General로 변환.
 * TurnGeneral은 General을 확장하므로 직접 반환 가능.
 */
function toGeneral(turnGeneral: TurnGeneral): General {
    return turnGeneral;
}

export interface EventCalendarFactoryOptions {
    /**
     * 시나리오 시작 연도.
     */
    startYear: number;
    /**
     * 숨겨진 시드 (RNG 생성용).
     */
    hiddenSeed?: string;
}

export interface EventCalendarFactoryResult {
    /**
     * TurnCalendarHandler로 사용할 수 있는 이벤트 캘린더 핸들러.
     */
    handler: EventCalendarHandler;
    /**
     * 월드 어댑터. 로그 소비 등에 활용.
     */
    adapter: TurnWorldEventAdapter;
}

/**
 * InMemoryTurnWorld에서 사용할 EventCalendarHandler 생성.
 *
 * @param world InMemoryTurnWorld 인스턴스
 * @param options 시나리오 설정 (startYear, hiddenSeed)
 * @returns EventCalendarHandler 및 어댑터
 *
 * @example
 * ```typescript
 * const { handler, adapter } = createTurnWorldEventCalendar(world, {
 *     startYear: scenarioConfig.startYear ?? 184,
 *     hiddenSeed: scenarioMeta?.hiddenSeed,
 * });
 *
 * // InMemoryTurnWorld 생성 시:
 * const world = new InMemoryTurnWorld(state, snapshot, {
 *     schedule,
 *     calendarHandler: handler,
 * });
 * ```
 */
export function createTurnWorldEventCalendar(
    world: InMemoryTurnWorld,
    options: EventCalendarFactoryOptions
): EventCalendarFactoryResult {
    const adapter = new TurnWorldEventAdapter(world);
    const handler = createEventCalendarHandler<GeneralTriggerState>(adapter, {
        startYear: options.startYear,
        ...(options.hiddenSeed !== undefined ? { hiddenSeed: options.hiddenSeed } : {}),
    });

    return { handler, adapter };
}
