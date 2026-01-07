# 이벤트 시스템 구현 프롬프트

## 목표

레거시 PHP 이벤트 시스템을 TypeScript로 포팅

## 레거시 파일 위치

- `legacy/hwe/sammo/Event/Action/` (29개)
- `legacy/hwe/sammo/Event/Condition/` (6개)
- `legacy/hwe/sammo/StaticEvent/` (2개)

## 체크리스트

### Phase 1: 이벤트 조건 (6개)

- [ ] ConstBool.php → ConstBoolCondition.ts
- [ ] Date.php → DateCondition.ts
- [ ] DateRelative.php → DateRelativeCondition.ts
- [ ] Interval.php → IntervalCondition.ts
- [ ] Logic.php → LogicCondition.ts
- [ ] RemainNation.php → RemainNationCondition.ts

### Phase 2: 주기적 이벤트 액션 (8개)

- [ ] ProcessIncome.php → ProcessIncomeAction.ts (수입 처리)
- [ ] ProcessSemiAnnual.php → ProcessSemiAnnualAction.ts (반기 처리)
- [ ] ProcessWarIncome.php → ProcessWarIncomeAction.ts (전쟁 수입)
- [ ] NewYear.php → NewYearAction.ts (새해 이벤트)
- [ ] UpdateCitySupply.php → UpdateCitySupplyAction.ts (보급 갱신)
- [ ] UpdateNationLevel.php → UpdateNationLevelAction.ts (레벨 갱신)
- [ ] RandomizeCityTradeRate.php → RandomizeCityTradeRateAction.ts
- [ ] MergeInheritPointRank.php → MergeInheritPointRankAction.ts

### Phase 3: NPC 관련 이벤트 (6개)

- [ ] CreateAdminNPC.php → CreateAdminNPCAction.ts
- [ ] CreateManyNPC.php → CreateManyNPCAction.ts
- [ ] RegNPC.php → RegNPCAction.ts
- [ ] RegNeutralNPC.php → RegNeutralNPCAction.ts
- [ ] ProvideNPCTroopLeader.php → ProvideNPCTroopLeaderAction.ts
- [ ] AutoDeleteInvader.php → AutoDeleteInvaderAction.ts

### Phase 4: 이민족 이벤트 (2개)

- [ ] RaiseInvader.php → RaiseInvaderAction.ts
- [ ] InvaderEnding.php → InvaderEndingAction.ts

### Phase 5: 국가/배팅 이벤트 (4개)

- [ ] OpenNationBetting.php → OpenNationBettingAction.ts
- [ ] FinishNationBetting.php → FinishNationBettingAction.ts
- [ ] RaiseNPCNation.php → RaiseNPCNationAction.ts
- [ ] AddGlobalBetray.php → AddGlobalBetrayAction.ts

### Phase 6: 특수 이벤트 (9개)

- [ ] AssignGeneralSpeciality.php → AssignGeneralSpecialityAction.ts
- [ ] BlockScoutAction.php → BlockScoutAction.ts
- [ ] UnblockScoutAction.php → UnblockScoutAction.ts
- [ ] ChangeCity.php → ChangeCityAction.ts
- [ ] DeleteEvent.php → DeleteEventAction.ts
- [ ] LostUniqueItem.php → LostUniqueItemAction.ts
- [ ] NoticeToHistoryLog.php → NoticeToHistoryLogAction.ts
- [ ] RaiseDisaster.php → RaiseDisasterAction.ts
- [ ] ResetOfficerLock.php → ResetOfficerLockAction.ts

### Phase 7: 정적 이벤트 (2개)

- [ ] event\_부대발령즉시집합.php → TroopAssembleEvent.ts
- [ ] event\_부대탑승즉시이동.php → TroopMoveEvent.ts

## 구현 패턴

### 이벤트 조건

```typescript
// packages/logic/src/domain/events/conditions/BaseCondition.ts
export interface ConditionResult {
  met: boolean;
  reason?: string;
}

export abstract class BaseCondition {
  abstract readonly id: string;
  abstract check(ctx: EventContext): ConditionResult;
}
```

```typescript
// packages/logic/src/domain/events/conditions/DateCondition.ts
export class DateCondition extends BaseCondition {
  readonly id = "date";

  constructor(
    private year: number,
    private month: number
  ) {
    super();
  }

  check(ctx: EventContext): ConditionResult {
    const { gameTime } = ctx;
    return {
      met: gameTime.year === this.year && gameTime.month === this.month,
    };
  }
}
```

### 이벤트 액션

```typescript
// packages/logic/src/domain/events/actions/ProcessIncomeAction.ts
export class ProcessIncomeAction extends BaseEventAction {
  readonly id = "process_income";

  execute(ctx: EventContext): EventDelta {
    const delta: EventDelta = { nations: {}, cities: {}, generals: {} };

    for (const nation of Object.values(ctx.snapshot.nations)) {
      const income = this.calculateIncome(ctx, nation);
      delta.nations[nation.id] = {
        gold: nation.gold + income.gold,
        rice: nation.rice + income.rice,
      };
    }

    return delta;
  }

  private calculateIncome(ctx: EventContext, nation: Nation) {
    // 세금 계산 로직
    const cities = Object.values(ctx.snapshot.cities).filter((c) => c.nationId === nation.id);

    let gold = 0;
    let rice = 0;

    for (const city of cities) {
      gold += Math.floor((city.comm * nation.rate) / 100);
      rice += Math.floor((city.agri * nation.rate) / 100);
    }

    return { gold, rice };
  }
}
```

## 이벤트 스케줄링

```typescript
// 이벤트 정의 예시
const eventSchedule = [
  {
    id: "monthly_income",
    condition: new IntervalCondition({ months: 1 }),
    action: new ProcessIncomeAction(),
  },
  {
    id: "new_year",
    condition: new DateRelativeCondition({ month: 1 }),
    action: new NewYearAction(),
  },
  {
    id: "semi_annual",
    condition: new LogicCondition("or", [
      new DateRelativeCondition({ month: 1 }),
      new DateRelativeCondition({ month: 7 }),
    ]),
    action: new ProcessSemiAnnualAction(),
  },
];
```

## 레거시 참조

- `legacy/hwe/sammo/Event/`
- `legacy/hwe/sammo/BaseStaticEvent.php`
- `legacy/hwe/sammo/StaticEventHandler.php`
