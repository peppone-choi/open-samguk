import { BaseHorseItem } from "../BaseStatItem.js";

/**
 * 명마 아이템 목록
 *
 * 레벨별 통솔 보너스:
 * 01~06: 일반 (구매 가능)
 * 07~11: 고급 (구매 가능)
 * 12~15: 유니크 (구매 불가)
 */

// ============================================================
// 레벨 01~06: 기본 명마 (구매 가능)
// ============================================================

/** 노기 - 통솔 +1 */
export class 노기 extends BaseHorseItem {
  readonly code = "che_명마_01_노기";
  constructor() {
    super({ rawName: "노기", statValue: 1, cost: 1000, buyable: true });
  }
}

/** 조랑 - 통솔 +2 */
export class 조랑 extends BaseHorseItem {
  readonly code = "che_명마_02_조랑";
  constructor() {
    super({ rawName: "조랑", statValue: 2, cost: 2000, buyable: true });
  }
}

/** 노새 - 통솔 +3 */
export class 노새 extends BaseHorseItem {
  readonly code = "che_명마_03_노새";
  constructor() {
    super({ rawName: "노새", statValue: 3, cost: 3000, buyable: true });
  }
}

/** 나귀 - 통솔 +4 */
export class 나귀 extends BaseHorseItem {
  readonly code = "che_명마_04_나귀";
  constructor() {
    super({ rawName: "나귀", statValue: 4, cost: 4000, buyable: true });
  }
}

/** 갈색마 - 통솔 +5 */
export class 갈색마 extends BaseHorseItem {
  readonly code = "che_명마_05_갈색마";
  constructor() {
    super({ rawName: "갈색마", statValue: 5, cost: 5000, buyable: true });
  }
}

/** 흑색마 - 통솔 +6 */
export class 흑색마 extends BaseHorseItem {
  readonly code = "che_명마_06_흑색마";
  constructor() {
    super({ rawName: "흑색마", statValue: 6, cost: 6000, buyable: true });
  }
}

// ============================================================
// 레벨 07: 고급 명마 (구매 가능)
// ============================================================

/** 기주마 - 통솔 +7 */
export class 기주마 extends BaseHorseItem {
  readonly code = "che_명마_07_기주마";
  constructor() {
    super({ rawName: "기주마", statValue: 7, cost: 7000, buyable: true });
  }
}

/** 백마 - 통솔 +7 */
export class 백마 extends BaseHorseItem {
  readonly code = "che_명마_07_백마";
  constructor() {
    super({ rawName: "백마", statValue: 7, cost: 7000, buyable: true });
  }
}

/** 백상 - 통솔 +7 */
export class 백상 extends BaseHorseItem {
  readonly code = "che_명마_07_백상";
  constructor() {
    super({ rawName: "백상", statValue: 7, cost: 7000, buyable: true });
  }
}

/** 오환마 - 통솔 +7 */
export class 오환마 extends BaseHorseItem {
  readonly code = "che_명마_07_오환마";
  constructor() {
    super({ rawName: "오환마", statValue: 7, cost: 7000, buyable: true });
  }
}

// ============================================================
// 레벨 08~11: 고급 명마 (구매 가능)
// ============================================================

/** 양주마 - 통솔 +8 */
export class 양주마 extends BaseHorseItem {
  readonly code = "che_명마_08_양주마";
  constructor() {
    super({ rawName: "양주마", statValue: 8, cost: 8000, buyable: true });
  }
}

/** 흉노마 - 통솔 +8 */
export class 흉노마 extends BaseHorseItem {
  readonly code = "che_명마_08_흉노마";
  constructor() {
    super({ rawName: "흉노마", statValue: 8, cost: 8000, buyable: true });
  }
}

/** 과하마 - 통솔 +9 */
export class 과하마 extends BaseHorseItem {
  readonly code = "che_명마_09_과하마";
  constructor() {
    super({ rawName: "과하마", statValue: 9, cost: 9000, buyable: true });
  }
}

/** 의남백마 - 통솔 +9 */
export class 의남백마 extends BaseHorseItem {
  readonly code = "che_명마_09_의남백마";
  constructor() {
    super({ rawName: "의남백마", statValue: 9, cost: 9000, buyable: true });
  }
}

/** 대완마 - 통솔 +10 */
export class 대완마 extends BaseHorseItem {
  readonly code = "che_명마_10_대완마";
  constructor() {
    super({ rawName: "대완마", statValue: 10, cost: 10000, buyable: true });
  }
}

/** 옥추마 - 통솔 +10 */
export class 옥추마 extends BaseHorseItem {
  readonly code = "che_명마_10_옥추마";
  constructor() {
    super({ rawName: "옥추마", statValue: 10, cost: 10000, buyable: true });
  }
}

/** 서량마 - 통솔 +11 */
export class 서량마 extends BaseHorseItem {
  readonly code = "che_명마_11_서량마";
  constructor() {
    super({ rawName: "서량마", statValue: 11, cost: 11000, buyable: true });
  }
}

/** 화종마 - 통솔 +11 */
export class 화종마 extends BaseHorseItem {
  readonly code = "che_명마_11_화종마";
  constructor() {
    super({ rawName: "화종마", statValue: 11, cost: 11000, buyable: true });
  }
}

// ============================================================
// 레벨 12~15: 유니크 명마 (구매 불가, 경매만 가능)
// ============================================================

/** 사륜거 - 통솔 +12 (유니크) */
export class 사륜거 extends BaseHorseItem {
  readonly code = "che_명마_12_사륜거";
  constructor() {
    super({ rawName: "사륜거", statValue: 12, cost: 200, buyable: false });
  }
}

/** 옥란백용구 - 통솔 +12 (유니크) */
export class 옥란백용구 extends BaseHorseItem {
  readonly code = "che_명마_12_옥란백용구";
  constructor() {
    super({ rawName: "옥란백용구", statValue: 12, cost: 200, buyable: false });
  }
}

/** 적로 - 통솔 +13 (유니크) */
export class 적로 extends BaseHorseItem {
  readonly code = "che_명마_13_적로";
  constructor() {
    super({ rawName: "적로", statValue: 13, cost: 200, buyable: false });
  }
}

/** 절영 - 통솔 +13 (유니크) */
export class 절영 extends BaseHorseItem {
  readonly code = "che_명마_13_절영";
  constructor() {
    super({ rawName: "절영", statValue: 13, cost: 200, buyable: false });
  }
}

/** 적란마 - 통솔 +14 (유니크) */
export class 적란마 extends BaseHorseItem {
  readonly code = "che_명마_14_적란마";
  constructor() {
    super({ rawName: "적란마", statValue: 14, cost: 200, buyable: false });
  }
}

/** 조황비전 - 통솔 +14 (유니크) */
export class 조황비전 extends BaseHorseItem {
  readonly code = "che_명마_14_조황비전";
  constructor() {
    super({ rawName: "조황비전", statValue: 14, cost: 200, buyable: false });
  }
}

/** 적토마 - 통솔 +15 (유니크) */
export class 적토마 extends BaseHorseItem {
  readonly code = "che_명마_15_적토마";
  constructor() {
    super({ rawName: "적토마", statValue: 15, cost: 200, buyable: false });
  }
}

/** 한혈마 - 통솔 +15 (유니크) */
export class 한혈마 extends BaseHorseItem {
  readonly code = "che_명마_15_한혈마";
  constructor() {
    super({ rawName: "한혈마", statValue: 15, cost: 200, buyable: false });
  }
}

/**
 * 모든 명마 아이템 목록
 */
export const ALL_HORSES = [
  노기,
  조랑,
  노새,
  나귀,
  갈색마,
  흑색마,
  기주마,
  백마,
  백상,
  오환마,
  양주마,
  흉노마,
  과하마,
  의남백마,
  대완마,
  옥추마,
  서량마,
  화종마,
  사륜거,
  옥란백용구,
  적로,
  절영,
  적란마,
  조황비전,
  적토마,
  한혈마,
] as const;
