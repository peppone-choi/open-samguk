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
        }
        // TODO: distance > 1 인 경우 경로 탐색 필요

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
}
