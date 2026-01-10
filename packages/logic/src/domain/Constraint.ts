/**
 * @fileoverview 제약조건 시스템 핵심 정의
 *
 * 제약조건(Constraint)은 커맨드 실행 전 검사하는 규칙입니다.
 * 예: 골드가 충분한가? 군주인가? 경로가 존재하는가?
 *
 * 제약조건은 3가지 결과를 반환할 수 있습니다:
 * - allow: 조건 충족, 실행 가능
 * - deny: 조건 불충족, 실행 불가 (사유 포함)
 * - unknown: 필요한 데이터가 없어 판단 불가
 */

/**
 * 요구사항 키
 *
 * 제약조건이 검사에 필요한 데이터를 식별하는 키입니다.
 * StateView에서 이 키로 데이터를 조회합니다.
 */
export type RequirementKey =
  | { kind: "general"; id: number } // 행위자 장수
  | { kind: "city"; id: number } // 현재 도시
  | { kind: "nation"; id: number } // 소속 국가
  | { kind: "destGeneral"; id: number } // 대상 장수
  | { kind: "destCity"; id: number } // 대상 도시
  | { kind: "destNation"; id: number } // 대상 국가
  | { kind: "arg"; key: string } // 커맨드 인자
  | { kind: "env"; key: string } // 환경 변수
  | { kind: "message"; id: number }; // 메시지

/**
 * 제약조건 검사 결과
 *
 * @example
 * // 허용
 * { kind: 'allow' }
 *
 * // 거부 (골드 부족)
 * { kind: 'deny', reason: '골드가 부족합니다', code: 'INSUFFICIENT_GOLD' }
 *
 * // 미확정 (필요한 데이터 없음)
 * { kind: 'unknown', missing: [{ kind: 'destCity', id: 5 }] }
 */
export type ConstraintResult =
  | { kind: "allow" }
  | { kind: "deny"; reason: string; code?: string }
  | { kind: "unknown"; missing: RequirementKey[] };

/**
 * 제약조건 검사 컨텍스트
 *
 * 제약조건 검사에 필요한 모든 정보를 담고 있습니다.
 */
export interface ConstraintContext {
  /** 행위자(장수/국가) ID */
  actorId: number;
  /** 현재 도시 ID */
  cityId?: number;
  /** 소속 국가 ID */
  nationId?: number;
  /** 대상 장수 ID */
  destGeneralId?: number;
  /** 대상 도시 ID */
  destCityId?: number;
  /** 대상 국가 ID */
  destNationId?: number;
  /** 커맨드 인자 (사용자 입력값) */
  args: Record<string, any>;
  /** 환경 변수 (게임 설정, 시간 등) */
  env: Record<string, any>;
  /** 검사 모드: full(전체) 또는 precheck(사전) */
  mode: "full" | "precheck";
}

/**
 * 상태 뷰 인터페이스
 *
 * 제약조건이 게임 상태에 접근하는 추상화 계층입니다.
 * WorldSnapshot을 직접 노출하지 않고 RequirementKey로 조회합니다.
 */
export interface StateView {
  /** 데이터 존재 여부 확인 */
  has(req: RequirementKey): boolean;
  /** 데이터 조회 (없으면 null) */
  get(req: RequirementKey): any | null;
}

/**
 * 제약조건 인터페이스
 *
 * 모든 제약조건이 구현해야 하는 계약입니다.
 *
 * @example
 * ```typescript
 * class ReqGeneralGoldConstraint implements Constraint {
 *   name = 'ReqGeneralGold';
 *
 *   constructor(private amount: number) {}
 *
 *   requires(ctx) {
 *     return [{ kind: 'general', id: ctx.actorId }];
 *   }
 *
 *   test(ctx, view) {
 *     const general = view.get({ kind: 'general', id: ctx.actorId });
 *     if (general.gold >= this.amount) {
 *       return { kind: 'allow' };
 *     }
 *     return { kind: 'deny', reason: `골드 ${this.amount} 필요` };
 *   }
 * }
 * ```
 */
export interface Constraint {
  /** 제약조건 이름 (디버깅용) */
  name: string;

  /**
   * 검사에 필요한 데이터 키 목록
   * StateView에서 미리 로드해야 할 데이터를 알려줍니다.
   */
  requires(ctx: ConstraintContext): RequirementKey[];

  /**
   * 제약조건 검사 실행
   * @returns allow/deny/unknown 중 하나
   */
  test(ctx: ConstraintContext, view: StateView): ConstraintResult;
}
