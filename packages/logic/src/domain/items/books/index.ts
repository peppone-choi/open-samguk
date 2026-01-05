import { BaseBookItem } from '../BaseStatItem.js';

/**
 * 서적 아이템 목록
 *
 * 레벨별 지력 보너스:
 * 01~06: 일반 (구매 가능)
 * 07~11: 고급 (구매 가능)
 * 12~15: 유니크 (구매 불가)
 */

// ============================================================
// 레벨 01~06: 기본 서적 (구매 가능)
// ============================================================

/** 효경전 - 지력 +1 */
export class 효경전 extends BaseBookItem {
    readonly code = 'che_서적_01_효경전';
    constructor() {
        super({ rawName: '효경전', statValue: 1, cost: 1000, buyable: true });
    }
}

/** 회남자 - 지력 +2 */
export class 회남자 extends BaseBookItem {
    readonly code = 'che_서적_02_회남자';
    constructor() {
        super({ rawName: '회남자', statValue: 2, cost: 2000, buyable: true });
    }
}

/** 변도론 - 지력 +3 */
export class 변도론 extends BaseBookItem {
    readonly code = 'che_서적_03_변도론';
    constructor() {
        super({ rawName: '변도론', statValue: 3, cost: 3000, buyable: true });
    }
}

/** 건상역주 - 지력 +4 */
export class 건상역주 extends BaseBookItem {
    readonly code = 'che_서적_04_건상역주';
    constructor() {
        super({ rawName: '건상역주', statValue: 4, cost: 4000, buyable: true });
    }
}

/** 여씨춘추 - 지력 +5 */
export class 여씨춘추 extends BaseBookItem {
    readonly code = 'che_서적_05_여씨춘추';
    constructor() {
        super({ rawName: '여씨춘추', statValue: 5, cost: 5000, buyable: true });
    }
}

/** 사민월령 - 지력 +6 */
export class 사민월령 extends BaseBookItem {
    readonly code = 'che_서적_06_사민월령';
    constructor() {
        super({ rawName: '사민월령', statValue: 6, cost: 6000, buyable: true });
    }
}

// ============================================================
// 레벨 07: 고급 서적 (구매 가능)
// ============================================================

/** 논어 - 지력 +7 */
export class 논어 extends BaseBookItem {
    readonly code = 'che_서적_07_논어';
    constructor() {
        super({ rawName: '논어', statValue: 7, cost: 7000, buyable: true });
    }
}

/** 사마법 - 지력 +7 */
export class 사마법 extends BaseBookItem {
    readonly code = 'che_서적_07_사마법';
    constructor() {
        super({ rawName: '사마법', statValue: 7, cost: 7000, buyable: true });
    }
}

/** 위료자 - 지력 +7 */
export class 위료자 extends BaseBookItem {
    readonly code = 'che_서적_07_위료자';
    constructor() {
        super({ rawName: '위료자', statValue: 7, cost: 7000, buyable: true });
    }
}

/** 한서 - 지력 +7 */
export class 한서 extends BaseBookItem {
    readonly code = 'che_서적_07_한서';
    constructor() {
        super({ rawName: '한서', statValue: 7, cost: 7000, buyable: true });
    }
}

// ============================================================
// 레벨 08~11: 고급 서적 (구매 가능)
// ============================================================

/** 사기 - 지력 +8 */
export class 사기 extends BaseBookItem {
    readonly code = 'che_서적_08_사기';
    constructor() {
        super({ rawName: '사기', statValue: 8, cost: 8000, buyable: true });
    }
}

/** 전론 - 지력 +8 */
export class 전론 extends BaseBookItem {
    readonly code = 'che_서적_08_전론';
    constructor() {
        super({ rawName: '전론', statValue: 8, cost: 8000, buyable: true });
    }
}

/** 역경 - 지력 +9 */
export class 역경 extends BaseBookItem {
    readonly code = 'che_서적_09_역경';
    constructor() {
        super({ rawName: '역경', statValue: 9, cost: 9000, buyable: true });
    }
}

/** 장자 - 지력 +9 */
export class 장자 extends BaseBookItem {
    readonly code = 'che_서적_09_장자';
    constructor() {
        super({ rawName: '장자', statValue: 9, cost: 9000, buyable: true });
    }
}

/** 구국론 - 지력 +10 */
export class 구국론 extends BaseBookItem {
    readonly code = 'che_서적_10_구국론';
    constructor() {
        super({ rawName: '구국론', statValue: 10, cost: 10000, buyable: true });
    }
}

/** 시경 - 지력 +10 */
export class 시경 extends BaseBookItem {
    readonly code = 'che_서적_10_시경';
    constructor() {
        super({ rawName: '시경', statValue: 10, cost: 10000, buyable: true });
    }
}

/** 상군서 - 지력 +11 */
export class 상군서 extends BaseBookItem {
    readonly code = 'che_서적_11_상군서';
    constructor() {
        super({ rawName: '상군서', statValue: 11, cost: 11000, buyable: true });
    }
}

/** 춘추전 - 지력 +11 */
export class 춘추전 extends BaseBookItem {
    readonly code = 'che_서적_11_춘추전';
    constructor() {
        super({ rawName: '춘추전', statValue: 11, cost: 11000, buyable: true });
    }
}

// ============================================================
// 레벨 12~15: 유니크 서적 (구매 불가, 경매만 가능)
// ============================================================

/** 맹덕신서 - 지력 +12 (유니크) */
export class 맹덕신서 extends BaseBookItem {
    readonly code = 'che_서적_12_맹덕신서';
    constructor() {
        super({ rawName: '맹덕신서', statValue: 12, cost: 200, buyable: false });
    }
}

/** 산해경 - 지력 +12 (유니크) */
export class 산해경 extends BaseBookItem {
    readonly code = 'che_서적_12_산해경';
    constructor() {
        super({ rawName: '산해경', statValue: 12, cost: 200, buyable: false });
    }
}

/** 관자 - 지력 +13 (유니크) */
export class 관자 extends BaseBookItem {
    readonly code = 'che_서적_13_관자';
    constructor() {
        super({ rawName: '관자', statValue: 13, cost: 200, buyable: false });
    }
}

/** 병법24편 - 지력 +13 (유니크) */
export class 병법24편 extends BaseBookItem {
    readonly code = 'che_서적_13_병법24편';
    constructor() {
        super({ rawName: '병법24편', statValue: 13, cost: 200, buyable: false });
    }
}

/** 오자병법 - 지력 +14 (유니크) */
export class 오자병법 extends BaseBookItem {
    readonly code = 'che_서적_14_오자병법';
    constructor() {
        super({ rawName: '오자병법', statValue: 14, cost: 200, buyable: false });
    }
}

/** 한비자 - 지력 +14 (유니크) */
export class 한비자 extends BaseBookItem {
    readonly code = 'che_서적_14_한비자';
    constructor() {
        super({ rawName: '한비자', statValue: 14, cost: 200, buyable: false });
    }
}

/** 노자 - 지력 +15 (유니크) */
export class 노자 extends BaseBookItem {
    readonly code = 'che_서적_15_노자';
    constructor() {
        super({ rawName: '노자', statValue: 15, cost: 200, buyable: false });
    }
}

/** 손자병법 - 지력 +15 (유니크) */
export class 손자병법 extends BaseBookItem {
    readonly code = 'che_서적_15_손자병법';
    constructor() {
        super({ rawName: '손자병법', statValue: 15, cost: 200, buyable: false });
    }
}

/**
 * 모든 서적 아이템 목록
 */
export const ALL_BOOKS = [
    효경전, 회남자, 변도론, 건상역주, 여씨춘추, 사민월령,
    논어, 사마법, 위료자, 한서,
    사기, 전론,
    역경, 장자,
    구국론, 시경,
    상군서, 춘추전,
    맹덕신서, 산해경,
    관자, 병법24편,
    오자병법, 한비자,
    노자, 손자병법,
] as const;
