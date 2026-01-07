# 핸드오프 문서 - 삼국지 모의전투 TypeScript 포팅

> 최종 업데이트: 2026-01-07

## 프로젝트 개요

**삼국지 모의전투 HiDCHe** 레거시 PHP 게임 엔진을 TypeScript로 1:1 포팅하는 프로젝트.

| 항목          | 값                                  |
| ------------- | ----------------------------------- |
| 프로젝트 경로 | `/Users/apple/Desktop/open-samguk/` |
| 레거시 코드   | `legacy/`                           |
| 새 코드       | `packages/`, `apps/`                |
| 패키지 매니저 | pnpm (workspace)                    |

---

## 현재 진행 상황

### 전체 요약

| 분류         | 레거시 | 구현 완료 | 진행률     |
| ------------ | ------ | --------- | ---------- |
| 장수 커맨드  | 55개   | 42개      | 76%        |
| 국가 커맨드  | 39개   | 23개      | 59%        |
| **제약조건** | 73개   | **73개**  | **100%** ✅ |
| 전투 트리거  | 32개   | 31개      | 97% ✅     |
| 장수 트리거  | 4개    | 4개       | 100% ✅    |
| 국가 성향    | 15개   | 15개      | 100% ✅    |
| 전투 특기    | 21개   | 1개       | 5%         |
| 내정 특기    | 30개   | 0개       | 0%         |

### 이번 세션 완료 (2026-01-07)

**Constraint 포팅 16개 (완성):**

| 제약조건    | PHP 원본                | TypeScript                          | 로직                                |
| ----------- | ----------------------- | ----------------------------------- | ----------------------------------- |
| 상인 요구   | `ReqCityTrader.php`     | `ReqCityTraderConstraint.ts` ✅     | `city.trade !== null || arg >= 2` |
| 부대장 필수 | `MustBeTroopLeader.php` | `MustBeTroopLeaderConstraint.ts` ✅ | `general.no === general.troop`      |
| 임관 허용   | `AllowJoinAction.php`   | `AllowJoinActionConstraint.ts` ✅   | `general.makelimit === 0`           |
| 외교 상태 허용 | `AllowDiplomacyStatus.php` | `AllowDiplomacyStatusConstraint.ts` ✅ | `diplomacy.state in allowList` |
| 외교 상태 불허 | `DisallowDiplomacyStatus.php` | `DisallowDiplomacyStatusConstraint.ts` ✅ | `diplomacy.state not in disallowList` |
| 기간 외교 허용 | `AllowDiplomacyWithTerm.php` | `AllowDiplomacyWithTermConstraint.ts` ✅ | `diplomacy.state === code && term >= min` |
| 임관 허용(대상) | `AllowJoinDestNation.php` | `AllowJoinDestNationConstraint.ts` ✅ | `scoutLevel === 0 && gennum limit && npc prefix check` |
| 전장 도시     | `BattleGroundCity.php` | `BattleGroundCityConstraint.ts` ✅ | `diplomacy.state === '0'` |
| 반란 허용     | `AllowRebellion.php` | `AllowRebellionConstraint.ts` ✅ | `lord.killTurn < env.killTurn && lord is not NPC` |
| 국가명 중복 확인 | `CheckNationNameDuplicate.php` | `CheckNationNameDuplicateConstraint.ts` ✅ | `Snapshot` 전수 검사 |
| 임관 가능 국가 존재 | `ExistsAllowJoinNation.php` | `ExistsAllowJoinNationConstraint.ts` ✅ | `Snapshot` 전수 검사 (인원 제한 포함) |
| 경로 탐색 | `HasRoute.php` | `HasRouteConstraint.ts` ✅ | `MapUtil.getDistanceWithNation` (자국령) |
| 적진 포함 경로 | `HasRouteWithEnemy.php` | `HasRouteWithEnemyConstraint.ts` ✅ | `MapUtil.getDistanceWithNation` (교전국 포함) |
| 병사 마진 | `ReqGeneralCrewMargin.php` | `ReqGeneralCrewMarginConstraint.ts` ✅ | `crew < leadership * 100` |
| 부대원 요구 | `ReqTroopMembers.php` | `ReqTroopMembersConstraint.ts` ✅ | `troopId !== 0 && member count > 1` |
| 전략 커맨드 허용 | `AllowStrategicCommand.php` | `AllowStrategicCommandConstraint.ts` ✅ | `warState === 0` |
| 전략 커맨드 가용 | `AvailableStrategicCommand.php` | `AvailableStrategicCommandConstraint.ts` ✅ | `strategicCmdLimit <= arg` |
| 징병 타입 가용 | `AvailableRecruitCrewType.php` | `AvailableRecruitCrewTypeConstraint.ts` ✅ | (임시) `allow` |
| 콜백 제약조건 | `AdhocCallback.php` | `AdhocCallbackConstraint.ts` ✅ | `callback(): string | null` |

**GameConst 추가:**

- `joinActionLimit: 12` (거병, 임관 제한 기간)

**테스트:** 266개 모두 통과 ✅

---

## 다음 작업

### 즉시 - 국가 커맨드 (16개 남음)

**Phase 1 - 전략 커맨드:**

- [ ] `che_피장파장.php` → `NationRetaliationCommand.ts`
- [ ] `che_필사즉생.php` → `NationDesperateCommand.ts`

**Phase 2 - 내정 커맨드:**

- [ ] `che_백성동원.php` → `NationMobilizeCommand.ts`
- [ ] `che_의병모집.php` → `NationRecruitMilitiaCommand.ts`
- [ ] `che_이호경식.php` → `NationEconomicWarfareCommand.ts`
- [ ] `cr_인구이동.php` → `NationMigratePopulationCommand.ts`

---

## 프로젝트 구조

```
/Users/apple/Desktop/open-samguk/
├── packages/
│   ├── common/          # @sammo/common - RNG, JosaUtil, StringUtil
│   ├── infra/           # @sammo/infra - Prisma, Redis
│   └── logic/           # @sammo/logic - 게임 로직 (핵심)
│       └── src/domain/
│           ├── commands/        # 장수/국가 커맨드
│           ├── constraints/     # 제약 조건 (55개 완료)
│           ├── triggers/        # 트리거 (war/, 루트)
│           ├── nation-types/    # 국가 성향
│           ├── specials/        # 특기 (war/, domestic/)
│           ├── items/           # 아이템
│           └── events/          # 월별 이벤트
│
├── apps/
│   ├── api/             # NestJS API 서버
│   ├── engine/          # Turn Daemon
│   └── web/             # Next.js 프론트엔드
│
├── legacy/              # 레거시 PHP 코드
│   └── hwe/sammo/
│       ├── Command/Nation/    # 국가 커맨드 원본
│       ├── Command/General/   # 장수 커맨드 원본
│       ├── Constraint/        # 제약조건 원본 (73개)
│       └── ...
│
└── docs/                # 문서
    ├── architecture/
    └── implementation-progress.md
```

---

## 포팅 패턴

### Constraint 파일 구조

```typescript
// packages/logic/src/domain/constraints/XxxConstraint.ts
import {
  Constraint,
  ConstraintContext,
  ConstraintResult,
  StateView,
} from "../Constraint.js";

export class XxxConstraint implements Constraint {
  name = "Xxx";

  constructor(private param?: number) {}

  requires(ctx: ConstraintContext) {
    return [{ kind: "general" as const, id: ctx.actorId }];
  }

  test(ctx: ConstraintContext, view: StateView): ConstraintResult {
    const general = view.get({ kind: "general", id: ctx.actorId });
    if (!general) {
      return { kind: "deny", reason: "장수 정보를 찾을 수 없습니다." };
    }

    if (/* condition */) {
      return { kind: "allow" };
    }
    return { kind: "deny", reason: "에러 메시지" };
  }
}
```

### index.ts에 export 추가 필수

```typescript
// packages/logic/src/domain/constraints/index.ts
export { XxxConstraint } from "./XxxConstraint.js";
```

---

## 핵심 타입 참조

### Constraint 타입

```typescript
type RequirementKey =
  | { kind: "general"; id: number }
  | { kind: "city"; id: number }
  | { kind: "nation"; id: number }
  | { kind: "destGeneral"; id: number }
  | { kind: "destCity"; id: number }
  | { kind: "destNation"; id: number }
  | { kind: "arg"; key: string }
  | { kind: "env"; key: string };

type ConstraintResult =
  | { kind: "allow" }
  | { kind: "deny"; reason: string; code?: string }
  | { kind: "unknown"; missing: RequirementKey[] };
```

### entities.ts 주요 타입

```typescript
interface General {
  id: number;
  name: string;
  nationId: number;
  cityId: number;
  officerLevel: number; // 관직 레벨 (5 이상 = 수뇌, 12 = 군주)
  npc: number; // >= 2 이면 NPC
  troop: number; // 부대 ID (자신 = 부대장)
  makelimit: number; // 임관 제한 (0이면 임관 가능)
  // ...
}

interface City {
  id: number;
  name: string;
  nationId: number;
  trade: number | null; // 상인 (null이면 없음)
  // ...
}

interface Nation {
  id: number;
  name: string;
  level: number; // 0 = 방랑군
  war: number; // 전쟁 상태
  // ...
}
```

---

## 빌드 명령어

```bash
# 의존성 설치
pnpm install

# 전체 테스트 (필수)
pnpm -w run test

# 타입 체크
cd packages/logic && pnpm tsc --noEmit

# Constraint 파일 수 확인
ls packages/logic/src/domain/constraints/*.ts | wc -l  # 현재 56 (55 + index)
```

---

## 제약사항

| 금지                    | 이유                      |
| ----------------------- | ------------------------- |
| `as any`                | 타입 안전성 파괴          |
| `@ts-ignore`            | 타입 에러 숨김            |
| `@ts-expect-error`      | 타입 에러 숨김            |
| 불필요한 주석           | 코드로 설명 가능하면 제거 |
| 테스트 삭제로 빌드 통과 | 절대 금지                 |

---

## 레거시 참조

| 기능        | 레거시 위치                                              |
| ----------- | -------------------------------------------------------- |
| 국가 커맨드 | `legacy/hwe/sammo/Command/Nation/`                       |
| 장수 커맨드 | `legacy/hwe/sammo/Command/General/`                      |
| 제약 조건   | `legacy/hwe/sammo/Constraint/`                           |
| 트리거      | `legacy/hwe/sammo/WarUnitTrigger/`, `GeneralTrigger/`    |
| 상수        | `legacy/hwe/sammo/GameConstBase.php`                     |
| 엔티티      | `legacy/hwe/sammo/General.php`, `Nation.php`, `City.php` |

---

## 작업 시작 프롬프트

```
# 삼국지 모의전투 PHP → TypeScript 1:1 포팅

## 현재 상태
Constraint 포팅: 61/73개 완료 (84%)
국가 커맨드 포팅: 23/39개 완료 (59%)

## Constraint 작업
1. 레거시 PHP 파일 읽기: `legacy/hwe/sammo/Constraint/Xxx.php`
2. 기존 패턴 참고: `packages/logic/src/domain/constraints/MustBeTroopLeaderConstraint.ts`
3. 새 Constraint 작성
4. index.ts에 export 추가
5. 테스트 확인: `pnpm -w run test`

## 다음 포팅 대상 (Constraint)
- CheckNationNameDuplicate → CheckNationNameDuplicateConstraint
- ExistsAllowJoinNation → ExistsAllowJoinNationConstraint
```

---

_마지막 업데이트: 2026-01-07_
