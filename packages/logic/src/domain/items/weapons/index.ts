import { BaseWeaponItem } from "../BaseStatItem.js";

/**
 * 무기 아이템 목록
 *
 * 레벨별 무력 보너스:
 * 01~06: 일반 (구매 가능)
 * 07~11: 고급 (구매 가능)
 * 12~15: 유니크 (구매 불가)
 */

// ============================================================
// 레벨 01~06: 기본 무기 (구매 가능)
// ============================================================

/** 단도 - 무력 +1 */
export class 단도 extends BaseWeaponItem {
  readonly code = "che_무기_01_단도";
  constructor() {
    super({ rawName: "단도", statValue: 1, cost: 1000, buyable: true });
  }
}

/** 단궁 - 무력 +2 */
export class 단궁 extends BaseWeaponItem {
  readonly code = "che_무기_02_단궁";
  constructor() {
    super({ rawName: "단궁", statValue: 2, cost: 2000, buyable: true });
  }
}

/** 단극 - 무력 +3 */
export class 단극 extends BaseWeaponItem {
  readonly code = "che_무기_03_단극";
  constructor() {
    super({ rawName: "단극", statValue: 3, cost: 3000, buyable: true });
  }
}

/** 목검 - 무력 +4 */
export class 목검 extends BaseWeaponItem {
  readonly code = "che_무기_04_목검";
  constructor() {
    super({ rawName: "목검", statValue: 4, cost: 4000, buyable: true });
  }
}

/** 죽창 - 무력 +5 */
export class 죽창 extends BaseWeaponItem {
  readonly code = "che_무기_05_죽창";
  constructor() {
    super({ rawName: "죽창", statValue: 5, cost: 5000, buyable: true });
  }
}

/** 소부 - 무력 +6 */
export class 소부 extends BaseWeaponItem {
  readonly code = "che_무기_06_소부";
  constructor() {
    super({ rawName: "소부", statValue: 6, cost: 6000, buyable: true });
  }
}

// ============================================================
// 레벨 07: 고급 무기 (구매 가능)
// ============================================================

/** 동추 - 무력 +7 */
export class 동추 extends BaseWeaponItem {
  readonly code = "che_무기_07_동추";
  constructor() {
    super({ rawName: "동추", statValue: 7, cost: 7000, buyable: true });
  }
}

/** 맥궁 - 무력 +7 */
export class 맥궁 extends BaseWeaponItem {
  readonly code = "che_무기_07_맥궁";
  constructor() {
    super({ rawName: "맥궁", statValue: 7, cost: 7000, buyable: true });
  }
}

/** 철쇄 - 무력 +7 */
export class 철쇄 extends BaseWeaponItem {
  readonly code = "che_무기_07_철쇄";
  constructor() {
    super({ rawName: "철쇄", statValue: 7, cost: 7000, buyable: true });
  }
}

/** 철편 - 무력 +7 */
export class 철편 extends BaseWeaponItem {
  readonly code = "che_무기_07_철편";
  constructor() {
    super({ rawName: "철편", statValue: 7, cost: 7000, buyable: true });
  }
}

// ============================================================
// 레벨 08~11: 고급 무기 (구매 가능)
// ============================================================

/** 유성추 - 무력 +8 */
export class 유성추 extends BaseWeaponItem {
  readonly code = "che_무기_08_유성추";
  constructor() {
    super({ rawName: "유성추", statValue: 8, cost: 8000, buyable: true });
  }
}

/** 철질여골 - 무력 +8 */
export class 철질여골 extends BaseWeaponItem {
  readonly code = "che_무기_08_철질여골";
  constructor() {
    super({ rawName: "철질여골", statValue: 8, cost: 8000, buyable: true });
  }
}

/** 동호비궁 - 무력 +9 */
export class 동호비궁 extends BaseWeaponItem {
  readonly code = "che_무기_09_동호비궁";
  constructor() {
    super({ rawName: "동호비궁", statValue: 9, cost: 9000, buyable: true });
  }
}

/** 쌍철극 - 무력 +9 */
export class 쌍철극 extends BaseWeaponItem {
  readonly code = "che_무기_09_쌍철극";
  constructor() {
    super({ rawName: "쌍철극", statValue: 9, cost: 9000, buyable: true });
  }
}

/** 대부 - 무력 +10 */
export class 대부 extends BaseWeaponItem {
  readonly code = "che_무기_10_대부";
  constructor() {
    super({ rawName: "대부", statValue: 10, cost: 10000, buyable: true });
  }
}

/** 삼첨도 - 무력 +10 */
export class 삼첨도 extends BaseWeaponItem {
  readonly code = "che_무기_10_삼첨도";
  constructor() {
    super({ rawName: "삼첨도", statValue: 10, cost: 10000, buyable: true });
  }
}

/** 고정도 - 무력 +11 */
export class 고정도 extends BaseWeaponItem {
  readonly code = "che_무기_11_고정도";
  constructor() {
    super({ rawName: "고정도", statValue: 11, cost: 11000, buyable: true });
  }
}

/** 이광궁 - 무력 +11 */
export class 이광궁 extends BaseWeaponItem {
  readonly code = "che_무기_11_이광궁";
  constructor() {
    super({ rawName: "이광궁", statValue: 11, cost: 11000, buyable: true });
  }
}

// ============================================================
// 레벨 12~15: 유니크 무기 (구매 불가, 경매만 가능)
// ============================================================

/** 철척사모 - 무력 +12 (유니크) */
export class 철척사모 extends BaseWeaponItem {
  readonly code = "che_무기_12_철척사모";
  constructor() {
    super({ rawName: "철척사모", statValue: 12, cost: 200, buyable: false });
  }
}

/** 칠성검 - 무력 +12 (유니크) */
export class 칠성검 extends BaseWeaponItem {
  readonly code = "che_무기_12_칠성검";
  constructor() {
    super({ rawName: "칠성검", statValue: 12, cost: 200, buyable: false });
  }
}

/** 사모 - 무력 +13 (유니크) */
export class 사모 extends BaseWeaponItem {
  readonly code = "che_무기_13_사모";
  constructor() {
    super({ rawName: "사모", statValue: 13, cost: 200, buyable: false });
  }
}

/** 양유기궁 - 무력 +13 (유니크) */
export class 양유기궁 extends BaseWeaponItem {
  readonly code = "che_무기_13_양유기궁";
  constructor() {
    super({ rawName: "양유기궁", statValue: 13, cost: 200, buyable: false });
  }
}

/** 방천화극 - 무력 +14 (유니크) */
export class 방천화극 extends BaseWeaponItem {
  readonly code = "che_무기_14_방천화극";
  constructor() {
    super({ rawName: "방천화극", statValue: 14, cost: 200, buyable: false });
  }
}

/** 언월도 (청룡언월도) - 무력 +14 (유니크) */
export class 언월도 extends BaseWeaponItem {
  readonly code = "che_무기_14_언월도";
  constructor() {
    super({ rawName: "언월도", statValue: 14, cost: 200, buyable: false });
  }
}

/** 의천검 - 무력 +15 (유니크) */
export class 의천검 extends BaseWeaponItem {
  readonly code = "che_무기_15_의천검";
  constructor() {
    super({ rawName: "의천검", statValue: 15, cost: 200, buyable: false });
  }
}

/** 청홍검 - 무력 +15 (유니크) */
export class 청홍검 extends BaseWeaponItem {
  readonly code = "che_무기_15_청홍검";
  constructor() {
    super({ rawName: "청홍검", statValue: 15, cost: 200, buyable: false });
  }
}

// 청룡언월도 별칭
export { 언월도 as 청룡언월도 };

/**
 * 모든 무기 아이템 목록
 */
export const ALL_WEAPONS = [
  단도,
  단궁,
  단극,
  목검,
  죽창,
  소부,
  동추,
  맥궁,
  철쇄,
  철편,
  유성추,
  철질여골,
  동호비궁,
  쌍철극,
  대부,
  삼첨도,
  고정도,
  이광궁,
  철척사모,
  칠성검,
  사모,
  양유기궁,
  방천화극,
  언월도,
  의천검,
  청홍검,
] as const;
