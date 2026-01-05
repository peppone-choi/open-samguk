/**
 * 시나리오 스키마 (zod)
 *
 * 레거시 시나리오 JSON 파일의 런타임 검증을 위한 스키마 정의
 * @see docs/architecture/scenario-schema.md
 */
import { z } from 'zod';

// ============================================================================
// 기본 타입 스키마
// ============================================================================

/**
 * 장수 성격 (ego) 목록
 */
export const EgoSchema = z.enum([
    '왕좌', '패권', '할거', '정복', '출세',
    '대의', '의협', '유지', '재간', '안전', '은둔',
]);
export type Ego = z.infer<typeof EgoSchema>;

/**
 * 전투 특기 (speciality) 목록
 */
export const SpecialitySchema = z.enum([
    '기병', '보병', '궁병', '무쌍', '위압', '돌격', '필살', '견고', '집중',
    '신중', '신산', '반계', '귀병', '귀모', '경작', '인덕', '상재', '환술', '척사',
    '의술', '축성', '수비', '저격', '공성', '발명', '징병', '통찰', '격노',
]);
export type Speciality = z.infer<typeof SpecialitySchema>;

/**
 * 국가 성향 타입
 */
export const NationTypeSchema = z.enum([
    '유가', '태평도', '법가', '무가', '명가', '오두미도', '상가',
]);
export type NationType = z.infer<typeof NationTypeSchema>;

/**
 * 도시 규모 타입
 */
export const CityLevelSchema = z.enum([
    '특', '대', '중', '소', '진', '수', '관', '이',
]);
export type CityLevel = z.infer<typeof CityLevelSchema>;

/**
 * 지역 타입
 */
export const RegionSchema = z.enum([
    '하북', '중원', '서북', '서촉', '남중', '초', '오월', '동이',
]);
export type Region = z.infer<typeof RegionSchema>;

// ============================================================================
// 장수 데이터 스키마
// ============================================================================

/**
 * 장수 데이터 (튜플 형식)
 * [affinity, name, picturePath, nationName, locatedCity,
 *  leadership, strength, intel, officerLevel, birth, death,
 *  ego, speciality, text?]
 */
export const GeneralDataSchema = z.tuple([
    z.union([z.number(), z.null()]),              // affinity (상성)
    z.string(),                                    // name (장수명)
    z.union([z.string(), z.number(), z.null()]),  // picturePath (전투 이미지)
    z.union([z.string(), z.number(), z.null()]),  // nationName (소속 국가)
    z.union([z.string(), z.null()]),              // locatedCity (위치 도시)
    z.number(),                                    // leadership (통솔)
    z.number(),                                    // strength (무력)
    z.number(),                                    // intel (지력)
    z.number(),                                    // officerLevel (관직)
    z.number(),                                    // birth (생년)
    z.number(),                                    // death (몰년)
    z.union([EgoSchema, z.null()]),               // ego (성격)
    z.union([SpecialitySchema, z.null()]),        // speciality (특기)
]).rest(z.string().optional());                    // text (대사, 선택)

export type GeneralData = z.infer<typeof GeneralDataSchema>;

// ============================================================================
// 국가 데이터 스키마
// ============================================================================

/**
 * 국가 데이터 (튜플 형식)
 * [name, color, gold, rice, infoText, tech, type, nationLevel, cities[]]
 */
export const NationDataSchema = z.tuple([
    z.string(),                                    // name (국가명)
    z.string(),                                    // color (RGB 컬러)
    z.number(),                                    // gold (초기 금)
    z.number(),                                    // rice (초기 쌀)
    z.string(),                                    // infoText (국가 설명)
    z.number(),                                    // tech (기술력)
    z.union([NationTypeSchema, z.string()]),      // type (성향)
    z.number(),                                    // nationLevel (국가 규모)
    z.array(z.string()),                          // cities (소속 도시 목록)
]);
export type NationData = z.infer<typeof NationDataSchema>;

// ============================================================================
// 외교 데이터 스키마
// ============================================================================

/**
 * 외교 데이터 (튜플 형식)
 * [nation1, nation2, diplomacyType, duration]
 */
export const DiplomacyDataSchema = z.tuple([
    z.number(),                                    // nation1 (국가 1 인덱스)
    z.number(),                                    // nation2 (국가 2 인덱스)
    z.number(),                                    // diplomacyType (외교 종류)
    z.number(),                                    // duration (기간)
]);
export type DiplomacyData = z.infer<typeof DiplomacyDataSchema>;

// ============================================================================
// 도시 오버라이드 스키마
// ============================================================================

/**
 * 도시 오버라이드 데이터
 */
export const CityOverrideSchema = z.object({
    name: z.string(),
    pop: z.number().optional(),
    agri: z.number().optional(),
    comm: z.number().optional(),
    secu: z.number().optional(),
    def: z.number().optional(),
    wall: z.number().optional(),
    trust: z.number().optional(),
});
export type CityOverride = z.infer<typeof CityOverrideSchema>;

// ============================================================================
// 맵 설정 스키마
// ============================================================================

/**
 * 맵 설정
 */
export const MapConfigSchema = z.object({
    mapName: z.string().optional(),               // 맵 이름 (기본: "che")
    unitSet: z.string().optional(),               // 유닛 세트 (기본: "che")
});
export type MapConfig = z.infer<typeof MapConfigSchema>;

// ============================================================================
// 스탯 설정 스키마
// ============================================================================

/**
 * 스탯 설정
 */
export const StatConfigSchema = z.object({
    total: z.number().optional(),                 // 플레이어 스탯 총합 (기본: 165)
    min: z.number().optional(),                   // 스탯 최소값 (기본: 15)
    max: z.number().optional(),                   // 스탯 최대값 (기본: 80)
    npcTotal: z.number().optional(),              // NPC 스탯 총합 (기본: 150)
    npcMax: z.number().optional(),                // NPC 스탯 최대값 (기본: 75)
    npcMin: z.number().optional(),                // NPC 스탯 최소값 (기본: 10)
    chiefMin: z.number().optional(),              // 수뇌 스탯 최소값 (기본: 65)
});
export type StatConfig = z.infer<typeof StatConfigSchema>;

// ============================================================================
// 게임 상수 오버라이드 스키마
// ============================================================================

/**
 * 게임 상수 오버라이드
 */
export const GameConstOverrideSchema = z.object({
    defaultMaxGeneral: z.number().optional(),
    joinRuinedNPCProp: z.number().optional(),
    npcBanMessageProb: z.number().optional(),
    expandCityPopIncreaseAmount: z.number().optional(),
    expandCityDevelIncreaseAmount: z.number().optional(),
    expandCityWallIncreaseAmount: z.number().optional(),
}).passthrough();                                 // 추가 필드 허용
export type GameConstOverride = z.infer<typeof GameConstOverrideSchema>;

// ============================================================================
// 이벤트 시스템 스키마
// ============================================================================

/**
 * 이벤트 타겟 (트리거 타입)
 */
export const EventTargetSchema = z.enum([
    'month',
    'destroy_nation',
    'occupy_city',
    'pre_month',
    'united',
]);
export type EventTargetType = z.infer<typeof EventTargetSchema>;

/**
 * 조건 연산자
 */
export const ConditionOperatorSchema = z.enum([
    '==', '>=', '<=', '>', '<', '!=',
]);
export type ConditionOperator = z.infer<typeof ConditionOperatorSchema>;

/**
 * 기본 조건 스키마
 * 재귀적 타입으로 and/or 중첩 지원
 */
export const BaseConditionSchema: z.ZodType<Condition> = z.lazy(() =>
    z.union([
        z.boolean(),                              // 상수 부울
        // 논리 조건: ["and", ...conditions] 또는 ["or", ...conditions]
        z.tuple([z.literal('and')]).rest(BaseConditionSchema),
        z.tuple([z.literal('or')]).rest(BaseConditionSchema),
        // 날짜 조건: ["Date", op, year, month]
        z.tuple([
            z.literal('Date'),
            ConditionOperatorSchema,
            z.union([z.number(), z.null()]),
            z.union([z.number(), z.null()]),
        ]),
        // 상대 날짜 조건: ["DateRelative", op, years]
        z.tuple([
            z.literal('DateRelative'),
            ConditionOperatorSchema,
            z.number(),
        ]),
        // 남은 국가 수 조건: ["RemainNation", op, count]
        z.tuple([
            z.literal('RemainNation'),
            ConditionOperatorSchema,
            z.number(),
        ]),
    ])
);

export type Condition =
    | boolean
    | ['and', ...Condition[]]
    | ['or', ...Condition[]]
    | ['Date', ConditionOperator, number | null, number | null]
    | ['DateRelative', ConditionOperator, number]
    | ['RemainNation', ConditionOperator, number];

/**
 * 액션 스키마 (일부 대표 액션만 정의)
 * 액션은 [actionName, ...args] 형식의 배열
 */
export const ActionSchema = z.array(z.unknown()).refine(
    (arr): arr is [string, ...unknown[]] =>
        arr.length >= 1 && typeof arr[0] === 'string',
    { message: '액션은 [문자열, ...인수] 형식이어야 합니다' }
);
export type Action = [string, ...unknown[]];

/**
 * 초기화 이벤트 스키마
 * [condition, ...actions]
 */
export const InitialEventSchema = z.array(z.unknown()).refine(
    (arr) => arr.length >= 1,
    { message: '초기화 이벤트는 최소 1개 요소(조건)가 필요합니다' }
);
export type InitialEvent = [Condition | boolean, ...Action[]];

/**
 * 게임 이벤트 스키마
 * [target, priority, condition, ...actions]
 */
export const GameEventDataSchema = z.array(z.unknown()).refine(
    (arr) => arr.length >= 3 &&
        typeof arr[0] === 'string' &&
        typeof arr[1] === 'number',
    { message: '게임 이벤트는 [target, priority, condition, ...actions] 형식이어야 합니다' }
);
export type GameEventData = [string, number, Condition | boolean, ...Action[]];

// ============================================================================
// 시나리오 루트 스키마
// ============================================================================

/**
 * 시나리오 JSON 스키마
 */
export const ScenarioSchema = z.object({
    // === 필수 필드 ===
    title: z.string(),                            // 시나리오 제목
    startYear: z.number(),                        // 시작 연도

    // === 선택 필드 ===
    life: z.union([z.literal(0), z.literal(1)]).optional(),     // 0: 가상, 1: 역사 기반
    fiction: z.union([z.literal(0), z.literal(1)]).optional(),  // 0: 정사, 1: 연의 기반

    // === 데이터 필드 ===
    nation: z.array(NationDataSchema).optional(),               // 초기 국가 배열
    diplomacy: z.array(DiplomacyDataSchema).optional(),         // 외교 관계
    general: z.array(GeneralDataSchema).optional(),             // NPC 장수 배열
    general_ex: z.array(GeneralDataSchema).optional(),          // 추가 NPC 장수
    general_neutral: z.array(GeneralDataSchema).optional(),     // 중립 NPC 장수
    cities: z.array(CityOverrideSchema).optional(),             // 도시 오버라이드

    // === 설정 필드 ===
    map: MapConfigSchema.optional(),              // 맵 설정
    stat: StatConfigSchema.optional(),            // 스탯 범위 설정
    const: GameConstOverrideSchema.optional(),    // 게임 상수 오버라이드

    // === 이벤트 ===
    history: z.array(z.string()).optional(),      // 역사 로그
    initialEvents: z.array(InitialEventSchema).optional(),      // 초기화 이벤트
    events: z.array(GameEventDataSchema).optional(),            // 게임 진행 이벤트
    ignoreDefaultEvents: z.boolean().optional(),  // 기본 이벤트 무시 여부
});
export type Scenario = z.infer<typeof ScenarioSchema>;

// ============================================================================
// 기본값 설정
// ============================================================================

/**
 * 기본 스탯 설정
 */
export const DEFAULT_STAT_CONFIG: Required<StatConfig> = {
    total: 165,
    min: 15,
    max: 80,
    npcTotal: 150,
    npcMax: 75,
    npcMin: 10,
    chiefMin: 65,
};

/**
 * 기본 맵 설정
 */
export const DEFAULT_MAP_CONFIG: Required<MapConfig> = {
    mapName: 'che',
    unitSet: 'che',
};

// ============================================================================
// 도시 초기 데이터 스키마
// ============================================================================

/**
 * 도시 초기 데이터 (맵 파일에서 읽는 형식)
 * [id, name, level, pop, agri, comm, secu, wall, def, region, x, y, connections[]]
 */
export const CityInitDataSchema = z.tuple([
    z.number(),                                    // id
    z.string(),                                    // name
    CityLevelSchema,                              // level
    z.number(),                                    // pop
    z.number(),                                    // agri
    z.number(),                                    // comm
    z.number(),                                    // secu
    z.number(),                                    // wall
    z.number(),                                    // def
    z.union([RegionSchema, z.string()]),          // region
    z.number(),                                    // x
    z.number(),                                    // y
    z.array(z.string()),                          // connections
]);
export type CityInitData = z.infer<typeof CityInitDataSchema>;

// ============================================================================
// 병종 데이터 스키마
// ============================================================================

/**
 * 병종 타입
 */
export const UnitTypeSchema = z.enum([
    'CASTLE', 'FOOTMAN', 'ARCHER', 'CAVALRY', 'WIZARD', 'SIEGE', 'MISC',
]);
export type UnitType = z.infer<typeof UnitTypeSchema>;

/**
 * 유닛 타입 숫자 매핑
 */
export const UNIT_TYPE_MAP = {
    CASTLE: 0,
    FOOTMAN: 1,
    ARCHER: 2,
    CAVALRY: 3,
    WIZARD: 4,
    SIEGE: 5,
    MISC: 6,
} as const;

/**
 * 병종 데이터 스키마
 * [id, type, name, attack, defense, speed, cost, magicRate, attackRange, defenseRange,
 *  constraints[], attackModifiers{}, defenseModifiers{}, descriptions[],
 *  attackAbility?, defenseAbility?, specialAbility?]
 */
export const UnitDataSchema = z.object({
    id: z.number(),
    type: z.number(),
    name: z.string(),
    attack: z.number(),
    defense: z.number(),
    speed: z.number(),
    cost: z.number(),
    magicRate: z.number(),
    attackRange: z.number(),
    defenseRange: z.number(),
    attackModifiers: z.record(z.number(), z.number()).optional(),
    defenseModifiers: z.record(z.number(), z.number()).optional(),
    descriptions: z.array(z.string()),
});
export type UnitData = z.infer<typeof UnitDataSchema>;

// ============================================================================
// 검증 유틸리티
// ============================================================================

/**
 * 시나리오 데이터 검증
 * @param data 검증할 데이터
 * @returns 검증된 Scenario 객체
 * @throws ZodError 검증 실패 시
 */
export function validateScenario(data: unknown): Scenario {
    return ScenarioSchema.parse(data);
}

/**
 * 안전한 시나리오 검증 (에러 발생하지 않음)
 * @param data 검증할 데이터
 * @returns 성공 시 데이터, 실패 시 에러 정보
 */
export function safeValidateScenario(data: unknown): z.SafeParseReturnType<unknown, Scenario> {
    return ScenarioSchema.safeParse(data);
}
