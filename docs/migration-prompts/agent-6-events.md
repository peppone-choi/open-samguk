# Agent 6: 이벤트 시스템 마이그레이션

## 업무 범위
동적 이벤트와 정적 이벤트 시스템을 TypeScript로 포팅

## 대상 디렉토리
- 소스1: `legacy/hwe/sammo/Event/*.php`
- 소스2: `legacy/hwe/sammo/Event/Action/*.php`
- 소스3: `legacy/hwe/sammo/Event/Condition/*.php`
- 소스4: `legacy/hwe/sammo/StaticEvent/*.php`
- 타겟: `packages/logic/src/domain/events/`

## Event 구조 분석
```
Event/
├── EventHandler.php
├── Action/
│   └── *.php (이벤트 액션들)
└── Condition/
    └── *.php (이벤트 조건들)
```

## 이벤트 조건 체크리스트 (Event/Condition)
```bash
ls legacy/hwe/sammo/Event/Condition/
```
- [ ] 각 조건 파일 포팅

## 이벤트 액션 체크리스트 (Event/Action)
```bash
ls legacy/hwe/sammo/Event/Action/
```
- [ ] 각 액션 파일 포팅

## StaticEvent 체크리스트
```bash
ls legacy/hwe/sammo/StaticEvent/
```
- [ ] 각 정적 이벤트 포팅

## 이미 포팅된 이벤트
- [x] WandererDisbandEvent.ts (방랑자 해산)
- [x] TestPreMonthEvent.ts (테스트용)

## 포팅 규칙
1. 이벤트 발동 시점 (pre-month, post-month, on-action)
2. 조건 체크 로직
3. 이벤트 효과 적용
4. 결정론적 RNG 시딩

## 파일 구조
```typescript
// packages/logic/src/domain/events/types.ts
export enum EventTiming {
  PreMonth = 'pre-month',
  PostMonth = 'post-month',
  OnAction = 'on-action',
  OnTurnStart = 'on-turn-start',
  OnTurnEnd = 'on-turn-end',
}

export interface EventCondition {
  check(snapshot: WorldSnapshot, context: EventContext): boolean;
}

export interface EventAction {
  execute(rng: RandUtil, snapshot: WorldSnapshot, context: EventContext): WorldDelta;
}

export interface GameEvent {
  readonly id: string;
  readonly name: string;
  readonly timing: EventTiming;
  readonly conditions: EventCondition[];
  readonly actions: EventAction[];
  readonly priority: number;
  readonly repeatable: boolean;
}

// packages/logic/src/domain/events/EventPipeline.ts
export class EventPipeline {
  private events: GameEvent[] = [];

  register(event: GameEvent): void {
    this.events.push(event);
    this.events.sort((a, b) => b.priority - a.priority);
  }

  processEvents(
    timing: EventTiming,
    rng: RandUtil,
    snapshot: WorldSnapshot,
    context: EventContext
  ): WorldDelta[] {
    const deltas: WorldDelta[] = [];
    for (const event of this.events.filter(e => e.timing === timing)) {
      if (event.conditions.every(c => c.check(snapshot, context))) {
        for (const action of event.actions) {
          deltas.push(action.execute(rng, snapshot, context));
        }
      }
    }
    return deltas;
  }
}
```
