# 웹 세션 구현 가이드

5개의 claude.ai 웹 세션을 병렬로 실행하여 레거시 포팅을 진행합니다.

## 세션 배정

| 세션 | 파일 | 구현 항목 | 예상 시간 |
|------|------|----------|----------|
| 1 | `web-session-1-war-triggers.md` | 전투 트리거 36개 | 2-3시간 |
| 2 | `web-session-2-specials.md` | 특기 30개 | 2-3시간 |
| 3 | `web-session-3-nation-commands.md` | 국가 커맨드 20개 | 2-3시간 |
| 4 | `web-session-4-nation-types.md` | 국가 성향 15개 + 제약 30개 | 2-3시간 |
| 5 | `web-session-5-items-events.md` | 아이템 50개 + 이벤트 15개 | 2-3시간 |

## 시작 방법

### 1. 각 세션에 프롬프트 복사

각 웹 세션에서 해당 프롬프트 파일의 내용을 복사하여 시작합니다:

```bash
# 프롬프트 파일 위치
cat scripts/prompts/web-session-1-war-triggers.md
cat scripts/prompts/web-session-2-specials.md
cat scripts/prompts/web-session-3-nation-commands.md
cat scripts/prompts/web-session-4-nation-types.md
cat scripts/prompts/web-session-5-items-events.md
```

### 2. 프로젝트 컨텍스트 제공

각 세션 시작 시 다음 파일들을 첨부하거나 내용을 공유:

```bash
# 필수 컨텍스트
- CLAUDE.md                      # 프로젝트 규칙
- packages/logic/src/domain/entities.ts  # 엔티티 정의

# 참조용 (선택)
- docs/legacy-inventory.md       # 레거시 구조
- docs/implementation-progress.md # 진행 현황
```

### 3. 레거시 코드 첨부

해당 세션에서 구현할 레거시 PHP 파일들을 첨부:

**세션 1 (전투 트리거):**
```
legacy/hwe/sammo/WarUnitTrigger/*.php
```

**세션 2 (특기):**
```
legacy/hwe/sammo/ActionSpecialWar/*.php
legacy/hwe/sammo/ActionSpecialDomestic/*.php
```

**세션 3 (국가 커맨드):**
```
legacy/hwe/sammo/Command/Nation/*.php
```

**세션 4 (국가 성향 + 제약):**
```
legacy/hwe/sammo/ActionNationType/*.php
legacy/hwe/sammo/Constraint/*.php
```

**세션 5 (아이템 + 이벤트):**
```
legacy/hwe/sammo/ActionItem/*.php (선택적으로)
legacy/hwe/sammo/Event/Action/*.php
```

## 세션별 시작 프롬프트

### 세션 1
```
삼국지 모의전투 게임의 전투 트리거 시스템을 TypeScript로 포팅합니다.

프로젝트 구조:
- 레거시: legacy/hwe/sammo/WarUnitTrigger/
- 구현: packages/logic/src/domain/triggers/

첨부한 프롬프트 파일(web-session-1-war-triggers.md)을 따라
36개 전투 트리거를 구현해주세요.

Phase 1(필살/회피)부터 시작합니다.
```

### 세션 2
```
삼국지 모의전투 게임의 특기 시스템을 TypeScript로 포팅합니다.

프로젝트 구조:
- 레거시 전투: legacy/hwe/sammo/ActionSpecialWar/
- 레거시 내정: legacy/hwe/sammo/ActionSpecialDomestic/
- 구현: packages/logic/src/domain/specials/

첨부한 프롬프트 파일(web-session-2-specials.md)을 따라
30개 특기를 구현해주세요.

전투 특기부터 시작합니다.
```

### 세션 3
```
삼국지 모의전투 게임의 국가 커맨드를 TypeScript로 포팅합니다.

프로젝트 구조:
- 레거시: legacy/hwe/sammo/Command/Nation/
- 구현: packages/logic/src/domain/commands/

기존 구현 참조: NationDeclareWarCommand.ts, NationRewardCommand.ts

첨부한 프롬프트 파일(web-session-3-nation-commands.md)을 따라
20개 미구현 국가 커맨드를 구현해주세요.

전략 커맨드(급습, 수몰 등)부터 시작합니다.
```

### 세션 4
```
삼국지 모의전투 게임의 국가 성향과 제약 조건을 TypeScript로 포팅합니다.

프로젝트 구조:
- 레거시 성향: legacy/hwe/sammo/ActionNationType/
- 레거시 제약: legacy/hwe/sammo/Constraint/
- 구현: packages/logic/src/domain/nation-types/ (새로 생성)
- 구현: packages/logic/src/domain/constraints/

첨부한 프롬프트 파일(web-session-4-nation-types.md)을 따라
15개 국가 성향과 30개 제약 조건을 구현해주세요.

국가 성향부터 시작합니다.
```

### 세션 5
```
삼국지 모의전투 게임의 아이템과 이벤트 시스템을 TypeScript로 포팅합니다.

프로젝트 구조:
- 레거시 아이템: legacy/hwe/sammo/ActionItem/
- 레거시 이벤트: legacy/hwe/sammo/Event/Action/
- 구현: packages/logic/src/domain/items/ (새로 생성)
- 구현: packages/logic/src/domain/events/ (새로 생성)

첨부한 프롬프트 파일(web-session-5-items-events.md)을 따라
50개 아이템과 15개 이벤트를 구현해주세요.

고급 무기/명마/서적부터 시작합니다.
```

## 결과물 통합

각 세션에서 생성된 코드를 받으면:

1. **파일 저장**: 해당 디렉토리에 파일 저장
2. **빌드 확인**: `pnpm -r build`
3. **테스트 실행**: `pnpm --filter @sammo-ts/logic test`
4. **커밋**: 세션별로 커밋

```bash
# 세션 1 결과물 커밋
git add packages/logic/src/domain/triggers/
git commit -m "feat(logic): implement war unit triggers (36 files)"

# 세션 2 결과물 커밋
git add packages/logic/src/domain/specials/
git commit -m "feat(logic): implement specials system (30 files)"

# ... 이하 동일
```

## 예상 완료 항목

| 세션 | 완료 시 구현된 항목 |
|------|-------------------|
| 1 | 전투 트리거 36개 |
| 2 | 전투 특기 20개 + 내정 특기 9개 |
| 3 | 국가 커맨드 20개 추가 (총 38개) |
| 4 | 국가 성향 15개 + 제약 조건 30개 |
| 5 | 아이템 50개 + 이벤트 15개 |

**총: ~195개 항목 구현**

## 주의사항

1. **결정론적 RNG**: 모든 랜덤 로직은 `RandUtil` 사용
2. **JosaUtil**: 한글 조사 처리 시 `@sammo-ts/common`의 `JosaUtil` 사용
3. **테스트 필수**: 각 구현에 최소 2개 테스트
4. **타입 안전성**: `any` 사용 금지, 명시적 타입 정의
