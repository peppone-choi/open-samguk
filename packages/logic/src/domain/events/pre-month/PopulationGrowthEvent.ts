import { GameEvent, EventTarget } from '../types.js';
import { WorldSnapshot, WorldDelta } from '../../entities.js';

/**
 * 인구 증가 이벤트
 * 레거시: ProcessSemiAnnual.popIncrease()
 *
 * 세율에 따라 인구와 내정 수치가 변동됩니다.
 * - 세율이 낮을수록 인구 증가율이 높아집니다.
 * - 세율 20%: 5% 증가
 * - 세율 5%: 12.5% 증가
 * - 세율 50%: 10% 감소
 */
export class PopulationGrowthEvent implements GameEvent {
    public id = 'population_growth_event';
    public name = '인구 증가';
    public target = EventTarget.PRE_MONTH;
    public priority = 10; // 세금 징수보다 먼저 실행

    private static readonly BASE_POP_INCREASE = 100; // GameConst::$basePopIncreaseAmount

    condition(snapshot: WorldSnapshot): boolean {
        // 6월, 12월에만 실행 (반기)
        const month = snapshot.gameTime.month;
        return month === 6 || month === 12;
    }

    action(snapshot: WorldSnapshot): WorldDelta {
        const delta: WorldDelta = {
            cities: {},
            logs: {
                global: [],
            },
        };

        const dCities = delta.cities as NonNullable<WorldDelta['cities']>;
        const dLogs = delta.logs as Required<NonNullable<WorldDelta['logs']>>;

        // 공백지 (nationId = 0) 처리: 민심 50으로 고정, 내정 1% 감소
        for (const city of Object.values(snapshot.cities)) {
            if (city.nationId === 0) {
                dCities[city.id] = {
                    trust: 50,
                    agri: Math.floor(city.agri * 0.99),
                    comm: Math.floor(city.comm * 0.99),
                    secu: Math.floor(city.secu * 0.99),
                    def: Math.floor(city.def * 0.99),
                    wall: Math.floor(city.wall * 0.99),
                };
            }
        }

        // 국가별 인구 및 내정 증가
        for (const nation of Object.values(snapshot.nations)) {
            const taxRate = nation.rateTmp || nation.rate || 20;

            // 인구 증가율: (30 - 세율) / 200
            // 세율 20%: 5%, 세율 5%: 12.5%, 세율 50%: -10%
            const popRatio = (30 - taxRate) / 200;

            // 내정 증가율: (20 - 세율) / 200
            // 세율 20%: 0%, 세율 0%: 10%, 세율 100%: -40%
            const genericRatio = (20 - taxRate) / 200;

            // 민심 변화: 20 - 세율
            const trustDiff = 20 - taxRate;

            // 해당 국가의 보급 연결된 도시들만 처리
            const nationCities = Object.values(snapshot.cities).filter(
                c => c.nationId === nation.id && c.supply === 1
            );

            for (const city of nationCities) {
                const secuRatio = city.secuMax > 0 ? city.secu / city.secuMax : 0;

                // 인구 계산: 치안에 따라 증가율 보정
                let newPop: number;
                if (popRatio >= 0) {
                    // 증가 시: 치안이 높으면 추가 보너스 (최대 10%)
                    newPop = Math.floor(
                        PopulationGrowthEvent.BASE_POP_INCREASE +
                        city.pop * (1 + popRatio * (1 + secuRatio / 10))
                    );
                } else {
                    // 감소 시: 치안이 높으면 감소 완화
                    newPop = Math.floor(
                        PopulationGrowthEvent.BASE_POP_INCREASE +
                        city.pop * (1 + popRatio * (1 - secuRatio / 10))
                    );
                }
                newPop = Math.min(newPop, city.popMax);

                // 내정 수치 계산
                const newAgri = Math.min(
                    Math.floor(city.agri * (1 + genericRatio)),
                    city.agriMax
                );
                const newComm = Math.min(
                    Math.floor(city.comm * (1 + genericRatio)),
                    city.commMax
                );
                const newSecu = Math.min(
                    Math.floor(city.secu * (1 + genericRatio)),
                    city.secuMax
                );
                const newDef = Math.min(
                    Math.floor(city.def * (1 + genericRatio)),
                    city.defMax
                );
                const newWall = Math.min(
                    Math.floor(city.wall * (1 + genericRatio)),
                    city.wallMax
                );

                // 민심 계산: 0 ~ 100 범위
                const newTrust = Math.max(0, Math.min(100, city.trust + trustDiff));

                dCities[city.id] = {
                    pop: newPop,
                    agri: newAgri,
                    comm: newComm,
                    secu: newSecu,
                    def: newDef,
                    wall: newWall,
                    trust: newTrust,
                };
            }
        }

        if (Object.keys(dCities).length > 0) {
            dLogs.global.push('반기 인구 및 내정 정산이 완료되었습니다.');
        }

        return delta;
    }
}
