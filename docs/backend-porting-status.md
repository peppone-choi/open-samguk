# 백엔드 포팅 현황 및 포팅 대상 분석 보고서

## 1. 개요

- **작성일**: 2026-01-07
- **목적**: 현재 Node.js/TypeScript로 포팅된 `open-samguk` 프로젝트의 백엔드 로직 진행 상황을 파악하고, 남아있는 레거시(PHP) 포팅 대상을 명확히 하여 향후 작업의 로드맵을 수립함.
- **기준**: Core Logic (`packages/logic`), API (`apps/api`), Engine (`apps/engine`) 및 Legacy (`legacy/hwe`) 비교 분석.

## 2. 포팅 완료 및 진행 중인 항목

### 2.1. 인프라 및 핵심 로직 (@sammo/logic)

- **아키텍처**: Modified CQRS + In-Memory Authoritative State 패턴 구현 완료.
- **엔티티**: `WorldSnapshot`, `WorldDelta`, `General`, `City`, `Nation` 등 핵심 도메인 타입 정의 및 Prisma 스키마 연동 완료.
- **영속성**: `SnapshotRepository`를 통한 전체 상태 로드(`load`) 및 델타 반영(`applyDelta`) 구현 완료. `general_turn` 예약 커맨드 연동 완료.
- **게임 루프**: `GameEngine`을 중심으로 `TurnProcessor`(개별 턴)와 `MonthlyPipeline`(월간 턴) 분리 구현 완료. `EngineService` 데몬 루프 구현.
- **유틸리티 (@sammo/common)**:
  - `JosaUtil`: 한글 조사 처리 포팅 완료.
  - `RandUtil`, `LiteHashDRBG`: 결정론적 RNG 구현 완료.
  - `StringUtil`: 문자열 처리 유틸 구현.

### 2.2. 커맨드 및 제약 조건 (Commands & Constraints)

- **커맨드 (General Commands)**: 약 55개 구현 완료 (휴식, 내정, 전쟁, 등용 등). `CommandHelper`를 통한 자동 등록 시스템 구축.
- **커맨드 (Nation Commands)**: 약 39개 구현 완료 (천도, 세율 조정, 외교 등).
- **제약 조건 (Constraints)**: `ConstraintHelper`를 통해 약 70+개 제약 조건 로직 포팅 완료.
- **병종 제한 (Unit Constraints)**: `ReqTech`, `ReqCities` 등 11개 제약 조건 클래스 포팅 완료.

### 2.3. 이벤트 및 트리거

- **전투 트리거**: 31개 포팅 완료 (회피, 필살, 계략 등).
- **월간 이벤트**: `ProcessIncome`, `Disaster` 등 주요 월간 로직 포팅 완료 (80% 수준).
- **장수 트리거**: 4개 포팅 완료.

### 2.4. 데이터

- **시나리오 로더**: `ScenarioLoader`, `MapLoader` 구현 완료. `che` 맵 데이터 로딩 가능.
- **아이템**: `BaseItem`, `ItemData` 구조 잡힘. 일부 기본 아이템 데이터 존재.

### 2.5. API

- **tRPC Router**: `trpc.router.ts`에 `setGeneralTurn`, `getReservedTurns` 등 턴 관리 API 구현 완료.
- **GameService**: DB 및 엔진과 연동되는 기본 서비스 메서드 구현.

---

## 3. 포팅 잔여 대상 (Legacy 분석 기반)

레거시 PHP 코드(`legacy/hwe/sammo`)와 비교했을 때, 100% 포팅을 위해 남은 핵심 작업들은 다음과 같습니다.

### 3.1. 아이템 데이터 (ActionItem)

- **현황**: `packages/logic/src/domain/items`에 기본 구조와 약 74개 스탯 아이템만 존재.
- **대상**: 레거시 `ActionItem` 폴더의 약 161개 파일 중 **특수 능력이 있는 유니크 아이템** 로직 대거 누락.
  - 예: `CheSeoChokMap`(서촉지형도 - 이동 보정), `CheMedBook`(의술서 - 부상 회복) 등 구체적인 아이템 효과 구현체(class)가 필요.
  - 단순 데이터(`ItemData.ts`)로 처리 불가능한 로직 포함 아이템들을 `create` 팩토리나 별도 클래스로 이식해야 함.

### 3.2. 병종 데이터 및 특수 병종 로직

- **현황**: `GameConst.ts`와 `basic.json`에 6개 기본 병종(보병, 궁병, 기병 등)만 하드코딩됨.
- **대상**: 레거시 `GameUnitConstBase.php` 및 `che_except_siege.php` 등에서 정의된 특수 병종 데이터 이식 필요.
  - 대상 병종: 청주병, 수병, 자객병, 근위병, 등갑병, 백이병, 궁기병, 연노병, 강궁병, 석궁병, 백마병, 중장기병, 돌격기병, 철기병, 수렵기병, 맹수병, 호표기, 신귀병, 백귀병 등 약 20+종.
  - 작업: `UnitData.ts` 또는 JSON 파일로 데이터화 + 특수 능력(상성 보정 등) 구현.

### 3.3. 미구현 이벤트 및 시나리오 특수 로직

- **현황**: 월간 이벤트 대부분 포팅되었으나, 특정 시나리오나 상황에 종속된 이벤트 일부 누락 가능성.
  - NPC 관련 이벤트, 천통(엔딩) 처리, 초기화 이벤트(`InitialEventRunner`)의 커버리지 확인 필요.
  - `ludo_rathowm.php` 등 레거시 시나리오별 특수 유닛/이벤트 파일 확인 필요.

### 3.4. API 엔드포인트 확장

- **현황**: 턴 예약 위주로 구현됨.
- **대상**: 프론트엔드 연동을 위한 조회성 API 부족.
  - 장수 정보 조회, 도시 정보 상세 조회, 국가 정보 조회, 접속자 목록, 랭킹, 전투 로그 조회 등.
  - 메시지 전송/수신 API.
  - 경매(Auction) 시스템 API (레거시 `ng_auction` 대응).

### 3.5. 기타 누락 기능

- **전투 시스템 상세**: `WarEngine.ts`가 있지만, 실제 전투 시뮬레이션의 모든 엣지 케이스(일기토, 특수 병종 상성, 지형 보정 등)가 레거시 `BattleResult.php` 로직과 1:1 매칭되는지 검증 필요.
- **경매 시스템**: 유니크 아이템 경매 로직 (`Auction.php`).
- **토너먼트**: 비시즌/휴식기 콘텐츠인 토너먼트 로직 (`Tournament.php`).
- **상속 포인트**: 엔딩 후 포인트 정산 및 상속 시스템 (`Inheritance.php`).

---

## 4. 우선순위 및 로드맵

1.  **아이템/병종 데이터 완전 이식 (최우선)**: 게임의 다양성을 담당하는 핵심 데이터. (`Basic` -> `Full`)
2.  **전투 엔진 정밀화**: 이식된 병종과 아이템이 전투에 올바르게 반영되는지 검증 및 로직 보완.
3.  **API 확장**: 프론트엔드 대시보드와 상호작용하기 위한 Read API 대거 확충.
4.  **부가 시스템**: 경매, 토너먼트, 상속 시스템 순차 구현.

## 5. 결론

"백엔드 로직 100% 포팅"을 위해서는 **특수 아이템 스크립트화**와 **병종 데이터의 전수 이식**이 가장 시급한 과제입니다. 이 두 가지가 완료되어야 전투와 내정의 밸런스가 원작과 동일해집니다. 이후 API를 통해 이를 웹 클라이언트와 연결하면 됩니다.
