# Web 구현 2: 이벤트 시스템

## 프로젝트 컨텍스트

```
프로젝트: open-samguk (삼국지 모의전투 포팅)
스택: TypeScript (순수 도메인 로직)
경로: packages/logic/src/domain/events/
```

## 참고 문서

먼저 이 파일들을 읽어주세요:

- `docs/architecture/event-catalog.md` - 이벤트 목록
- `packages/logic/src/domain/events/types.ts` - 이벤트 타입
- `packages/logic/src/domain/MonthlyPipeline.ts` - 월간 파이프라인

## 구현 작업

### 1. Pre-Month 이벤트 구현

```typescript
// packages/logic/src/domain/events/pre-month/
├── PopulationGrowthEvent.ts    // 인구 증가
├── TaxCollectionEvent.ts       // 세금 징수
└── index.ts
```

### 2. Month 이벤트 구현

```typescript
// packages/logic/src/domain/events/month/
├── WandererDisbandEvent.ts     // 방랑자 해산 (이미 있음)
├── DisasterEvent.ts            // 재해 이벤트
├── HarvestEvent.ts             // 수확 이벤트
└── index.ts
```

### 3. 이벤트 인터페이스

```typescript
interface IEvent {
  readonly name: string;
  readonly phase: "pre-month" | "month" | "post-month";
  readonly priority: number;

  canExecute(state: WorldState): boolean;
  execute(state: WorldState, rng: RNG): EventResult;
}
```

### 4. 코드 작성 규칙

- 결정론적 RNG 사용 (LiteHashDRBG)
- 외부 의존성 없이 순수 함수로
- 테스트 필수

### 5. 검증

```bash
pnpm --filter @sammo-ts/logic test
```

## 출력 형식

```typescript
// 파일: packages/logic/src/domain/events/pre-month/PopulationGrowthEvent.ts
import { WorldState } from "../../WorldState";
// ... 전체 코드
```
