// 이벤트 액션 모듈.
// 레거시 sammo\Event\Action 계열 포팅.

import type { GeneralTriggerState } from '../../domain/entities.js';
import type { LogEntryDraft } from '../../logging/types.js';
import { LogCategory, LogFormat, LogScope } from '../../logging/types.js';
import type { EventAction, EventActionResult, EventContext, EventWorldAccess } from '../types.js';

/**
 * 연초 처리 액션.
 * 모든 장수의 나이와 호봉을 증가시킨다.
 * 레거시 Event\Action\NewYear에 해당.
 */
export class NewYearAction<
    TriggerState extends GeneralTriggerState = GeneralTriggerState,
> implements EventAction<TriggerState> {
    readonly type = 'NewYear';

    run(
        context: EventContext<TriggerState>,
        worldAccess: EventWorldAccess<TriggerState>
    ): EventActionResult<TriggerState> {
        const { year } = context;
        const logs: LogEntryDraft[] = [];

        // 글로벌 액션 로그
        logs.push({
            scope: LogScope.SYSTEM,
            category: LogCategory.ACTION,
            text: `<C>${year}</>년이 되었습니다.`,
            format: LogFormat.MONTH,
        });

        // 히스토리 로그 (매너 플레이 안내)
        logs.push({
            scope: LogScope.SYSTEM,
            category: LogCategory.HISTORY,
            text: '<S>모두들 즐거운 게임 하고 계신가요? ^^ <Y>매너 있는 플레이</> 부탁드리고, 게임보단 <L>건강이 먼저</>란점, 잊지 마세요!</>',
            format: LogFormat.NOTICE_YEAR_MONTH,
        });

        // 모든 장수의 나이 증가
        const generals = worldAccess.listGenerals();
        for (const general of generals) {
            const newAge = general.age + 1;

            // 소속 국가가 있는 경우 호봉도 증가
            // belong은 meta에 저장되어 있을 수 있음
            const currentBelong = (general.meta.belong as number) ?? 0;
            const newBelong = general.nationId > 0 ? currentBelong + 1 : currentBelong;

            worldAccess.updateGeneral(general.id, {
                age: newAge,
                meta: {
                    ...general.meta,
                    belong: newBelong,
                },
            });
        }

        // 로그 푸시
        for (const log of logs) {
            worldAccess.pushLog(log);
        }

        return {
            success: true,
            generals: worldAccess.listGenerals(),
            logs,
        };
    }
}

/**
 * 재해/호황 발생 액션.
 * 시작 후 3년이 지나면 확률적으로 재해 또는 호황을 발생시킨다.
 * 레거시 Event\Action\RaiseDisaster에 해당.
 */
export class RaiseDisasterAction<
    TriggerState extends GeneralTriggerState = GeneralTriggerState,
> implements EventAction<TriggerState> {
    readonly type = 'RaiseDisaster';

    run(
        context: EventContext<TriggerState>,
        worldAccess: EventWorldAccess<TriggerState>
    ): EventActionResult<TriggerState> {
        const { year, month, startYear, rng } = context;
        const logs: LogEntryDraft[] = [];

        // 재해 상태 초기화 (state <= 10인 도시들)
        const cities = worldAccess.listCities();
        for (const city of cities) {
            const currentState = (city.meta.state as number) ?? 0;
            if (currentState <= 10) {
                worldAccess.updateCity(city.id, {
                    meta: { ...city.meta, state: 0 },
                });
            }
        }

        // 초반 3년은 스킵
        if (startYear + 3 > year) {
            return { success: true, logs };
        }

        // 호황 확률 (1월, 10월은 0%, 4월, 7월은 25%)
        const boomingRate: Record<number, number> = {
            1: 0,
            4: 0.25,
            7: 0.25,
            10: 0,
        };
        const isGood = rng.nextBool(boomingRate[month] ?? 0);

        // 대상 도시 선택
        const targetCityList: typeof cities = [];
        for (const city of worldAccess.listCities()) {
            const secuMax = city.securityMax || 100;
            const secuRatio = city.security / secuMax;

            // 호황: 2~7%, 재해: 1~6%
            const raiseProp = isGood ? 0.02 + secuRatio * 0.05 : 0.06 - secuRatio * 0.05;

            if (rng.nextBool(raiseProp)) {
                targetCityList.push(city);
            }
        }

        if (targetCityList.length === 0) {
            return { success: true, logs };
        }

        // 재해/호황 텍스트 정의
        const disasterTextList: Record<number, Array<[string, number, string]>> = {
            1: [
                ['<M><b>【재난】</b></>', 4, '역병이 발생하여 도시가 황폐해지고 있습니다.'],
                ['<M><b>【재난】</b></>', 5, '지진으로 피해가 속출하고 있습니다.'],
                ['<M><b>【재난】</b></>', 3, '추위가 풀리지 않아 얼어죽는 백성들이 늘어나고 있습니다.'],
                ['<M><b>【재난】</b></>', 9, '황건적이 출현해 도시를 습격하고 있습니다.'],
            ],
            4: [
                ['<M><b>【재난】</b></>', 7, '홍수로 인해 피해가 급증하고 있습니다.'],
                ['<M><b>【재난】</b></>', 5, '지진으로 피해가 속출하고 있습니다.'],
                ['<M><b>【재난】</b></>', 6, '태풍으로 인해 피해가 속출하고 있습니다.'],
            ],
            7: [
                ['<M><b>【재난】</b></>', 8, '메뚜기 떼가 발생하여 도시가 황폐해지고 있습니다.'],
                ['<M><b>【재난】</b></>', 5, '지진으로 피해가 속출하고 있습니다.'],
                ['<M><b>【재난】</b></>', 8, '흉년이 들어 굶어죽는 백성들이 늘어나고 있습니다.'],
            ],
            10: [
                ['<M><b>【재난】</b></>', 3, '혹한으로 도시가 황폐해지고 있습니다.'],
                ['<M><b>【재난】</b></>', 5, '지진으로 피해가 속출하고 있습니다.'],
                ['<M><b>【재난】</b></>', 3, '눈이 많이 쌓여 도시가 황폐해지고 있습니다.'],
                ['<M><b>【재난】</b></>', 9, '황건적이 출현해 도시를 습격하고 있습니다.'],
            ],
        };

        const boomingTextList: Record<number, Array<[string, number, string]> | null> = {
            1: null,
            4: [['<C><b>【호황】</b></>', 2, '호황으로 도시가 번창하고 있습니다.']],
            7: [['<C><b>【풍작】</b></>', 1, '풍작으로 도시가 번창하고 있습니다.']],
            10: null,
        };

        const textList = isGood ? boomingTextList[month] : disasterTextList[month];
        if (!textList || textList.length === 0) {
            return { success: true, logs };
        }

        const [logTitle, stateCode, logBody] = rng.choice(textList);
        const targetCityNames = '<G><b>' + targetCityList.map((c) => c.name).join(' ') + '</b></>';

        // 글로벌 히스토리 로그
        logs.push({
            scope: LogScope.SYSTEM,
            category: LogCategory.HISTORY,
            text: `${logTitle}${targetCityNames}에 ${logBody}`,
            format: LogFormat.YEAR_MONTH,
        });

        // 도시 상태 업데이트
        for (const city of targetCityList) {
            const secuMax = city.securityMax || 100;
            const secuRatio = city.security / secuMax;
            const affectBase = Math.min(Math.max(secuRatio / 0.8, 0), 1);

            if (isGood) {
                // 호황: 1.01 ~ 1.05 배
                const affectRatio = 1.01 + affectBase * 0.04;
                worldAccess.updateCity(city.id, {
                    population: Math.min(Math.round(city.population * affectRatio), city.populationMax),
                    agriculture: Math.min(Math.round(city.agriculture * affectRatio), city.agricultureMax),
                    commerce: Math.min(Math.round(city.commerce * affectRatio), city.commerceMax),
                    security: Math.min(Math.round(city.security * affectRatio), city.securityMax),
                    defence: Math.min(Math.round(city.defence * affectRatio), city.defenceMax),
                    wall: Math.min(Math.round(city.wall * affectRatio), city.wallMax),
                    meta: { ...city.meta, state: stateCode },
                });
            } else {
                // 재해: 0.8 ~ 0.95 배
                const affectRatio = 0.8 + affectBase * 0.15;
                const trust = (city.meta.trust as number) ?? 100;
                worldAccess.updateCity(city.id, {
                    population: Math.round(city.population * affectRatio),
                    agriculture: Math.round(city.agriculture * affectRatio),
                    commerce: Math.round(city.commerce * affectRatio),
                    security: Math.round(city.security * affectRatio),
                    defence: Math.round(city.defence * affectRatio),
                    wall: Math.round(city.wall * affectRatio),
                    meta: { ...city.meta, state: stateCode, trust: Math.round(trust * affectRatio) },
                });
            }
        }

        // 로그 푸시
        for (const log of logs) {
            worldAccess.pushLog(log);
        }

        return {
            success: true,
            cities: worldAccess.listCities(),
            logs,
        };
    }
}

/**
 * 자원 유형 enum.
 * 레거시 ResourceType에 해당.
 */
export type ResourceType = 'gold' | 'rice';

/**
 * 봉급 계산.
 * 레거시 getBill 함수 포팅.
 * 헌신도 기반 봉급 계산.
 */
const getDedLevel = (dedication: number): number => {
    return Math.min(Math.floor(dedication / 5000) + 1, 10);
};

const getBillByLevel = (dedLevel: number): number => {
    return dedLevel * 200 + 400;
};

const getBill = (dedication: number): number => {
    return getBillByLevel(getDedLevel(dedication));
};

/**
 * 도시 금 수입 계산 (단순화).
 * 레거시 calcCityGoldIncome 기반.
 * 상업 수치와 인구 기반 계산.
 */
const calcCityGoldIncome = (
    city: { commerce: number; commerceMax: number; population: number; populationMax: number },
    isCapital: boolean
): number => {
    const commerceRatio = city.commerceMax > 0 ? city.commerce / city.commerceMax : 0;
    const popRatio = city.populationMax > 0 ? city.population / city.populationMax : 0;

    // 기본 수입: 상업 * (인구비율 + 0.5) * 0.1
    let income = Math.round(city.commerce * (popRatio + 0.5) * 0.1);

    // 수도 보너스 20%
    if (isCapital) {
        income = Math.round(income * 1.2);
    }

    // 상업 발전도 보너스
    income = Math.round(income * (0.8 + commerceRatio * 0.4));

    return income;
};

/**
 * 도시 쌀 수입 계산 (단순화).
 * 레거시 calcCityRiceIncome 기반.
 * 농업 수치와 인구 기반 계산.
 */
const calcCityRiceIncome = (
    city: { agriculture: number; agricultureMax: number; population: number; populationMax: number },
    isCapital: boolean
): number => {
    const agriRatio = city.agricultureMax > 0 ? city.agriculture / city.agricultureMax : 0;
    const popRatio = city.populationMax > 0 ? city.population / city.populationMax : 0;

    // 기본 수입: 농업 * (인구비율 + 0.5) * 0.1
    let income = Math.round(city.agriculture * (popRatio + 0.5) * 0.1);

    // 수도 보너스 20%
    if (isCapital) {
        income = Math.round(income * 1.2);
    }

    // 농업 발전도 보너스
    income = Math.round(income * (0.8 + agriRatio * 0.4));

    return income;
};

/**
 * 도시 성벽 수입 계산 (쌀).
 * 레거시 calcCityWallRiceIncome 기반.
 */
const calcCityWallRiceIncome = (city: { wall: number; wallMax: number }): number => {
    const wallRatio = city.wallMax > 0 ? city.wall / city.wallMax : 0;
    return Math.round(city.wall * wallRatio * 0.05);
};

/**
 * 기본 자금/군량 상수.
 * 레거시 GameConst 기반.
 */
const BASE_GOLD = 1000;
const BASE_RICE = 1000;
const DEFAULT_TAX_RATE = 20; // rate_tmp 기본값

/**
 * 월별 봉급 지급 액션.
 * 국가에 세금/세곡을 걷고 장수들에게 봉급을 지급한다.
 * 레거시 Event\Action\ProcessIncome에 해당.
 *
 * - 1월 (봄): 금 지급
 * - 7월 (가을): 쌀 지급
 */
export class ProcessIncomeAction<
    TriggerState extends GeneralTriggerState = GeneralTriggerState,
> implements EventAction<TriggerState> {
    readonly type = 'ProcessIncome';

    constructor(private readonly resourceType: ResourceType) {}

    run(
        context: EventContext<TriggerState>,
        worldAccess: EventWorldAccess<TriggerState>
    ): EventActionResult<TriggerState> {
        if (this.resourceType === 'gold') {
            return this.processGoldIncome(context, worldAccess);
        } else {
            return this.processRiceIncome(context, worldAccess);
        }
    }

    /**
     * 금 수입 처리 (1월 - 봄).
     */
    private processGoldIncome(
        _context: EventContext<TriggerState>,
        worldAccess: EventWorldAccess<TriggerState>
    ): EventActionResult<TriggerState> {
        const logs: LogEntryDraft[] = [];

        const nations = worldAccess.listNations().filter((n) => n.id > 0);
        const cities = worldAccess.listCities();
        const generals = worldAccess.listGenerals();

        // 국가별 처리
        for (const nation of nations) {
            const nationCities = cities.filter((c) => c.nationId === nation.id);
            const nationGenerals = generals.filter((g) => g.nationId === nation.id && g.npcState !== 5);

            if (nationCities.length === 0) continue;

            // 1. 수입 계산
            const taxRate = ((nation.meta.rateTmp as number) ?? DEFAULT_TAX_RATE) / DEFAULT_TAX_RATE;
            let income = 0;
            for (const city of nationCities) {
                const isCapital = city.id === nation.capitalCityId;
                income += calcCityGoldIncome(city, isCapital);
            }
            income = Math.round(income * taxRate);

            // 2. 지출 계산 (장수 봉급 총합)
            const billRate = (nation.meta.bill as number) ?? 100;
            let totalOutcome = 0;
            for (const general of nationGenerals) {
                totalOutcome += getBill(general.dedication);
            }
            const requestedOutcome = Math.round((billRate / 100) * totalOutcome);

            // 3. 실제 지급 계산
            let nationGold = nation.gold + income;
            let realOutcome: number;
            let ratio: number;

            if (nationGold < BASE_GOLD) {
                // 기본량도 안될 경우 - 지급 불가
                realOutcome = 0;
                ratio = 0;
            } else if (nationGold - BASE_GOLD < requestedOutcome) {
                // 기본량은 넘지만 요구량이 안될 경우
                realOutcome = nationGold - BASE_GOLD;
                nationGold = BASE_GOLD;
                ratio = totalOutcome > 0 ? realOutcome / totalOutcome : 0;
            } else {
                // 충분한 경우
                realOutcome = requestedOutcome;
                nationGold -= realOutcome;
                ratio = totalOutcome > 0 ? realOutcome / totalOutcome : 0;
            }

            nationGold = Math.max(nationGold, BASE_GOLD);

            // 4. 국가 금 업데이트
            worldAccess.updateNation(nation.id, {
                gold: nationGold,
                meta: {
                    ...nation.meta,
                    prevIncomeGold: income,
                },
            });

            // 5. 장수별 봉급 지급
            for (const general of nationGenerals) {
                const payment = Math.round(getBill(general.dedication) * ratio);
                worldAccess.updateGeneral(general.id, {
                    gold: general.gold + payment,
                });

                // 고위 관직(5 이상)에게는 수입 알림
                if (general.officerLevel > 4) {
                    logs.push({
                        scope: LogScope.GENERAL,
                        category: LogCategory.ACTION,
                        text: `이번 수입은 금 <C>${income.toLocaleString()}</>입니다.`,
                        generalId: general.id,
                        format: LogFormat.PLAIN,
                    });
                }

                logs.push({
                    scope: LogScope.GENERAL,
                    category: LogCategory.ACTION,
                    text: `봉급으로 금 <C>${payment.toLocaleString()}</>을 받았습니다.`,
                    generalId: general.id,
                    format: LogFormat.PLAIN,
                });
            }
        }

        // 글로벌 히스토리 로그
        logs.push({
            scope: LogScope.SYSTEM,
            category: LogCategory.HISTORY,
            text: '<W><b>【지급】</b></>봄이 되어 봉록에 따라 자금이 지급됩니다.',
            format: LogFormat.YEAR_MONTH,
        });

        for (const log of logs) {
            worldAccess.pushLog(log);
        }

        return {
            success: true,
            nations: worldAccess.listNations(),
            generals: worldAccess.listGenerals(),
            logs,
        };
    }

    /**
     * 쌀 수입 처리 (7월 - 가을).
     */
    private processRiceIncome(
        _context: EventContext<TriggerState>,
        worldAccess: EventWorldAccess<TriggerState>
    ): EventActionResult<TriggerState> {
        const logs: LogEntryDraft[] = [];

        const nations = worldAccess.listNations().filter((n) => n.id > 0);
        const cities = worldAccess.listCities();
        const generals = worldAccess.listGenerals();

        // 국가별 처리
        for (const nation of nations) {
            const nationCities = cities.filter((c) => c.nationId === nation.id);
            const nationGenerals = generals.filter((g) => g.nationId === nation.id && g.npcState !== 5);

            if (nationCities.length === 0) continue;

            // 1. 수입 계산 (쌀 + 성벽 수입)
            const taxRate = ((nation.meta.rateTmp as number) ?? DEFAULT_TAX_RATE) / DEFAULT_TAX_RATE;
            let income = 0;
            for (const city of nationCities) {
                const isCapital = city.id === nation.capitalCityId;
                income += calcCityRiceIncome(city, isCapital);
                income += calcCityWallRiceIncome(city);
            }
            income = Math.round(income * taxRate);

            // 2. 지출 계산 (장수 봉급 총합)
            const billRate = (nation.meta.bill as number) ?? 100;
            let totalOutcome = 0;
            for (const general of nationGenerals) {
                totalOutcome += getBill(general.dedication);
            }
            const requestedOutcome = Math.round((billRate / 100) * totalOutcome);

            // 3. 실제 지급 계산
            let nationRice = nation.rice + income;
            let realOutcome: number;
            let ratio: number;

            if (nationRice < BASE_RICE) {
                // 기본량도 안될 경우 - 지급 불가
                realOutcome = 0;
                ratio = 0;
            } else if (nationRice - BASE_RICE < requestedOutcome) {
                // 기본량은 넘지만 요구량이 안될 경우
                realOutcome = nationRice - BASE_RICE;
                nationRice = BASE_RICE;
                ratio = totalOutcome > 0 ? realOutcome / totalOutcome : 0;
            } else {
                // 충분한 경우
                realOutcome = requestedOutcome;
                nationRice -= realOutcome;
                ratio = totalOutcome > 0 ? realOutcome / totalOutcome : 0;
            }

            nationRice = Math.max(nationRice, BASE_RICE);

            // 4. 국가 쌀 업데이트
            worldAccess.updateNation(nation.id, {
                rice: nationRice,
                meta: {
                    ...nation.meta,
                    prevIncomeRice: income,
                },
            });

            // 5. 장수별 봉급 지급
            for (const general of nationGenerals) {
                const payment = Math.round(getBill(general.dedication) * ratio);
                worldAccess.updateGeneral(general.id, {
                    rice: general.rice + payment,
                });

                // 고위 관직(5 이상)에게는 수입 알림
                if (general.officerLevel > 4) {
                    logs.push({
                        scope: LogScope.GENERAL,
                        category: LogCategory.ACTION,
                        text: `이번 수입은 쌀 <C>${income.toLocaleString()}</>입니다.`,
                        generalId: general.id,
                        format: LogFormat.PLAIN,
                    });
                }

                logs.push({
                    scope: LogScope.GENERAL,
                    category: LogCategory.ACTION,
                    text: `봉급으로 쌀 <C>${payment.toLocaleString()}</>을 받았습니다.`,
                    generalId: general.id,
                    format: LogFormat.PLAIN,
                });
            }
        }

        // 글로벌 히스토리 로그
        logs.push({
            scope: LogScope.SYSTEM,
            category: LogCategory.HISTORY,
            text: '<W><b>【지급】</b></>가을이 되어 봉록에 따라 군량이 지급됩니다.',
            format: LogFormat.YEAR_MONTH,
        });

        for (const log of logs) {
            worldAccess.pushLog(log);
        }

        return {
            success: true,
            nations: worldAccess.listNations(),
            generals: worldAccess.listGenerals(),
            logs,
        };
    }
}
