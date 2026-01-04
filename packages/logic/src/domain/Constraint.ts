// 요구사항 키 정의
export type RequirementKey =
  | { kind: 'general'; id: number }
  | { kind: 'city'; id: number }
  | { kind: 'nation'; id: number }
  | { kind: 'destGeneral'; id: number }
  | { kind: 'destCity'; id: number }
  | { kind: 'destNation'; id: number }
  | { kind: 'arg'; key: string }
  | { kind: 'env'; key: string };

// 제약 검사 결과 타입
export type ConstraintResult =
  | { kind: 'allow' }
  | { kind: 'deny'; reason: string; code?: string }
  | { kind: 'unknown'; missing: RequirementKey[] };

// 제약 검사 컨텍스트
export interface ConstraintContext {
  actorId: number;
  cityId?: number;
  nationId?: number;
  destGeneralId?: number;
  destCityId?: number;
  destNationId?: number;
  args: Record<string, any>;
  env: Record<string, any>;
  mode: 'full' | 'precheck';
}

// 상태 뷰 인터페이스 (데이터 접근)
export interface StateView {
  has(req: RequirementKey): boolean;
  get(req: RequirementKey): any | null;
}

// 제약 인터페이스
export interface Constraint {
  name: string;
  requires(ctx: ConstraintContext): RequirementKey[];
  test(ctx: ConstraintContext, view: StateView): ConstraintResult;
}
