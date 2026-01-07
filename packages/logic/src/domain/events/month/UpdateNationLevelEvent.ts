import { GameEvent, EventTarget } from "../types.js";
import { WorldSnapshot, WorldDelta } from "../../entities.js";
import { JosaUtil, RandUtil, LiteHashDRBG } from "@sammo/common";
import { getItemRegistry } from "../items/ItemRegistry.js";

/**
 * 국가 작위/레벨 갱신 이벤트
 * 레거시: UpdateNationLevel.php
 *
 * 매월 실행되며, 국가의 도시 점유 수에 따라 작위를 갱신합니다.
 * - 지배 도시 수(규모 4 이상)에 따라 호족 -> 군벌 -> 주자사 -> 주목 -> 공 -> 왕 -> 황제로 승급합니다.
 * - 승급 시 금/쌀 보상 및 국가 보조 데이터가 갱신됩니다.
 * - 승급 시 휘하 장수들에게 무작위 유니크 아이템이 보상으로 지급될 수 있습니다.
 */
export class UpdateNationLevelEvent implements GameEvent {
    public id = "update_nation_level_event";
    public name = "국가 작위 갱신";
    public target = EventTarget.MONTH;
    public priority = 20;

    // 도시 수에 따른 최소 작위 레벨 (레거시: nationLevelByCityCnt)
    private static readonly NATION_LEVEL_BY_CITY_CNT = [
        0, // 방랑군 (기본 0, 도시 0)
        1, // 호족 (도시 1)
        2, // 군벌 (도시 2)
        5, // 주자사 (도시 5)
        8, // 주목 (도시 8)
        11, // 공 (도시 11)
        16, // 왕 (도시 16)
        21, // 황제 (도시 21)
    ];

    // 작위 명칭 (레거시: getNationLevel)
    private static readonly NATION_LEVEL_NAMES: Record<number, string> = {
        0: "방랑군",
        1: "호족",
        2: "군벌",
        3: "주자사",
        4: "주목",
        5: "공",
        6: "왕",
        7: "황제",
    };

    condition(): boolean {
        return true; // 매달 실행
    }

    action(snapshot: WorldSnapshot): WorldDelta {
        const delta: WorldDelta = {
            nations: {},
            generals: {},
            logs: {
                global: [],
                nation: {},
            },
        };

        const dNations = delta.nations!;
        const dGenerals = delta.generals!;
        const dLogs = delta.logs!;

        // 1. 국가별 규모 4 이상의 도시 수 계산
        const nationCityCounts: Record<number, number> = {};
        for (const city of Object.values(snapshot.cities)) {
            if (city.nationId === 0) continue;
            if (city.level >= 4) {
                nationCityCounts[city.nationId] = (nationCityCounts[city.nationId] || 0) + 1;
            }
        }

        // 2. 국가별 작위 갱신 여부 판단
        for (const nation of Object.values(snapshot.nations)) {
            const cityCnt = nationCityCounts[nation.id] || 0;

            let newLevel = 0;
            for (let i = 0; i < UpdateNationLevelEvent.NATION_LEVEL_BY_CITY_CNT.length; i++) {
                if (cityCnt < UpdateNationLevelEvent.NATION_LEVEL_BY_CITY_CNT[i]) {
                    break;
                }
                newLevel = i;
            }

            // 작위가 상승했을 경우
            if (newLevel > nation.level) {
                const oldLevelName = UpdateNationLevelEvent.NATION_LEVEL_NAMES[nation.level] || "불명";
                const newLevelName = UpdateNationLevelEvent.NATION_LEVEL_NAMES[newLevel] || "불명";
                const levelDiff = newLevel - nation.level;

                // 국가 자금/군량 보상
                dNations[nation.id] = {
                    level: newLevel,
                    gold: (nation.gold || 0) + newLevel * 1000,
                    rice: (nation.rice || 0) + newLevel * 1000,
                };

                const lord = snapshot.generals[nation.chiefGeneralId];
                const lordName = lord ? lord.name : "군주";
                const josaYi = JosaUtil.pick(lordName, "이");
                const josaRo = JosaUtil.pick(newLevelName, "로");

                let logMsg = "";
                switch (newLevel) {
                    case 7: // 황제
                        logMsg = `【작위】 ${nation.name} ${oldLevelName} ${lordName}${josaYi} ${newLevelName}${josaRo} 옹립되었습니다.`;
                        dNations[nation.id].aux = {
                            ...nation.aux,
                            can_change_color: 1,
                            can_change_name: 1,
                        };
                        break;
                    case 6: // 왕
                        logMsg = `【작위】 ${nation.name}의 ${lordName}${josaYi} ${newLevelName}${josaRo} 책봉되었습니다.`;
                        break;
                    case 5: // 공
                    case 4: // 주목
                    case 3: // 주자사
                        logMsg = `【작위】 ${nation.name}의 ${lordName}${josaYi} ${newLevelName}${josaRo} 임명되었습니다.`;
                        break;
                    case 2: // 군벌
                        const josaRa = JosaUtil.pick(nation.name, "라");
                        logMsg = `【작위】 ${lordName}${josaYi} 독립하여 ${nation.name}${josaRa}는 ${newLevelName}${josaRo} 나섰습니다.`;
                        break;
                }

                if (logMsg) {
                    dLogs.global!.push(logMsg);
                    if (!dLogs.nation![nation.id]) dLogs.nation![nation.id] = [];
                    dLogs.nation![nation.id].push(logMsg);
                }

                // 3. 유니크 아이템 지급 (레거시 간소화)
                // 국가 내 장수들 중 무작위로 추첨하여 유니크 아이템 지급
                const nationGenerals = Object.values(snapshot.generals).filter(
                    (g) => g.nationId === nation.id && g.npc < 2
                );

                if (nationGenerals.length > 0) {
                    const registry = getItemRegistry();
                    const uniqueItems = registry.getUniqueCodes();

                    if (uniqueItems.length > 0) {
                        const seed = `${snapshot.env.hiddenSeed}:nation_level_reward:${nation.id}:${snapshot.gameTime.year}:${snapshot.gameTime.month}`;
                        const rng = new RandUtil(new LiteHashDRBG(seed));

                        for (let i = 0; i < levelDiff; i++) {
                            if (nationGenerals.length === 0) break;
                            const winner = rng.choice(nationGenerals);
                            const itemCode = rng.choice(uniqueItems);
                            const item = registry.create(itemCode);

                            if (item) {
                                // 이미 해당 카테고리 아이템이 있으면 패스하거나 덮어쓰기 (레거시는 giveRandomUniqueItem에서 처리)
                                const gDelta: any = dGenerals[winner.id] || {};
                                gDelta[item.type] = item.code;
                                dGenerals[winner.id] = gDelta;

                                const josaUl = JosaUtil.pick(item.name, "을");
                                const winMsg = `${winner.name}에게 작위 보상으로 유니크 아이템 【${item.name}】${josaUl} 수여했습니다.`;
                                if (!dLogs.nation![nation.id]) dLogs.nation![nation.id] = [];
                                dLogs.nation![nation.id].push(winMsg);
                            }
                        }
                    }
                }
            }
        }

        return delta;
    }
}
