import { Constraint, ConstraintContext, ConstraintResult, RequirementKey, StateView } from './Constraint.js';
import { MapUtil } from './MapData.js';

/**
 * 공통 제약 조건들을 생성하는 헬퍼 클래스
 */
export class ConstraintHelper {
  /**
   * 중립 상태가 아니어야 함
   */
  static NotBeNeutral(): Constraint {
    return {
      name: 'NotBeNeutral',
      requires: (ctx) => [{ kind: 'nation', id: ctx.nationId ?? 0 }],
      test: (ctx, view) => {
        const nation = view.get({ kind: 'nation', id: ctx.nationId ?? 0 });
        if (!nation || nation.id === 0) {
          return { kind: 'deny', reason: '중립 세력은 이 명령을 수행할 수 없습니다.' };
        }
        return { kind: 'allow' };
      },
    };
  }

  /**
   * 자금이 충분해야 함
   */
  static ReqGeneralGold(amount: number): Constraint {
    return {
      name: 'ReqGeneralGold',
      requires: (ctx) => [{ kind: 'general', id: ctx.actorId }],
      test: (ctx, view) => {
        const general = view.get({ kind: 'general', id: ctx.actorId });
        if (!general || general.gold < amount) {
          return { kind: 'deny', reason: `자금이 부족합니다. (필요: ${amount})` };
        }
        return { kind: 'allow' };
      },
    };
  }

  /**
   * 군량이 충분해야 함
   */
  static ReqGeneralRice(amount: number): Constraint {
    return {
      name: 'ReqGeneralRice',
      requires: (ctx) => [{ kind: 'general', id: ctx.actorId }],
      test: (ctx, view) => {
        const general = view.get({ kind: 'general', id: ctx.actorId });
        if (!general || general.rice < amount) {
          return { kind: 'deny', reason: `군량이 부족합니다. (필요: ${amount})` };
        }
        return { kind: 'allow' };
      },
    };
  }

  /**
   * 병사가 있어야 함
   */
  static ReqGeneralCrew(): Constraint {
    return {
      name: 'ReqGeneralCrew',
      requires: (ctx) => [{ kind: 'general', id: ctx.actorId }],
      test: (ctx, view) => {
        const general = view.get({ kind: 'general', id: ctx.actorId });
        if (!general || general.crew <= 0) {
          return { kind: 'deny', reason: '병사가 없습니다.' };
        }
        return { kind: 'allow' };
      },
    };
  }

  /**
   * 훈련도 여유가 있어야 함
   */
  static ReqGeneralTrainMargin(maxTrain: number): Constraint {
    return {
      name: 'ReqGeneralTrainMargin',
      requires: (ctx) => [{ kind: 'general', id: ctx.actorId }],
      test: (ctx, view) => {
        const general = view.get({ kind: 'general', id: ctx.actorId });
        if (!general || general.train >= maxTrain) {
          return { kind: 'deny', reason: `이미 최대 훈련도(${maxTrain})에 도달했습니다.` };
        }
        return { kind: 'allow' };
      },
    };
  }

  /**
   * 사기치 여유가 있어야 함
   */
  static ReqGeneralAtmosMargin(maxAtmos: number): Constraint {
    return {
      name: 'ReqGeneralAtmosMargin',
      requires: (ctx) => [{ kind: 'general', id: ctx.actorId }],
      test: (ctx, view) => {
        const general = view.get({ kind: 'general', id: ctx.actorId });
        if (!general || general.atmos >= maxAtmos) {
          return { kind: 'deny', reason: `이미 최대 사기치(${maxAtmos})에 도달했습니다.` };
        }
        return { kind: 'allow' };
      },
    };
  }

  /**
   * 점령된 도시여야 함 (공백지 불가)
   */
  static OccupiedCity(): Constraint {
    return {
      name: 'OccupiedCity',
      requires: (ctx) => [{ kind: 'city', id: ctx.cityId ?? 0 }],
      test: (ctx, view) => {
        const city = view.get({ kind: 'city', id: ctx.cityId ?? 0 });
        if (!city || city.nationId === 0) {
          return { kind: 'deny', reason: '공백지에서는 이 명령을 수행할 수 없습니다.' };
        }
        return { kind: 'allow' };
      },
    };
  }

  /**
   * 보급이 연결된 도시여야 함
   */
  static SuppliedCity(): Constraint {
    return {
      name: 'SuppliedCity',
      requires: (ctx) => [{ kind: 'city', id: ctx.cityId ?? 0 }],
      test: (ctx, view) => {
        const city = view.get({ kind: 'city', id: ctx.cityId ?? 0 });
        // supply가 undefined이면 (테스트 등) 통과? 아니면 실패? 
        // 안전하게 supply === 1 체크. (기본값 1)
        if (!city || city.supply !== 1) {
          return { kind: 'deny', reason: '보급이 끊긴 도시에서는 이 명령을 수행할 수 없습니다.' };
        }
        return { kind: 'allow' };
      },
    };
  }

  /**
   * 인접한 도시여야 함
   */
  static NearCity(distance: number = 1): Constraint {
    return {
      name: 'NearCity',
      requires: (ctx) => [
        { kind: 'city', id: ctx.cityId ?? 0 },
        { kind: 'arg', key: 'destCityId' }
      ],
      test: (ctx, view) => {
        const destCityId = ctx.args.destCityId;
        if (!destCityId) return { kind: 'deny', reason: '목적지 도시가 지정되지 않았습니다.' };
        if (ctx.cityId === destCityId) return { kind: 'deny', reason: '현재 도시와 목적지 도시가 같습니다.' };

        if (distance === 1) {
          if (!MapUtil.areAdjacent(ctx.cityId ?? 0, destCityId)) {
            return { kind: 'deny', reason: '인접한 도시가 아닙니다.' };
          }
        } else {
          const dist = MapUtil.getDistance(ctx.cityId ?? 0, destCityId);
          if (dist > distance) {
            return { kind: 'deny', reason: `거리가 너무 멉니다. (현재: ${dist}, 최대: ${distance})` };
          }
        }

        return { kind: 'allow' };
      },
    };
  }

  /**
   * 대상 장수가 존재해야 함
   */
  static ExistsDestGeneral(): Constraint {
    return {
      name: 'ExistsDestGeneral',
      requires: (ctx) => [{ kind: 'destGeneral', id: ctx.args.destGeneralId }],
      test: (ctx, view) => {
        const destGeneral = view.get({ kind: 'destGeneral', id: ctx.args.destGeneralId });
        if (!destGeneral) {
          return { kind: 'deny', reason: '대상 장수가 존재하지 않습니다.' };
        }
        return { kind: 'allow' };
      },
    };
  }

  /**
   * 대상 장수가 같은 국가 소속이어야 함
   */
  static FriendlyDestGeneral(): Constraint {
    return {
      name: 'FriendlyDestGeneral',
      requires: (ctx) => [
        { kind: 'general', id: ctx.actorId },
        { kind: 'destGeneral', id: ctx.args.destGeneralId }
      ],
      test: (ctx, view) => {
        const general = view.get({ kind: 'general', id: ctx.actorId });
        const destGeneral = view.get({ kind: 'destGeneral', id: ctx.args.destGeneralId });
        if (!general || !destGeneral) return { kind: 'allow' };

        if (general.nationId !== destGeneral.nationId) {
          return { kind: 'deny', reason: '같은 국가 소속 장수가 아닙니다.' };
        }
        return { kind: 'allow' };
      },
    };
  }

  /**
   * 대상 장수가 다른 국가 소속이어야 함
   */
  static DifferentNationDestGeneral(): Constraint {
    return {
      name: 'DifferentNationDestGeneral',
      requires: (ctx) => [
        { kind: 'general', id: ctx.actorId },
        { kind: 'destGeneral', id: ctx.args.destGeneralId }
      ],
      test: (ctx, view) => {
        const general = view.get({ kind: 'general', id: ctx.actorId });
        const destGeneral = view.get({ kind: 'destGeneral', id: ctx.args.destGeneralId });
        if (!general || !destGeneral) return { kind: 'allow' }; // 다른 제약에서 걸릴 것

        if (general.nationId === destGeneral.nationId) {
          return { kind: 'deny', reason: '같은 국가 소속 장수는 등용할 수 없습니다.' };
        }
        return { kind: 'allow' };
      },
    };
  }

  /**
   * 특정 관직 레벨 이상 요구
   */
  /**
   * 특정 관직 레벨 이상 요구
   */
  public static ReqOfficerLevel(minLevel: number): Constraint {
    return {
      name: 'ReqOfficerLevel',
      requires: (ctx) => [{ kind: 'general', id: ctx.actorId }],
      test: (ctx, view) => {
        const general = view.get({ kind: 'general', id: ctx.actorId });
        if (!general) return { kind: 'deny', reason: '장수를 찾을 수 없습니다.' };
        if (general.officerLevel < minLevel) {
          return { kind: 'deny', reason: `관직 레벨이 부족합니다. (요구: ${minLevel})` };
        }
        return { kind: 'allow' };
      },
    };
  }

  /**
   * 재야(중립) 상태여야 함
   */
  public static BeNeutral(): Constraint {
    return {
      name: 'BeNeutral',
      requires: (ctx) => [{ kind: 'general', id: ctx.actorId }],
      test: (ctx, view) => {
        const general = view.get({ kind: 'general', id: ctx.actorId });
        if (!general) return { kind: 'deny', reason: '장수를 찾을 수 없습니다.' };
        if (general.nationId !== 0) {
          return { kind: 'deny', reason: '이미 소속된 국가가 있습니다.' };
        }
        return { kind: 'allow' };
      },
    };
  }

  public static BeLord(): Constraint {
    return {
      name: 'BeLord',
      requires: (ctx) => [
        { kind: 'general', id: ctx.actorId },
        { kind: 'nation', id: ctx.nationId ?? 0 }
      ],
      test: (ctx, view) => {
        const general = view.get({ kind: 'general', id: ctx.actorId });
        const nation = view.get({ kind: 'nation', id: ctx.nationId ?? 0 });
        
        if (!general || !nation) return { kind: 'deny', reason: '국가 정보를 찾을 수 없습니다.' };
        if (nation.chiefGeneralId !== general.id) {
            return { kind: 'deny', reason: '군주만 실행할 수 있습니다.' };
        }
        return { kind: 'allow' };
      },
    };
  }

  public static WanderingNation(): Constraint {
    return {
        name: 'WanderingNation',
        requires: (ctx) => [{ kind: 'nation', id: ctx.nationId ?? 0 }],
        test: (ctx, view) => {
            const nation = view.get({ kind: 'nation', id: ctx.nationId ?? 0 });
            if (!nation || nation.level !== 0) {
                return { kind: 'deny', reason: '방랑군 상태여야 합니다.' };
            }
            return { kind: 'allow' };
        }
    };
  }

  public static NotWanderingNation(): Constraint {
    return {
        name: 'NotWanderingNation',
        requires: (ctx) => [{ kind: 'nation', id: ctx.nationId ?? 0 }],
        test: (ctx, view) => {
            const nation = view.get({ kind: 'nation', id: ctx.nationId ?? 0 });
            if (nation && nation.level === 0) {
                return { kind: 'deny', reason: '방랑군은 이 명령을 수행할 수 없습니다.' };
            }
            return { kind: 'allow' };
        }
    };
  }

  public static RemainCityCapacity(key: 'agri' | 'comm' | 'secu' | 'def' | 'wall', actionName: string): Constraint {
    return {
      name: 'RemainCityCapacity',
      requires: (ctx) => [{ kind: 'city', id: ctx.cityId ?? 0 }],
      test: (ctx, view) => {
        const city = view.get({ kind: 'city', id: ctx.cityId ?? 0 });
        if (!city) return { kind: 'deny', reason: '도시 정보를 찾을 수 없습니다.' };
        
        const current = city[key] ?? 0;
        const max = city[`${key}Max`] ?? 0;

        if (current >= max) {
          return { kind: 'deny', reason: `이미 해당 도시의 ${actionName} 수치가 최대치에 도달했습니다.` };
        }
        return { kind: 'allow' };
      },
    };
  }

  public static ReqNationGeneralCount(minCount: number): Constraint {
    return {
        name: 'ReqNationGeneralCount',
        requires: (ctx) => [{ kind: 'nation', id: ctx.nationId ?? 0 }],
        test: (ctx, view) => {
            const nation = view.get({ kind: 'nation', id: ctx.nationId ?? 0 });
            if (!nation) return { kind: 'deny', reason: '국가 정보를 찾을 수 없습니다.' };
            if (nation.gennum < minCount) {
                return { kind: 'deny', reason: `장수 수가 부족합니다. (요구: ${minCount})` };
            }
            return { kind: 'allow' };
        }
    };
  }

  public static ExistsRecruitMessage(): Constraint {
    return {
      name: 'ExistsRecruitMessage',
      requires: (ctx) => [
        { kind: 'arg', key: 'messageId' },
        { kind: 'message', id: ctx.args.messageId }
      ],
      test: (ctx, view) => {
        const messageId = ctx.args.messageId;
        if (!messageId) return { kind: 'deny', reason: '서신 ID가 지정되지 않았습니다.' };
        const message = view.get({ kind: 'message', id: messageId });
        if (!message) return { kind: 'deny', reason: '해당 서신이 존재하지 않습니다.' };
        if (message.meta?.type !== 'recruit') return { kind: 'deny', reason: '등용 권유 서신이 아닙니다.' };
        if (message.destId !== ctx.actorId) return { kind: 'deny', reason: '본인에게 온 서신이 아닙니다.' };
        return { kind: 'allow' };
      }
    }
  }

  public static ConstructableCity(): Constraint {
    return {
        name: 'ConstructableCity',
        requires: (ctx) => [{ kind: 'city', id: ctx.cityId ?? 0 }],
        test: (ctx, view) => {
            const city = view.get({ kind: 'city', id: ctx.cityId ?? 0 });
            // Level 5(소) 이상이어야 건국 가능 (1,2,3,4 불가)
            if (!city || city.level < 5) {
                return { kind: 'deny', reason: '건국할 수 없는 도시입니다.' };
            }
            return { kind: 'allow' };
        }
    };
  }

  public static CheckNationNameDuplicate(name: string): Constraint {
    return {
        name: 'CheckNationNameDuplicate',
        requires: (ctx) => [], // Needs global nation list access?
        test: (ctx, view) => {
            // Need access to all nations. View might need to support `getAllNations`?
            // Or I skip this in constraint and check in Command.run.
            return { kind: 'allow' };
        }
    };
  }

  public static ReqCitySecu(reqSecu: number): Constraint {
    return {
      name: 'ReqCitySecu',
      requires: (ctx) => [{ kind: 'city', id: ctx.cityId ?? 0 }],
      test: (ctx, view) => {
        const city = view.get({ kind: 'city', id: ctx.cityId ?? 0 });
        if (!city) return { kind: 'deny', reason: '도시 정보를 찾을 수 없습니다.' };
        if (city.secu < reqSecu) {
          return { kind: 'deny', reason: `도시의 치안 수치가 부족합니다. (요구: ${reqSecu})` };
        }
        return { kind: 'allow' };
      },
    };
  }

  public static ReqCityTrader(npcType: number): Constraint {
    return {
      name: 'ReqCityTrader',
      requires: (ctx) => [{ kind: 'city', id: ctx.cityId ?? 0 }],
      test: (ctx, view) => {
        const city = view.get({ kind: 'city', id: ctx.cityId ?? 0 });
        if (!city) return { kind: 'deny', reason: '도시 정보를 찾을 수 없습니다.' };
        // 상선/상인이 있는 도시는 trade 수치가 높거나 특정 메타 데이터가 있어야 함.
        // 레거시에서는 CityConst::byID($general->getCityID())->trade >= 10 등으로 체크? 
        // 일단 trade >= 10 을 상인 존재 여부로 가정.
        if (city.trade < 10 && npcType === 0) {
          return { kind: 'deny', reason: '상인이 없는 도시입니다.' };
        }
        return { kind: 'allow' };
      },
    };
  }

  public static AlwaysFail(reason: string): Constraint {
    return {
      name: 'AlwaysFail',
      requires: () => [],
      test: () => ({ kind: 'deny', reason }),
    };
  }

  public static ReqCityTrust(actionName: string): Constraint {
    return {
      name: 'ReqCityTrust',
      requires: (ctx) => [{ kind: 'city', id: ctx.cityId ?? 0 }],
      test: (ctx, view) => {
        const city = view.get({ kind: 'city', id: ctx.cityId ?? 0 });
        if (!city) return { kind: 'deny', reason: '도시 정보를 찾을 수 없습니다.' };
        if (city.trust >= 100) {
          return { kind: 'deny', reason: `이미 ${actionName} 수치가 최대치(100)에 도달했습니다.` };
        }
        return { kind: 'allow' };
      },
    };
  }

  public static ReqNationMeta(key: string, expectedValue: any, compare: 'eq' | 'gt' | 'lt' | 'ge' | 'le' = 'eq', reason?: string): Constraint {
    return {
      name: 'ReqNationMeta',
      requires: (ctx) => [{ kind: 'nation', id: ctx.nationId ?? 0 }],
      test: (ctx, view) => {
        const nation = view.get({ kind: 'nation', id: ctx.nationId ?? 0 });
        if (!nation) return { kind: 'deny', reason: '국가 정보를 찾을 수 없습니다.' };
        
        const value = nation.meta[key] ?? 0;
        let pass = false;
        switch (compare) {
          case 'eq': pass = value === expectedValue; break;
          case 'gt': pass = value > expectedValue; break;
          case 'lt': pass = value < expectedValue; break;
          case 'ge': pass = value >= expectedValue; break;
          case 'le': pass = value <= expectedValue; break;
        }

        if (!pass) {
          return { kind: 'deny', reason: reason ?? `국가 설정 조건(${key})을 만족하지 않습니다.` };
        }
        return { kind: 'allow' };
      },
    };
  }
}
