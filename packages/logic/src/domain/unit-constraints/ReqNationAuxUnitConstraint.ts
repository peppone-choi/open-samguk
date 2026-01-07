import { GameUnitConstraint, GameUnitConstraintContext } from "./types.js";

type Comparator = "==" | "!=" | "<" | ">" | "<=" | ">=";

/** 국가 보조 변수 키에 대한 한글 설명 */
const NATION_AUX_INFO: Record<string, { equalOne: string }> = {
  can_대검병사용: { equalOne: "대검병 연구 시 가능" },
  can_극병사용: { equalOne: "극병 연구 시 가능" },
  can_화시병사용: { equalOne: "화시병 연구 시 가능" },
  can_원융노병사용: { equalOne: "원융노병 연구 시 가능" },
  can_산저병사용: { equalOne: "산저병 연구 시 가능" },
  can_상병사용: { equalOne: "상병 연구 시 가능" },
  can_음귀병사용: { equalOne: "음귀병 연구 시 가능" },
  can_무희사용: { equalOne: "무희 연구 시 가능" },
  can_화륜차사용: { equalOne: "화륜차 연구 시 가능" },
};

/**
 * 국가 보조 변수 요구 제약 조건
 * 레거시: legacy/hwe/sammo/GameUnitConstraint/ReqNationAux.php
 */
export class ReqNationAuxUnitConstraint implements GameUnitConstraint {
  constructor(
    private readonly auxKey: string,
    private readonly cmp: Comparator,
    private readonly value: number
  ) {
    const validComparators: Comparator[] = ["==", "!=", "<", ">", "<=", ">="];
    if (!validComparators.includes(cmp)) {
      throw new Error("올바르지 않은 비교연산자입니다");
    }
  }

  test(ctx: GameUnitConstraintContext): boolean {
    const lhs = ctx.nationAux.get(this.auxKey) ?? 0;
    const rhs = this.value;

    switch (this.cmp) {
      case "==":
        return lhs === rhs;
      case "!=":
        return lhs !== rhs;
      case "<":
        return lhs < rhs;
      case ">":
        return lhs > rhs;
      case "<=":
        return lhs <= rhs;
      case ">=":
        return lhs >= rhs;
    }
  }

  getInfo(): string {
    // 특수 케이스: 연구 완료 여부
    const specialInfo = NATION_AUX_INFO[this.auxKey];
    if (specialInfo && this.cmp === "==" && this.value === 1) {
      return specialInfo.equalOne;
    }

    // did_특성초토화 특수 케이스
    if (this.auxKey === "did_특성초토화" && this.cmp === ">=" && this.value >= 1) {
      return "특성 초토화 시 가능";
    }

    // 범용 메시지
    switch (this.cmp) {
      case "==":
        if (this.value === 0) return `${this.auxKey} 없을 때`;
        if (this.value === 1) return `${this.auxKey} 있을 때`;
        return `${this.auxKey} = ${this.value} 일 때`;
      case "!=":
        if (this.value === 0) return `${this.auxKey} 있을 때`;
        if (this.value === 1) return `${this.auxKey} 없을 때`;
        return `${this.auxKey} != ${this.value} 일 때`;
      default:
        return `${this.auxKey} ${this.cmp} ${this.value} 일 때`;
    }
  }
}
