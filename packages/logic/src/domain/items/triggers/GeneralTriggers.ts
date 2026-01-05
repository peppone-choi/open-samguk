import { BaseGeneralTrigger } from './BaseTrigger.js';
import type {
    GeneralTriggerContext,
    TriggerResult,
} from './types.js';
import { TriggerType } from './types.js';

/**
 * 도시 치료 트리거
 *
 * 매 턴 자신(100%) + 도시 장수(50%) 부상 회복
 * 청낭서, 태평청령, 비급(의술) 등에서 사용
 */
export class 도시치료Trigger extends BaseGeneralTrigger {
    readonly triggerType = 'che_도시치료' as const;
    readonly triggerId: number;

    /** 자기 치료 확률 */
    private readonly selfHealRate: number;
    /** 도시 장수 치료 확률 */
    private readonly cityHealRate: number;

    constructor(
        triggerId: number = TriggerType.TYPE_ITEM,
        selfHealRate: number = 1.0,
        cityHealRate: number = 0.5
    ) {
        super();
        this.triggerId = triggerId;
        this.selfHealRate = selfHealRate;
        this.cityHealRate = cityHealRate;
    }

    execute(context: GeneralTriggerContext): TriggerResult {
        const { general, rng } = context;

        // 부상이 없으면 스킵
        if (general.injury <= 0) {
            return this.skip('부상 없음');
        }

        // 자기 치료 판정
        const selfHealed = rng.nextFloat() < this.selfHealRate;

        if (selfHealed) {
            return this.success(`${general.name}의 부상이 회복되었습니다.`, {
                selfHealed: true,
                cityHealRate: this.cityHealRate,
            });
        }

        return this.skip('치료 판정 실패');
    }
}

/**
 * 아이템 소모 치료 트리거
 *
 * 소모품 아이템으로 부상 회복
 * 환약, 정력견혈 등에서 사용
 */
export class 아이템치료Trigger extends BaseGeneralTrigger {
    readonly triggerType = 'che_아이템치료' as const;
    readonly triggerId: number;

    /** 잔여 사용 횟수 */
    private remainingUses: number;

    constructor(triggerId: number = TriggerType.TYPE_ITEM, uses: number = 3) {
        super();
        this.triggerId = triggerId;
        this.remainingUses = uses;
    }

    execute(context: GeneralTriggerContext): TriggerResult {
        const { general } = context;

        // 사용 횟수 없으면 스킵
        if (this.remainingUses <= 0) {
            return this.skip('아이템 소진');
        }

        // 부상이 없으면 스킵
        if (general.injury <= 0) {
            return this.skip('부상 없음');
        }

        // 아이템 사용
        this.remainingUses -= 1;

        return this.success(`${general.name}의 부상이 치료되었습니다. (잔여: ${this.remainingUses}회)`, {
            healed: true,
            remainingUses: this.remainingUses,
        });
    }

    /** 잔여 사용 횟수 조회 */
    getRemainingUses(): number {
        return this.remainingUses;
    }
}
