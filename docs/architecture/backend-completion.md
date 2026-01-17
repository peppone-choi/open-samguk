# Backend Completion Plan

이 문서는 TypeScript 백엔드 포팅을 완료하기 위한 남은 작업을 정리한다.
레거시 PHP 코드(`legacy/core/hwe/sammo/`)를 기준으로 미완료 항목을 분류하고 우선순위를 정의한다.

## 현재 완료 상태 요약

| 패키지            | 진행률 | 상태                                            |
| ----------------- | ------ | ----------------------------------------------- |
| `packages/common` | 90%    | 유틸리티 핵심 완료                              |
| `packages/infra`  | 100%   | Prisma/Redis 완료                               |
| `packages/logic`  | 90%    | 명령/트리거/이벤트/전투엔진 완료, 아이템 미완료 |
| `app/gateway-api` | 85%    | 인증/오케스트레이터 완료                        |
| `app/game-api`    | 50%    | 기본 라우터 완료                                |
| `app/game-engine` | 70%    | 턴 데몬 핵심 완료, 이벤트 어댑터 준비됨         |

---

## Phase 1: packages/logic 완성 (우선순위: 최고)

### 1.1 아이템 시스템 (Items)

**레거시**: `legacy/core/hwe/sammo/ActionItem/` (150+ 파일), `BaseItem.php`, `BaseStatItem.php`

**구현 방향**:

- 데이터 중심 접근: 150개 개별 클래스 대신 JSON/TypeScript 객체로 아이템 정의
- 아이템 효과는 트리거 시스템과 통합

**필요 작업**:

| 작업                       | 설명                                     | 레거시 참조                    |
| -------------------------- | ---------------------------------------- | ------------------------------ |
| `ItemDefinition` 타입 정의 | 무기/명마/서적/의술 등 카테고리별 스키마 | `BaseItem.php`                 |
| `ItemRegistry` 구현        | 아이템 ID → 효과 매핑                    | `ActionItem/*.php`             |
| `ItemEffectResolver` 구현  | 장비 효과 계산 (스탯 보정, 전투 보너스)  | `BaseStatItem.php`             |
| `UniqueItem` 처리          | 서버당 1개 유니크 아이템 로직            | `AuctionUniqueItem.php`        |
| 아이템 데이터 마이그레이션 | PHP 클래스 → JSON 변환 스크립트          | `ActionItem/che_무기_*.php` 등 |

**예상 파일 구조**:

```
packages/logic/src/items/
  ├── types.ts           # ItemDefinition, ItemEffect 타입
  ├── registry.ts        # 아이템 ID → 정의 매핑
  ├── resolver.ts        # 효과 계산 로직
  ├── unique.ts          # 유니크 아이템 특수 처리
  └── data/
      ├── weapons.json   # 무기 데이터
      ├── horses.json    # 명마 데이터
      ├── books.json     # 서적 데이터
      └── misc.json      # 기타 아이템
```

---

### 1.2 전투 엔진 (War Engine) ✅ 완료

**레거시**: `WarUnit.php`, `WarUnitGeneral.php`, `WarUnitCity.php`, `WarUnitTriggerCaller.php`

**현재 상태**: ✅ 핵심 구현 완료

**구현 완료 항목**:

| 작업                       | 설명                                   | 상태                  |
| -------------------------- | -------------------------------------- | --------------------- |
| `WarUnit` 추상 클래스      | 전투 유닛 공통 계약                    | ✅ `units.ts`         |
| `WarUnitGeneral` 구현      | 장수 유닛 (병력, 사기, 스킬 적용)      | ✅ `units.ts`         |
| `WarUnitCity` 구현         | 도시 방어 유닛 (성벽 HP = defence\*10) | ✅ `units.ts`         |
| `resolveWarBattle` 구현    | 페이즈별 전투 처리 (655줄 메인 루프)   | ✅ `engine.ts`        |
| `WarTriggerCaller` 구현    | 전투 훅에서 트리거 실행                | ✅ `triggers.ts`      |
| 데미지 계산                | `calcDamage()`, `computeWarPower()`    | ✅ `units.ts` 내 구현 |
| `WarBattleOutcome` 타입    | 전투 결과 (승패, 피해량, 획득물)       | ✅ `types.ts`         |
| `resolveWarAftermath` 구현 | 전투 후 처리 (사망자 분배, 도시 점령)  | ✅ `aftermath.ts`     |
| 전투 트리거 15개           | 격노, 필살, 반계, 저격, 위압 등        | ✅ `triggers/*.ts`    |

**구현된 파일 구조**:

```
packages/logic/src/war/
  ├── types.ts              # WarBattleInput, WarBattleOutcome, WarAftermathConfig 등
  ├── units.ts              # WarUnit, WarUnitGeneral, WarUnitCity (969줄)
  ├── engine.ts             # resolveWarBattle() (655줄)
  ├── aftermath.ts          # resolveWarAftermath(), resolveConquerCity() (481줄)
  ├── triggers.ts           # WarTriggerCaller, WarTriggerRegistry
  ├── triggers/             # 전투 트리거 15개
  ├── actions.ts            # WarActionPipeline, WarActionModule
  ├── crewType.ts           # WarCrewType 병종 정의
  └── utils.ts              # 유틸리티 함수들
```

**테스트**: `warEngine.test.ts`, `warAftermath.test.ts` 통과

---

### 1.3 이벤트 시스템 (Events) ✅ 완료

**레거시**: `Event/Engine.php`, `Event/Action/`, `Event/Condition/`, `StaticEvent/`

**현재 상태**: ✅ 핵심 구현 완료

**구현 완료 항목**:

| 작업                        | 설명                            | 상태               |
| --------------------------- | ------------------------------- | ------------------ |
| `EventCondition` 인터페이스 | 이벤트 발동 조건                | ✅ 8개 조건 구현   |
| `EventAction` 인터페이스    | 이벤트 실행 로직                | ✅ 구현 완료       |
| `EventEngine` 구현          | 월별 이벤트 처리 엔진           | ✅ 구현 완료       |
| `EventCalendarHandler`      | TurnCalendarHandler 어댑터      | ✅ 구현 완료       |
| **핵심 이벤트 액션**        |                                 |                    |
| - `ProcessIncome`           | 월별 수입 분배 (금 1월, 쌀 7월) | ✅ 구현 완료       |
| - `NewYear`                 | 연초 처리 (나이/호봉 증가)      | ✅ 구현 완료       |
| - `RaiseDisaster`           | 재해 발생 (분기별 1,4,7,10월)   | ✅ 구현 완료       |
| - `UpdateNationLevel`       | 국가 등급 갱신                  | ❌ 미구현 (후순위) |
| `StaticEvent` 처리          | 시스템 이벤트 (즉시집합 등)     | ❌ 미구현 (후순위) |

**구현된 파일 구조**:

```
packages/logic/src/events/
  ├── types.ts              # EventCondition, EventAction, EventContext 타입
  ├── engine.ts             # EventEngine, EventHandler 클래스
  ├── calendarAdapter.ts    # EventCalendarHandler (TurnCalendarHandler 브릿지)
  ├── conditions/
  │   └── index.ts          # 8개 조건: Date, Month, Year, Interval, Logic, Nation, Random, Always
  ├── actions/
  │   └── index.ts          # NewYearAction, RaiseDisasterAction, ProcessIncomeAction
  └── index.ts              # 모듈 내보내기
```

**통합 방법** (app/game-engine):

```typescript
import { createEventCalendarHandler, type EventWorldAdapter } from '@sammo-ts/logic';

// InMemoryTurnWorld 메서드를 EventWorldAdapter로 래핑
const worldAdapter: EventWorldAdapter = { ... };

const calendarHandler = createEventCalendarHandler(worldAdapter, {
    startYear: scenarioConfig.startYear,
    hiddenSeed: scenarioConfig.hiddenSeed,
});

// InMemoryTurnWorld 생성 시 calendarHandler 전달
new InMemoryTurnWorld(state, snapshot, { schedule, calendarHandler });
```

---

### 1.4 경매/베팅 시스템 (Auction/Betting)

**레거시**: `Auction.php`, `AuctionBasicResource.php`, `AuctionUniqueItem.php`, `Betting.php`

**현재 상태**: 미구현

**필요 작업**:

| 작업                | 설명                    | 레거시 참조                          |
| ------------------- | ----------------------- | ------------------------------------ |
| `Auction` 서비스    | 경매 생성/입찰/종료     | `Auction.php`                        |
| `ResourceAuction`   | 자원(쌀/금) 경매        | `AuctionBasicResource.php`           |
| `UniqueItemAuction` | 유니크 아이템 경매      | `AuctionUniqueItem.php`              |
| `Betting` 서비스    | 베팅 생성/참여/정산     | `Betting.php`                        |
| `Tournament` 연동   | 토너먼트 결과 기반 베팅 | `Event/Action/OpenNationBetting.php` |

---

## Phase 2: app/game-engine 완성

### 2.1 월별 업데이트 (Monthly Updates)

**현재 상태**: `turnDaemon.ts`에 턴 처리 루프 있음. 월별 처리 미구현.

**필요 작업**:

| 작업                    | 설명                        |
| ----------------------- | --------------------------- |
| `MonthlyProcessor` 구현 | 월 전환 시 이벤트 엔진 호출 |
| `preUpdateMonthly` 훅   | 월 시작 전 처리             |
| `postUpdateMonthly` 훅  | 월 종료 후 처리             |
| 수입/지출 처리          | 도시→국가→장수 자원 흐름    |
| 통계 갱신               | 월별 통계 기록              |

### 2.2 AI 확장 (General AI)

**현재 상태**: `turn/ai/` 에 기본 구조 있음. 정책 기반 행동 선택 미완성.

**필요 작업**:

| 작업             | 설명                     | 레거시 참조                |
| ---------------- | ------------------------ | -------------------------- |
| `AIPolicy` 확장  | 상황별 행동 우선순위     | `AutorunGeneralPolicy.php` |
| `NationAIPolicy` | 국가 레벨 AI 정책        | `AutorunNationPolicy.php`  |
| 비활성 처리      | killturn/block 장수 처리 | `GeneralAI.php`            |
| NPC 인수         | 비활성 장수 NPC 전환     | —                          |

### 2.3 전투 통합 (War Integration)

**필요 작업**:

| 작업                       | 설명                                |
| -------------------------- | ----------------------------------- |
| 출병 명령 → 전투 엔진 연결 | `che_출병` 실행 시 `WarEngine` 호출 |
| 전투 결과 → 월드 상태 반영 | 도시 점령, 병력 손실, 아이템 획득   |
| 전투 로그 기록             | `ActionLogger` 연동                 |

---

## Phase 3: app/game-api 완성

### 3.1 추가 필요 엔드포인트

| 라우터      | 엔드포인트         | 설명                        |
| ----------- | ------------------ | --------------------------- |
| `general`   | `general.me`       | 현재 장수 전체 정보         |
| `general`   | `general.stats`    | 장수 스탯 상세              |
| `city`      | `city.detail`      | 도시 상세 정보              |
| `nation`    | `nation.detail`    | 국가 상세 정보              |
| `auction`   | `auction.list`     | 진행 중 경매 목록           |
| `auction`   | `auction.bid`      | 입찰                        |
| `betting`   | `betting.list`     | 베팅 목록                   |
| `betting`   | `betting.place`    | 베팅 참여                   |
| `war`       | `war.simulate`     | 전투 시뮬레이션 (읽기 전용) |
| `diplomacy` | `diplomacy.status` | 외교 현황                   |

### 3.2 SSE 실시간 업데이트

| 채널            | 데이터             |
| --------------- | ------------------ |
| `world`         | 지도/중원정세 변경 |
| `nation:{id}`   | 국가 상태 변경     |
| `general:{id}`  | 장수 상태 변경     |
| `messages:{id}` | 새 메시지 알림     |

---

## Phase 4: 통합 테스트

### 4.1 결정적 RNG 검증

- 레거시 명령 실행 결과와 TypeScript 결과 비교
- 동일 시드 → 동일 결과 보장

### 4.2 전체 턴 사이클 테스트

- 장수 생성 → 명령 예약 → 턴 실행 → 결과 확인
- 전투 시나리오 (공격/방어/도시 점령)
- 월별 이벤트 (수입, 재해)

---

## 구현 우선순위 요약

| 순위 | 항목                        | 이유                                    | 상태      |
| ---- | --------------------------- | --------------------------------------- | --------- |
| 1    | 전투 엔진 (`war/`)          | 게임 핵심 기능. 출병 명령이 동작해야 함 | ✅ 완료   |
| 2    | 이벤트 시스템 (`events/`)   | 월별 처리 없이는 경제/성장 불가         | ✅ 완료   |
| 3    | 아이템 시스템 (`items/`)    | 장비 효과가 전투/스탯에 영향            | ❌ 미완료 |
| 4    | 월별 업데이트 (game-engine) | 이벤트 시스템과 연동                    | 🔨 준비됨 |
| 5    | 경매/베팅                   | 부가 기능. 핵심 완료 후 구현            | ❌ 미완료 |
| 6    | API 확장 (game-api)         | 프론트엔드 필요에 따라 점진적 추가      | 🔨 진행중 |

---

## 레거시 파일 → TypeScript 매핑 참조

### 핵심 클래스

| 레거시 PHP                 | TypeScript 위치                                      | 상태      |
| -------------------------- | ---------------------------------------------------- | --------- |
| `WarUnit.php`              | `packages/logic/src/war/units.ts`                    | ✅ 완료   |
| `WarUnitGeneral.php`       | `packages/logic/src/war/units.ts`                    | ✅ 완료   |
| `WarUnitTriggerCaller.php` | `packages/logic/src/war/triggers.ts`                 | ✅ 완료   |
| `Event/Engine.php`         | `packages/logic/src/events/engine.ts`                | ✅ 완료   |
| `BaseItem.php`             | `packages/logic/src/items/types.ts`                  | ❌ 미구현 |
| `Auction.php`              | `packages/logic/src/auction/service.ts`              | ❌ 미구현 |
| `Betting.php`              | `packages/logic/src/betting/service.ts`              | ❌ 미구현 |
| `GeneralAI.php`            | `app/game-engine/src/turn/ai/generalAi.ts`           | 🔨 진행중 |
| `TurnExecutionHelper.php`  | `packages/logic/src/actions/turn/executionHelper.ts` | ✅ 완료   |

### 트리거/특기 (대부분 완료)

| 카테고리 | 레거시                   | TypeScript                      | 상태         |
| -------- | ------------------------ | ------------------------------- | ------------ |
| 전투특기 | `ActionSpecialWar/`      | `triggers/special/war/`         | ✅ 21개 완료 |
| 국가특성 | `ActionNationType/`      | `triggers/special/nation/`      | ✅ 14개 완료 |
| 내정특기 | `ActionSpecialDomestic/` | `triggers/special/domestic/`    | ✅ 8개 완료  |
| 성격     | `ActionPersonality/`     | `triggers/special/personality/` | ✅ 6개 완료  |
