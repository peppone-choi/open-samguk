import type { General } from '../entities.js';

/**
 * 아이템 타입
 * - weapon: 무기 (무력 증가)
 * - horse: 명마 (통솔 증가)
 * - book: 서적 (지력 증가)
 * - treasure: 보물 (특수 효과)
 * - consumable: 소모품
 */
export type ItemType = 'weapon' | 'horse' | 'book' | 'treasure' | 'consumable';

/**
 * 아이템 희귀도
 * - common: 일반 (구매 가능)
 * - rare: 희귀
 * - unique: 유니크 (구매 불가, 경매만 가능)
 */
export type ItemRarity = 'common' | 'rare' | 'unique';

/**
 * 스탯 종류
 */
export type StatName =
    | 'leadership'   // 통솔
    | 'strength'     // 무력
    | 'intel'        // 지력
    | 'bonusAtmos'   // 사기 보정
    | 'bonusTrain'   // 훈련 보정
    | 'warCriticalRatio'      // 필살 확률
    | 'warAvoidRatio'         // 회피 확률
    | 'warMagicTrialProb'     // 계략 시도 확률
    | 'warMagicSuccessProb'   // 계략 성공 확률
    | 'warMagicSuccessDamage' // 계략 성공 대미지
    | 'killRice'     // 군량 소모
    | 'initWarPhase'; // 초기 전투 페이즈

/**
 * 스탯 보너스 객체
 */
export interface StatBonus {
    leadership?: number;
    strength?: number;
    intel?: number;
    bonusAtmos?: number;
    bonusTrain?: number;
    warCriticalRatio?: number;
    warAvoidRatio?: number;
    warMagicTrialProb?: number;
    warMagicSuccessProb?: number;
    warMagicSuccessDamage?: number;
    killRice?: number;
    initWarPhase?: number;
}

/**
 * 내정 턴 타입
 */
export type DomesticTurnType =
    | '계략'    // 화계, 탈취, 파괴, 선동
    | '상업'    // 상업 투자
    | '농업'    // 농지 개간
    | '기술'    // 기술 연구
    | '성벽'    // 성벽 보수
    | '수비'    // 수비 강화
    | '치안'    // 치안 강화
    | '민심'    // 주민 선정
    | '인구'    // 정착 장려
    | '징병'    // 징병
    | '모병'    // 모병
    | '조달'    // 조달
    | '진압';   // 진압

/**
 * 내정 변수 타입
 */
export type DomesticVarType = 'success' | 'cost' | 'score';

/**
 * 전투력 배율 [공격배율, 방어배율]
 */
export type WarPowerMultiplier = [number, number];

/**
 * 장수 읽기 전용 인터페이스 (아이템 계산용)
 */
export interface GeneralReadOnly {
    readonly id: number;
    readonly name: string;
    readonly nationId: number;
    readonly cityId: number;
    readonly leadership: number;
    readonly strength: number;
    readonly intel: number;
    readonly special: string;
    readonly special2: string;
    readonly injury: number;
    readonly crew: number;
    readonly crewType: number;
    readonly train: number;
    readonly atmos: number;
}

/**
 * 전투 유닛 인터페이스 (전투 트리거용)
 */
export interface WarUnitReadOnly {
    readonly generalId: number;
    readonly nationId: number;
    readonly crew: number;
    readonly crewType: number;
    readonly train: number;
    readonly atmos: number;
    readonly leadership: number;
    readonly strength: number;
    readonly intel: number;
}

/**
 * 아이템 기본 인터페이스
 */
export interface IItem {
    /** 아이템 고유 코드 */
    readonly code: string;
    /** 원본 이름 */
    readonly rawName: string;
    /** 표시 이름 (효과 포함) */
    readonly name: string;
    /** 아이템 설명 (효과 설명) */
    readonly info: string;
    /** 아이템 타입 */
    readonly type: ItemType;
    /** 희귀도 */
    readonly rarity: ItemRarity;
    /** 구매 가격 */
    readonly cost: number;
    /** 소모품 여부 */
    readonly consumable: boolean;
    /** 구매 가능 여부 */
    readonly buyable: boolean;
    /** 요구 치안 수치 (구매 시) */
    readonly reqSecu: number;

    /**
     * 스탯 보너스 반환
     */
    getStatBonus(): StatBonus;

    /**
     * 장착 가능 여부 확인
     * @param general 장수 정보
     */
    canEquip(general: GeneralReadOnly): boolean;

    /**
     * 스탯 계산 훅
     * @param general 장수 정보
     * @param statName 스탯 이름
     * @param value 현재 값
     * @param aux 보조 데이터
     */
    onCalcStat(general: GeneralReadOnly, statName: StatName, value: number, aux?: unknown): number;

    /**
     * 상대 스탯 계산 훅 (디버프)
     * @param general 장수 정보
     * @param statName 스탯 이름
     * @param value 현재 값
     * @param aux 보조 데이터
     */
    onCalcOpposeStat(general: GeneralReadOnly, statName: StatName, value: number, aux?: unknown): number;

    /**
     * 내정 효과 계산 훅
     * @param turnType 턴 타입
     * @param varType 변수 타입
     * @param value 현재 값
     * @param aux 보조 데이터
     */
    onCalcDomestic(turnType: DomesticTurnType, varType: DomesticVarType, value: number, aux?: unknown): number;

    /**
     * 전투력 배율 반환
     * @param unit 전투 유닛
     */
    getWarPowerMultiplier(unit: WarUnitReadOnly): WarPowerMultiplier;
}

/**
 * 스탯 아이템 설정
 */
export interface StatItemConfig {
    /** 스탯 타입 */
    statType: 'leadership' | 'strength' | 'intel';
    /** 스탯 보너스 수치 */
    statValue: number;
    /** 원본 이름 */
    rawName: string;
    /** 구매 가격 */
    cost: number;
    /** 구매 가능 여부 */
    buyable: boolean;
}

/**
 * 아이템 메타데이터
 */
export interface ItemMeta {
    /** 아이템 코드 */
    code: string;
    /** 아이템 생성자 */
    create: () => IItem;
}

/**
 * 소모품 잔여 횟수 저장 키
 */
export const REMAIN_KEY = 'itemRemain';

/**
 * 스탯 타입별 한글명 및 영문명 매핑
 */
export const STAT_ITEM_TYPE_MAP = {
    '명마': { statNick: '통솔', statType: 'leadership' as const },
    '무기': { statNick: '무력', statType: 'strength' as const },
    '서적': { statNick: '지력', statType: 'intel' as const },
} as const;

/**
 * 아이템 슬롯 타입
 */
export type ItemSlot = 'weapon' | 'book' | 'horse' | 'item';
