// 이벤트 시스템 타입 정의.
// 레거시 sammo\Event 계열을 TypeScript로 재설계.

import type { RandUtil } from '@sammo-ts/common';
import type { City, General, GeneralTriggerState, Nation, TriggerValue } from '../domain/entities.js';
import type { LogEntryDraft } from '../logging/types.js';

/**
 * 이벤트 실행 환경.
 * 레거시 PHP의 $env 배열에 해당.
 */
export interface EventContext<_TriggerState extends GeneralTriggerState = GeneralTriggerState> {
    /** 현재 게임 연도 */
    year: number;
    /** 현재 게임 월 (1-12) */
    month: number;
    /** 시나리오 시작 연도 */
    startYear: number;
    /** 결정적 RNG */
    rng: RandUtil;
    /** 숨겨진 시드 (RNG 생성용) */
    hiddenSeed?: string;
    /** 추가 메타데이터 */
    meta: Record<string, TriggerValue>;
}

/**
 * 이벤트 조건 평가 결과.
 */
export interface EventConditionResult {
    /** 조건 충족 여부 */
    value: boolean;
    /** 평가 체인 (디버깅용) */
    chain: string[];
}

/**
 * 이벤트 조건 인터페이스.
 * 레거시 sammo\Event\Condition 추상 클래스에 해당.
 */
export interface EventCondition {
    /** 조건 타입 식별자 */
    readonly type: string;
    /** 조건을 평가하여 결과 반환 */
    evaluate(context: EventContext): EventConditionResult;
}

/**
 * 이벤트 액션 실행 결과.
 */
export interface EventActionResult<TriggerState extends GeneralTriggerState = GeneralTriggerState> {
    /** 실행 성공 여부 */
    success: boolean;
    /** 변경된 장수 목록 */
    generals?: General<TriggerState>[];
    /** 변경된 도시 목록 */
    cities?: City[];
    /** 변경된 국가 목록 */
    nations?: Nation[];
    /** 생성된 로그 */
    logs?: LogEntryDraft[];
    /** 추가 메타데이터 */
    meta?: Record<string, TriggerValue>;
}

/**
 * 이벤트 액션 인터페이스.
 * 레거시 sammo\Event\Action 추상 클래스에 해당.
 */
export interface EventAction<TriggerState extends GeneralTriggerState = GeneralTriggerState> {
    /** 액션 타입 식별자 */
    readonly type: string;
    /** 액션 실행 */
    run(
        context: EventContext<TriggerState>,
        worldAccess: EventWorldAccess<TriggerState>
    ): EventActionResult<TriggerState>;
}

/**
 * 이벤트 핸들러 실행 결과.
 */
export interface EventHandlerResult<TriggerState extends GeneralTriggerState = GeneralTriggerState> {
    /** 조건 평가 결과 */
    conditionResult: EventConditionResult;
    /** 액션 실행 결과 목록 (조건이 충족된 경우만) */
    actionResults?: EventActionResult<TriggerState>[];
}

/**
 * 이벤트 핸들러 정의.
 * 조건과 액션들의 조합.
 * 레거시 sammo\Event\EventHandler 클래스에 해당.
 */
export interface EventHandlerDefinition<TriggerState extends GeneralTriggerState = GeneralTriggerState> {
    /** 핸들러 ID (선택적) */
    id?: string;
    /** 실행 조건 */
    condition: EventCondition;
    /** 조건 충족 시 실행할 액션들 */
    actions: EventAction<TriggerState>[];
}

/**
 * 월별 이벤트 목록 정의.
 * 특정 월에 실행될 이벤트들을 지정.
 */
export interface MonthlyEventSchedule<TriggerState extends GeneralTriggerState = GeneralTriggerState> {
    /** 실행할 월 (1-12, 0은 매월) */
    month: number;
    /** 해당 월에 실행할 이벤트 핸들러들 */
    handlers: EventHandlerDefinition<TriggerState>[];
}

/**
 * 이벤트 엔진 설정.
 */
export interface EventEngineConfig {
    /** 시나리오 시작 연도 */
    startYear: number;
    /** 숨겨진 시드 (결정적 RNG용) */
    hiddenSeed?: string;
}

/**
 * 이벤트 월드 접근 인터페이스.
 * 이벤트 액션이 월드 상태에 접근하기 위한 추상화.
 */
export interface EventWorldAccess<TriggerState extends GeneralTriggerState = GeneralTriggerState> {
    // 조회
    listGenerals(): General<TriggerState>[];
    listCities(): City[];
    listNations(): Nation[];
    getGeneralById(id: number): General<TriggerState> | null;
    getCityById(id: number): City | null;
    getNationById(id: number): Nation | null;
    getCitiesByNationId(nationId: number): City[];
    getGeneralsByNationId(nationId: number): General<TriggerState>[];

    // 수정
    updateGeneral(id: number, patch: Partial<General<TriggerState>>): General<TriggerState> | null;
    updateCity(id: number, patch: Partial<City>): City | null;
    updateNation(id: number, patch: Partial<Nation>): Nation | null;

    // 로그
    pushLog(log: LogEntryDraft): void;
}

/**
 * 이벤트 엔진 실행 결과.
 */
export interface EventEngineResult<TriggerState extends GeneralTriggerState = GeneralTriggerState> {
    /** 실행된 핸들러 결과들 */
    handlerResults: Array<{
        handlerId?: string;
        result: EventHandlerResult<TriggerState>;
    }>;
    /** 전체 변경된 장수 */
    generals: General<TriggerState>[];
    /** 전체 변경된 도시 */
    cities: City[];
    /** 전체 변경된 국가 */
    nations: Nation[];
    /** 전체 로그 */
    logs: LogEntryDraft[];
}
