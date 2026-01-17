// 이벤트 조건 모듈.
// 레거시 sammo\Event\Condition 계열 포팅.

import type { EventCondition, EventConditionResult, EventContext } from '../types.js';

/**
 * 항상 참/거짓을 반환하는 상수 조건.
 * 레거시 Condition\ConstBool에 해당.
 */
export class ConstBoolCondition implements EventCondition {
    readonly type = 'ConstBool';

    constructor(private readonly value: boolean) {}

    evaluate(_context: EventContext): EventConditionResult {
        return {
            value: this.value,
            chain: [`ConstBool:${this.value}`],
        };
    }
}

/**
 * 특정 날짜 조건.
 * 레거시 Condition\Date에 해당.
 */
export class DateCondition implements EventCondition {
    readonly type = 'Date';

    constructor(
        private readonly targetYear: number,
        private readonly targetMonth: number
    ) {}

    evaluate(context: EventContext): EventConditionResult {
        const match = context.year === this.targetYear && context.month === this.targetMonth;
        return {
            value: match,
            chain: [`Date:${this.targetYear}/${this.targetMonth}=${match}`],
        };
    }
}

/**
 * 시작연도 기준 상대 날짜 조건.
 * 레거시 Condition\DateRelative에 해당.
 */
export class DateRelativeCondition implements EventCondition {
    readonly type = 'DateRelative';

    constructor(
        private readonly offsetYear: number,
        private readonly targetMonth: number
    ) {}

    evaluate(context: EventContext): EventConditionResult {
        const targetYear = context.startYear + this.offsetYear;
        const match = context.year === targetYear && context.month === this.targetMonth;
        return {
            value: match,
            chain: [`DateRelative:+${this.offsetYear}y/${this.targetMonth}m=${match}`],
        };
    }
}

/**
 * 특정 월 조건 (연도 무관).
 * 매년 특정 월에 실행할 이벤트용.
 */
export class MonthCondition implements EventCondition {
    readonly type = 'Month';

    constructor(private readonly targetMonth: number) {}

    evaluate(context: EventContext): EventConditionResult {
        const match = context.month === this.targetMonth;
        return {
            value: match,
            chain: [`Month:${this.targetMonth}=${match}`],
        };
    }
}

/**
 * 간격 조건.
 * 시작연도로부터 N개월마다 실행.
 * 레거시 Condition\Interval에 해당.
 */
export class IntervalCondition implements EventCondition {
    readonly type = 'Interval';

    constructor(
        /** 시작 오프셋 (개월) */
        private readonly startOffset: number,
        /** 간격 (개월) */
        private readonly intervalMonths: number
    ) {}

    evaluate(context: EventContext): EventConditionResult {
        const monthsSinceStart = (context.year - context.startYear) * 12 + (context.month - 1);
        const adjustedMonths = monthsSinceStart - this.startOffset;

        if (adjustedMonths < 0) {
            return {
                value: false,
                chain: [`Interval:notStarted`],
            };
        }

        const match = adjustedMonths % this.intervalMonths === 0;
        return {
            value: match,
            chain: [`Interval:${this.intervalMonths}m=${match}`],
        };
    }
}

/**
 * 남은 국가 수 조건.
 * 레거시 Condition\RemainNation에 해당.
 */
export class RemainNationCondition implements EventCondition {
    readonly type = 'RemainNation';

    constructor(
        private readonly operator: '<' | '<=' | '=' | '>=' | '>',
        private readonly targetCount: number
    ) {}

    evaluate(context: EventContext): EventConditionResult {
        const nationCount = (context.meta.nationCount as number) ?? 0;
        let match = false;

        switch (this.operator) {
            case '<':
                match = nationCount < this.targetCount;
                break;
            case '<=':
                match = nationCount <= this.targetCount;
                break;
            case '=':
                match = nationCount === this.targetCount;
                break;
            case '>=':
                match = nationCount >= this.targetCount;
                break;
            case '>':
                match = nationCount > this.targetCount;
                break;
        }

        return {
            value: match,
            chain: [`RemainNation:${nationCount}${this.operator}${this.targetCount}=${match}`],
        };
    }
}

/**
 * 논리 조건 (AND/OR/NOT).
 * 레거시 Condition\Logic에 해당.
 */
export class LogicCondition implements EventCondition {
    readonly type = 'Logic';

    constructor(
        private readonly operator: 'and' | 'or' | 'not',
        private readonly conditions: EventCondition[]
    ) {}

    evaluate(context: EventContext): EventConditionResult {
        const results = this.conditions.map((cond) => cond.evaluate(context));
        const chains = results.flatMap((r) => r.chain);

        switch (this.operator) {
            case 'and': {
                const value = results.every((r) => r.value);
                return {
                    value,
                    chain: [`Logic:AND=${value}`, ...chains],
                };
            }
            case 'or': {
                const value = results.some((r) => r.value);
                return {
                    value,
                    chain: [`Logic:OR=${value}`, ...chains],
                };
            }
            case 'not': {
                if (results.length !== 1) {
                    throw new Error('NOT condition requires exactly one operand');
                }
                const value = !results[0]!.value;
                return {
                    value,
                    chain: [`Logic:NOT=${value}`, ...chains],
                };
            }
        }
    }
}

/**
 * 시작 후 특정 기간이 지났는지 확인.
 * 초반 N년 스킵용.
 */
export class AfterYearsCondition implements EventCondition {
    readonly type = 'AfterYears';

    constructor(private readonly yearsAfterStart: number) {}

    evaluate(context: EventContext): EventConditionResult {
        const match = context.year >= context.startYear + this.yearsAfterStart;
        return {
            value: match,
            chain: [`AfterYears:${this.yearsAfterStart}=${match}`],
        };
    }
}
