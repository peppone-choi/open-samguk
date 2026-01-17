// 이벤트 시스템 모듈 export.
// 레거시 sammo\Event 계열 TypeScript 재설계.

// 타입
export type {
    EventAction,
    EventActionResult,
    EventCondition,
    EventConditionResult,
    EventContext,
    EventEngineConfig,
    EventEngineResult,
    EventHandlerDefinition,
    EventHandlerResult,
    EventWorldAccess,
    MonthlyEventSchedule,
} from './types.js';

// 엔진
export { createDefaultEventEngine, EventEngine, EventHandler } from './engine.js';

// 조건
export {
    AfterYearsCondition,
    ConstBoolCondition,
    DateCondition,
    DateRelativeCondition,
    IntervalCondition,
    LogicCondition,
    MonthCondition,
    RemainNationCondition,
} from './conditions/index.js';

// 액션
export { NewYearAction, ProcessIncomeAction, RaiseDisasterAction } from './actions/index.js';

// 타입 (액션 관련)
export type { ResourceType } from './actions/index.js';

// 캘린더 어댑터 (TurnCalendarHandler 연동용)
export { createEventCalendarHandler, EventCalendarHandler } from './calendarAdapter.js';
export type { CalendarContext, EventCalendarHandlerOptions, EventWorldAdapter } from './calendarAdapter.js';
