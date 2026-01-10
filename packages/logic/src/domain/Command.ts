/**
 * @fileoverview 커맨드 시스템의 핵심 정의
 *
 * 삼국지 모의전투에서 '커맨드'는 장수나 국가가 수행하는 모든 행동을 의미합니다.
 * 예: 이동, 모병, 건국, 선전포고 등
 *
 * 이 파일에는 커맨드의 기본 인터페이스와 장수 커맨드의 베이스 클래스가 정의되어 있습니다.
 *
 * @example
 * ```typescript
 * // 커맨드 실행 흐름
 * const cmd = new GeneralMoveCommand();
 *
 * // 1단계: 사전 검사 (UI에서 버튼 활성화 여부 판단용)
 * const precheck = cmd.checkConstraints(rng, snapshot, generalId, args, 'precheck');
 *
 * // 2단계: 전체 검사 (실제 실행 전)
 * const fullCheck = cmd.checkConstraints(rng, snapshot, generalId, args, 'full');
 *
 * // 3단계: 실행 (상태 변경 델타 반환)
 * const delta = cmd.run(rng, snapshot, generalId, args);
 * ```
 */

import { RandUtil } from "@sammo/common";
import {
  Constraint,
  ConstraintContext,
  ConstraintResult,
  RequirementKey,
  StateView,
} from "./Constraint.js";
import { WorldSnapshot, WorldDelta } from "./entities.js";

/**
 * 커맨드 인터페이스
 *
 * 모든 게임 행동(커맨드)이 구현해야 하는 기본 계약입니다.
 * 커맨드는 반드시 순수 함수처럼 동작해야 하며, 스냅샷을 직접 수정하지 않고
 * 델타(변경사항)를 반환해야 합니다.
 *
 * @interface Command
 */
export interface Command {
  /**
   * 커맨드의 고유 식별자
   * 예: 'che_이동', 'che_모병', 'che_건국'
   */
  readonly actionName: string;

  /**
   * 이 커맨드에 적용되는 제약조건 목록을 반환합니다.
   *
   * @param ctx - 제약조건 검사에 필요한 컨텍스트 (행위자, 대상, 인자 등)
   * @returns 검사할 제약조건 배열
   */
  getConstraints(ctx: ConstraintContext): Constraint[];

  /**
   * 커맨드 실행 가능 여부를 검사합니다.
   *
   * @param rng - 결정론적 난수 생성기 (확률 판정에 사용)
   * @param snapshot - 현재 게임 상태의 읽기 전용 스냅샷
   * @param actorId - 행동을 수행하는 장수/국가의 ID
   * @param args - 커맨드 실행에 필요한 추가 인자 (예: 목적지 도시 ID)
   * @param mode - 검사 모드
   *   - 'precheck': 최소 조건만 검사 (UI용, 빠른 판정)
   *   - 'full': 모든 조건 검사 (실행 직전)
   * @returns 검사 결과 (허용/거부/미확정)
   */
  checkConstraints(
    rng: RandUtil,
    snapshot: WorldSnapshot,
    actorId: number,
    args: Record<string, any>,
    mode?: "full" | "precheck"
  ): ConstraintResult;

  /**
   * 커맨드를 실행하고 상태 변경 델타를 반환합니다.
   *
   * ⚠️ 중요: 이 메서드는 snapshot을 절대 직접 수정하면 안 됩니다!
   * 반드시 WorldDelta 객체를 반환하여 변경사항을 표현해야 합니다.
   *
   * @param rng - 결정론적 난수 생성기
   * @param snapshot - 현재 게임 상태 (읽기 전용)
   * @param actorId - 행동 주체의 ID
   * @param args - 커맨드 인자
   * @returns 상태 변경 델타 (이 델타가 WorldState에 적용됨)
   *
   * @example
   * ```typescript
   * // 골드 1000 소비, 병력 500 증가
   * return {
   *   generals: { [actorId]: { gold: general.gold - 1000, crew: general.crew + 500 } }
   * };
   * ```
   */
  run(
    rng: RandUtil,
    snapshot: WorldSnapshot,
    actorId: number,
    args: Record<string, any>
  ): WorldDelta;
}

/**
 * WorldSnapshot 기반 StateView 구현체
 *
 * 제약조건(Constraint)이 게임 상태에 접근할 때 사용하는 어댑터입니다.
 * RequirementKey를 받아 해당하는 엔티티(장수, 도시, 국가 등)를 반환합니다.
 *
 * @class SnapshotStateView
 * @implements {StateView}
 */
export class SnapshotStateView implements StateView {
  /**
   * @param snapshot - 조회할 게임 상태 스냅샷
   */
  constructor(private snapshot: WorldSnapshot) {}

  /**
   * 요구사항 키에 해당하는 데이터가 존재하는지 확인합니다.
   *
   * @param req - 조회할 요구사항 키
   * @returns 데이터 존재 여부
   */
  has(req: RequirementKey): boolean {
    return this.get(req) !== null;
  }

  /**
   * 요구사항 키에 해당하는 데이터를 조회합니다.
   *
   * @param req - 조회할 요구사항 키
   * @returns 해당 엔티티 또는 null
   *
   * @example
   * ```typescript
   * // 장수 조회
   * const general = view.get({ kind: 'general', id: 123 });
   *
   * // 도시 조회
   * const city = view.get({ kind: 'city', id: 45 });
   *
   * // 연월 조회 (예: 190년 3월 = 190*12 + 3 = 2283)
   * const yearMonth = view.get({ kind: 'env', key: 'yearMonth' });
   * ```
   */
  get(req: RequirementKey): any | null {
    switch (req.kind) {
      // 행위자 장수 또는 대상 장수
      case "general":
      case "destGeneral":
        return this.snapshot.generals[req.id] || null;

      // 현재 도시 또는 대상 도시
      case "city":
      case "destCity":
        return this.snapshot.cities[req.id] || null;

      // 소속 국가 또는 대상 국가
      case "nation":
      case "destNation":
        return this.snapshot.nations[req.id] || null;

      case "env":
        if (req.key === "yearMonth") {
          return this.snapshot.gameTime.year * 12 + this.snapshot.gameTime.month;
        }
        return this.snapshot.env[req.key] || null;

      default:
        return null;
    }
  }
}

/**
 * 장수 커맨드 베이스 클래스
 *
 * 개별 장수가 수행하는 모든 행동의 부모 클래스입니다.
 * 이동, 모병, 훈련, 등용, 공성 등 장수 레벨의 커맨드가 이 클래스를 상속합니다.
 *
 * @abstract
 * @class GeneralCommand
 * @implements {Command}
 *
 * @example
 * ```typescript
 * export class GeneralMoveCommand extends GeneralCommand {
 *   readonly actionName = 'che_이동';
 *
 *   constructor() {
 *     super();
 *     // 최소 조건: 턴이 있어야 함
 *     this.minConditionConstraints = [new ReqGeneralTurnConstraint()];
 *     // 전체 조건: 턴 + 목적지까지 경로 존재
 *     this.fullConditionConstraints = [
 *       new ReqGeneralTurnConstraint(),
 *       new HasRouteConstraint(),
 *     ];
 *   }
 *
 *   run(rng, snapshot, actorId, args) {
 *     // 이동 로직 구현...
 *     return { generals: { [actorId]: { cityId: args.destCityId } } };
 *   }
 * }
 * ```
 */
export abstract class GeneralCommand implements Command {
  /**
   * 커맨드 고유 식별자 (하위 클래스에서 구현)
   */
  abstract readonly actionName: string;

  /**
   * 최소 조건 제약 목록
   * UI에서 버튼 활성화 여부를 빠르게 판단할 때 사용합니다.
   * 예: 턴이 있는지, 기본 자원이 있는지 등
   */
  protected minConditionConstraints: Constraint[] = [];

  /**
   * 전체 조건 제약 목록
   * 커맨드 실행 직전에 모든 조건을 검사할 때 사용합니다.
   * 예: 경로 존재 여부, 외교 상태, 상세 자원 요구량 등
   */
  protected fullConditionConstraints: Constraint[] = [];

  /**
   * 검사 모드에 따른 제약조건 목록을 반환합니다.
   *
   * @param ctx - 제약조건 컨텍스트
   * @returns 검사할 제약조건 배열
   */
  getConstraints(ctx: ConstraintContext): Constraint[] {
    return ctx.mode === "full" ? this.fullConditionConstraints : this.minConditionConstraints;
  }

  /**
   * 제약 조건을 순차적으로 검사합니다.
   *
   * 첫 번째로 실패한 제약조건의 결과를 반환합니다.
   * 모든 제약조건을 통과하면 { kind: 'allow' }를 반환합니다.
   *
   * @param rng - 난수 생성기
   * @param snapshot - 게임 상태 스냅샷
   * @param actorId - 행위자 장수 ID
   * @param args - 커맨드 인자
   * @param mode - 검사 모드 ('full' 또는 'precheck')
   * @returns 제약 검사 결과
   */
  public checkConstraints(
    rng: RandUtil,
    snapshot: WorldSnapshot,
    actorId: number,
    args: Record<string, any>,
    mode: "full" | "precheck" = "full"
  ): ConstraintResult {
    // 행위자 장수 정보 조회
    const general = snapshot.generals[actorId];

    // 제약조건 검사에 필요한 컨텍스트 구성
    const ctx: ConstraintContext = {
      actorId,
      cityId: general?.cityId,
      nationId: general?.nationId,
      args,
      env: {}, // TODO: 게임 환경 변수 주입 (시작연도, 게임 설정 등)
      mode,
    };

    // 스냅샷을 StateView로 래핑 (제약조건이 데이터에 접근하는 인터페이스)
    const view = new SnapshotStateView(snapshot);

    // 현재 모드에 해당하는 제약조건 목록 획득
    const constraints = this.getConstraints(ctx);

    // 모든 제약조건을 순차 검사
    for (const constraint of constraints) {
      const result = constraint.test(ctx, view);
      // 하나라도 실패하면 즉시 반환 (Early Return)
      if (result.kind !== "allow") {
        return result;
      }
    }

    // 모든 제약조건 통과
    return { kind: "allow" };
  }

  /**
   * 커맨드 실행 (하위 클래스에서 구현)
   *
   * @abstract
   * @param rng - 난수 생성기
   * @param snapshot - 게임 상태 (읽기 전용)
   * @param actorId - 행위자 ID
   * @param args - 커맨드 인자
   * @returns 상태 변경 델타
   */
  abstract run(
    rng: RandUtil,
    snapshot: WorldSnapshot,
    actorId: number,
    args: Record<string, any>
  ): WorldDelta;
}
