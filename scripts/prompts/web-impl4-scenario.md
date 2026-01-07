# Web 구현 4: 시나리오 로더

## 프로젝트 컨텍스트

```
프로젝트: open-samguk (삼국지 모의전투 포팅)
스택: TypeScript + zod
경로: packages/logic/src/domain/scenario/
```

## 참고 문서

먼저 이 파일들을 읽어주세요:

- `docs/architecture/scenario-schema.md` - 시나리오 스키마
- `legacy/hwe/scenario/scenario_0.json` - 예시 시나리오
- `packages/logic/src/domain/WorldState.ts` - 월드 상태

## 구현 작업

### 1. 시나리오 스키마 (zod)

```typescript
// packages/logic/src/domain/scenario/schema.ts
import { z } from "zod";

export const ScenarioSchema = z.object({
  id: z.number(),
  name: z.string(),
  year: z.number(),
  month: z.number(),
  nations: z.array(NationSchema),
  cities: z.array(CitySchema),
  generals: z.array(GeneralSchema),
  // ...
});
```

### 2. 시나리오 로더

```typescript
// packages/logic/src/domain/scenario/ScenarioLoader.ts
export class ScenarioLoader {
  async load(scenarioId: number): Promise<Scenario>;
  validate(data: unknown): Scenario;
  toWorldState(scenario: Scenario): WorldState;
}
```

### 3. 맵 데이터 로더

```typescript
// packages/logic/src/domain/scenario/MapLoader.ts
```

### 4. 초기 이벤트 실행

```typescript
// packages/logic/src/domain/scenario/InitialEventRunner.ts
```

### 5. 코드 작성 규칙

- zod로 런타임 검증
- 레거시 JSON과 호환
- 에러 메시지 한글

### 6. 검증

```bash
pnpm --filter @sammo-ts/logic test
```

## 출력 형식

```typescript
// 파일: packages/logic/src/domain/scenario/schema.ts
import { z } from "zod";
// ... 전체 코드
```
