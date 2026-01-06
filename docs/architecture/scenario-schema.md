# 시나리오 스키마 분석 (Scenario Schema)

시나리오 JSON 파일의 상세 스키마 및 로딩 시스템을 정리합니다.

## 1. 파일 구조

```
legacy/hwe/scenario/
├── default.json           # 기본 스탯 설정
├── frame.json             # 스키마 참조 템플릿
├── scenario_0.json        # 공백지 일반
├── scenario_1.json        # 공백지 소형
├── scenario_*.json        # 시나리오 데이터 (82개 파일)
├── map/                   # 맵 정의 (PHP)
│   ├── che.php            # 기본 중국 맵
│   ├── chess.php          # 체스판 맵 (8x8)
│   ├── cr.php
│   ├── ludo_rathowm.php
│   ├── miniche.php        # 소형 맵
│   ├── miniche_b.php      # 소형 맵 B
│   ├── miniche_clean.php
│   └── pokemon_v1.php
└── unit/                  # 유닛(병종) 정의 (PHP)
    ├── basic.php          # 기본 병종
    ├── che.php
    ├── che_except_siege.php
    ├── cr.php
    ├── event_more_crewtype.php
    ├── ludo_rathowm.php
    └── siegetank.php
```

## 2. 시나리오 번호 체계

| 범위      | 카테고리                          |
| --------- | --------------------------------- |
| 0-2       | 공백지 시나리오 (빈 맵)           |
| 900-913   | 특수 시나리오 (충차전, 난투전 등) |
| 1010-1120 | 역사모드 1 (후한~삼국 시대)       |
| 2010-2901 | 역사모드 2+ (가상/오리지널)       |

## 3. JSON 스키마

### 3.1 루트 스키마

```typescript
interface Scenario {
  // === 필수 필드 ===
  title: string; // 시나리오 제목 (예: "【역사모드1】 황건적의 난")
  startYear: number; // 시작 연도 (예: 181)

  // === 선택 필드 ===
  life?: 0 | 1; // 0: 가상, 1: 역사 기반
  fiction?: 0 | 1; // 0: 정사, 1: 연의 기반

  // === 데이터 필드 ===
  nation?: NationData[]; // 초기 국가 배열
  diplomacy?: DiplomacyData[]; // 외교 관계
  general?: GeneralData[]; // NPC 장수 배열
  general_ex?: GeneralData[]; // 추가 NPC 장수 (조건부 등장)
  general_neutral?: GeneralData[]; // 중립 NPC 장수
  cities?: CityOverride[]; // 도시 오버라이드

  // === 설정 필드 ===
  map?: MapConfig; // 맵 설정
  stat?: StatConfig; // 스탯 범위 설정
  const?: GameConstOverride; // 게임 상수 오버라이드

  // === 이벤트 ===
  history?: string[]; // 역사 로그
  initialEvents?: InitialEvent[]; // 초기화 이벤트
  events?: GameEvent[]; // 게임 진행 이벤트
  ignoreDefaultEvents?: boolean; // 기본 이벤트 무시 여부
}
```

### 3.2 국가 데이터 (NationData)

```typescript
type NationData = [
  name: string, // 국가명 (예: "후한", "위", "촉")
  color: string, // RGB 컬러 (예: "#800000")
  gold: number, // 초기 금
  rice: number, // 초기 쌀
  infoText: string, // 국가 설명
  tech: number, // 기술력
  type: string, // 성향 (예: "유가", "태평도", "법가")
  nationLevel: number, // 국가 규모 (0:방랑군 ~ 7:황제)
  cities: string[], // 소속 도시 목록 (첫 번째가 수도)
];
```

**국가 규모 (nationLevel):**

- 0: 방랑군
- 1: 호족
- 2: 군벌
- 3: 주목
- 4: 자사
- 5: 왕
- 6: 제왕
- 7: 황제

### 3.3 외교 데이터 (DiplomacyData)

```typescript
type DiplomacyData = [
  nation1: number, // 국가 1 인덱스
  nation2: number, // 국가 2 인덱스
  diplomacyType: number, // 외교 종류
  duration: number, // 기간 (개월)
];
```

**외교 종류:**

- 0: 전쟁
- 1: 선포
- 7: 불가침

### 3.4 장수 데이터 (GeneralData)

```typescript
type GeneralData = [
  affinity: number | null, // 상성 (1~150, 999:영구재야, null:랜덤)
  name: string, // 장수명
  picturePath: string | null, // 전투 이미지 경로 (null: 없음)
  nationName: string | number | null, // 소속 국가 (null/0: 재야)
  locatedCity: string | null, // 위치 도시 (null: 랜덤)
  leadership: number, // 통솔
  strength: number, // 무력
  intel: number, // 지력
  officerLevel: number, // 관직 (0:재야, 1:장수, 5~10:수뇌, 11:참모, 12:군주)
  birth: number, // 생년
  death: number, // 몰년
  ego: string | null, // 성격 (null: 랜덤)
  speciality: string | null, // 특기 (null: 미정)
  text?: string, // 대사 (선택)
];
```

**affinity 특수 값:**

- `-150`: 플레이어 캐릭터 (가상 시나리오)
- `999`: 영구 재야 (등용 불가)
- `-1` ~ `-2`: 특수 상태

**officerLevel:**

- 0: 재야
- 1: 장수
- 5~10: 수뇌진
- 11: 참모
- 12: 군주

**ego (성격) 목록:**

- 왕좌, 패권, 할거, 정복, 출세, 대의, 의협, 유지, 재간, 안전, 은둔

**speciality (특기) 목록:**

- 기병, 보병, 궁병, 무쌍, 위압, 돌격, 필살, 견고, 집중
- 신중, 신산, 반계, 귀병, 귀모, 경작, 인덕, 상재, 환술, 척사
- 의술, 축성, 수비, 저격, 공성, 발명, 징병, 통찰

### 3.5 맵 설정 (MapConfig)

```typescript
interface MapConfig {
  mapName?: string; // 맵 이름 (기본: "che")
  unitSet?: string; // 유닛 세트 (기본: "che")
}
```

**맵 종류:**

- `che`: 기본 중국 지도
- `miniche`: 소형 중국 지도
- `miniche_b`: 소형 지도 B 변형
- `chess`: 체스판 (8x8 격자)
- `cr`: CR 맵
- `ludo_rathowm`: 루도 라토움 맵
- `pokemon_v1`: 포켓몬 스타일 맵

### 3.6 스탯 설정 (StatConfig)

```typescript
interface StatConfig {
  total?: number; // 플레이어 스탯 총합 (기본: 165)
  min?: number; // 스탯 최소값 (기본: 15)
  max?: number; // 스탯 최대값 (기본: 80)
  npcTotal?: number; // NPC 스탯 총합 (기본: 150)
  npcMax?: number; // NPC 스탯 최대값 (기본: 75)
  npcMin?: number; // NPC 스탯 최소값 (기본: 10)
  chiefMin?: number; // 수뇌 스탯 최소값 (기본: 65)
}
```

### 3.7 게임 상수 오버라이드 (GameConstOverride)

```typescript
interface GameConstOverride {
  defaultMaxGeneral?: number; // 최대 장수 수 (기본: 300)
  joinRuinedNPCProp?: number; // 망국 NPC 합류 확률
  npcBanMessageProb?: number; // NPC 금지 메시지 확률
  expandCityPopIncreaseAmount?: number; // 도시 확장 시 인구 증가량
  expandCityDevelIncreaseAmount?: number; // 도시 확장 시 개발 증가량
  expandCityWallIncreaseAmount?: number; // 도시 확장 시 성벽 증가량
  // ... 기타 GameConst 필드
}
```

## 4. 이벤트 시스템

### 4.1 초기화 이벤트 (InitialEvent)

초기화 시 한 번만 실행됩니다.

```typescript
type InitialEvent = [
  condition: boolean | Condition, // 실행 조건
  ...actions: Action[], // 실행할 액션들
];
```

### 4.2 게임 이벤트 (GameEvent)

게임 진행 중 주기적으로 평가됩니다.

```typescript
type GameEvent = [
  target: EventTarget, // 트리거 타입
  priority: number, // 우선순위 (높을수록 먼저 실행)
  condition: Condition, // 실행 조건
  ...actions: Action[], // 실행할 액션들
];
```

**EventTarget (트리거 타입):**

- `month`: 매월 체크
- `destroy_nation`: 국가 멸망 시

### 4.3 조건 (Condition)

```typescript
// 논리 조건
type LogicCondition = ["and" | "or", ...conditions: Condition[]];

// 날짜 조건
type DateCondition = [
  "Date",
  op: "==" | ">=" | "<=" | ">" | "<",
  year: number | null,
  month: number | null,
];

// 상대 날짜 조건
type DateRelativeCondition = ["DateRelative", op: string, years: number];

// 남은 국가 수 조건
type RemainNationCondition = ["RemainNation", op: string, count: number];

// 상수 부울
type ConstBool = boolean;
```

**예시:**

```json
["and", ["Date", ">=", 183, 1], ["RemainNation", "<=", 8]]
```

### 4.4 액션 (Action)

| 액션 이름            | 설명           | 예시                             |
| -------------------- | -------------- | -------------------------------- |
| `CreateManyNPC`      | 다수 NPC 생성  | `["CreateManyNPC", 10, 10]`      |
| `RaiseNPCNation`     | NPC 국가 거병  | `["RaiseNPCNation"]`             |
| `OpenNationBetting`  | 국가 배팅 오픈 | `["OpenNationBetting", 4, 5000]` |
| `BlockScoutAction`   | 정찰 액션 차단 | `["BlockScoutAction"]`           |
| `DeleteEvent`        | 이벤트 삭제    | `["DeleteEvent"]`                |
| `ChangeCity`         | 도시 속성 변경 | `["ChangeCity", "free", {...}]`  |
| `NoticeToHistoryLog` | 역사 로그 기록 | `["NoticeToHistoryLog", "..."]`  |

## 5. 맵 데이터 구조 (PHP)

```php
class CityConst extends CityConstBase {
    protected static $initCity = [
        // [id, 도시명, 규모, 인구, 농업, 상업, 치안, 성벽, 수비, 지역, x, y, 연결도시[]]
        [1, '낙양', '특', 8357, 117, 120, 100, 121, 124, '중원', 285, 176, ['하내', '홍농', '호로']],
        // ...
    ];

    // 지역 맵 (선택)
    public static $regionMap = [
        '킹'=>1, 1=>'킹',
        // ...
    ];
}
```

**도시 규모:**

- `특`: 특대도시
- `대`: 대도시
- `중`: 중도시
- `소`: 소도시
- `진`: 진
- `수`: 수비도시
- `관`: 관문
- `이`: 이민족

## 6. 유닛(병종) 데이터 구조 (PHP)

```php
class GameUnitConst extends GameUnitConstBase {
    const DEFAULT_CREWTYPE = 1100;  // 기본 병종 ID

    protected static function getBuildData(): array {
        return [
            // [ID, 타입, 이름, 공격력, 방어력, 속도, 비용, 마법%, 공격범위, 방어범위,
            //  조건[], 공격보정{}, 방어보정{}, 설명[], 특수능력...]
            [
                1100, self::T_FOOTMAN, '보병',
                100, 150, 7, 10, 0, 9, 9,
                [],
                [self::T_ARCHER=>1.2, self::T_CAVALRY=>0.8, self::T_SIEGE=>1.2],
                [self::T_ARCHER=>0.8, self::T_CAVALRY=>1.2, self::T_SIEGE=>0.8],
                ['표준적인 보병입니다.', '보병은 방어특화이며,', '상대가 회피하기 어렵습니다.'],
                null, null, null
            ],
            // ...
        ];
    }
}
```

**유닛 타입 상수:**

- `T_CASTLE`: 성벽
- `T_FOOTMAN`: 보병
- `T_ARCHER`: 궁병
- `T_CAVALRY`: 기병
- `T_WIZARD`: 귀병 (계략 특화)
- `T_SIEGE`: 공성병기

## 7. 시나리오 로딩 흐름

```
1. JSON 파일 읽기
   └─ scenario_{id}.json 파싱

2. 기본 설정 병합
   ├─ default.json 로드
   ├─ stat 설정 병합
   └─ map/unitSet 결정

3. 맵 데이터 로드
   └─ map/{mapName}.php 동적 로드

4. 유닛 세트 로드
   └─ unit/{unitSet}.php 동적 로드

5. 국가/장수 초기화
   ├─ nation[] → Nation 객체 생성
   ├─ general[] → GeneralBuilder 실행
   └─ diplomacy[] 적용

6. 이벤트 등록
   ├─ initialEvents 실행 (1회)
   └─ events 등록 (주기적 평가)

7. 게임 시작
```

## 8. TypeScript 변환 계획

### 8.1 Zod 스키마

```typescript
import { z } from 'zod';

export const GeneralSchema = z.tuple([
  z.union([z.number(), z.null()]),  // affinity
  z.string(),                        // name
  z.union([z.string(), z.null()]),  // picturePath
  z.union([z.string(), z.number(), z.null()]), // nationName
  z.union([z.string(), z.null()]),  // locatedCity
  z.number(),                        // leadership
  z.number(),                        // strength
  z.number(),                        // intel
  z.number(),                        // officerLevel
  z.number(),                        // birth
  z.number(),                        // death
  z.union([z.string(), z.null()]),  // ego
  z.union([z.string(), z.null()]),  // speciality
  z.string().optional(),             // text
]);

export const ScenarioSchema = z.object({
  title: z.string(),
  startYear: z.number(),
  life: z.union([z.literal(0), z.literal(1)]).optional(),
  fiction: z.union([z.literal(0), z.literal(1)]).optional(),
  nation: z.array(z.tuple([...])).optional(),
  general: z.array(GeneralSchema).optional(),
  // ...
});
```

### 8.2 마이그레이션 단계

1. **Phase 1**: 스키마 정의 및 검증
   - Zod 스키마 작성
   - 기존 JSON 파일 검증

2. **Phase 2**: 타입 변환
   - PHP 클래스 → TypeScript 인터페이스
   - 맵/유닛 데이터 JSON 변환

3. **Phase 3**: 로더 구현
   - ScenarioLoader 클래스
   - 이벤트 시스템 포팅

## 9. 참고 파일

- 로딩 클래스: `legacy/hwe/sammo/Scenario.php`
- 이벤트 핸들러: `legacy/hwe/sammo/Event/EventHandler.php`
- 조건 클래스: `legacy/hwe/sammo/Event/Condition/`
- 액션 클래스: `legacy/hwe/sammo/Event/Action/`
