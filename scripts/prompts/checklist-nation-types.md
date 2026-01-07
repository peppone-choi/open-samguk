# 국가 성향 시스템 구현 프롬프트

## 목표

레거시 PHP 국가 성향 시스템을 TypeScript로 포팅

## 사전 조건

1. 레거시 `legacy/hwe/sammo/ActionNationType/` 분석 완료
2. 각 성향별 보너스/페널티 정리 완료

## 체크리스트

### 유가 계열 (4개)

- [ ] `che_덕가.php` → `VirtueNationType.ts`
  - 민심/충성도 보너스
- [ ] `che_유가.php` → `ConfucianNationType.ts`
  - 내정 보너스
- [ ] `che_명가.php` → `LogicianNationType.ts`
  - 지력 관련 보너스
- [ ] `che_묵가.php` → `MohistNationType.ts`
  - 방어 보너스

### 병가/법가 계열 (3개)

- [ ] `che_법가.php` → `LegalistNationType.ts`
  - 세금/질서 보너스
- [ ] `che_병가.php` → `MilitaristNationType.ts`
  - 전투 보너스
- [ ] `che_도적.php` → `BanditNationType.ts`
  - 약탈 보너스

### 도가/불가 계열 (3개)

- [ ] `che_도가.php` → `TaoistNationType.ts`
  - 계략/회피 보너스
- [ ] `che_불가.php` → `BuddhistNationType.ts`
  - 회복 보너스
- [ ] `che_음양가.php` → `YinYangNationType.ts`
  - 계략 보너스

### 종교 계열 (3개)

- [ ] `che_태평도.php` → `TaipingNationType.ts`
  - 민심/모병 보너스
- [ ] `che_오두미도.php` → `WudoumiNationType.ts`
  - 병력 유지 보너스
- [ ] `che_종횡가.php` → `DiplomatNationType.ts`
  - 외교 보너스

### 기본 (2개)

- [ ] `None.php` → `NoneNationType.ts`
  - 기본 (보너스 없음)
- [ ] `che_중립.php` → `NeutralNationType.ts`
  - 중립 성향

## 구현 패턴

```typescript
// packages/logic/src/domain/nation-types/MilitaristNationType.ts
import { NationType, NationTypeContext, NationTypeEffect } from "./types.js";

export class MilitaristNationType implements NationType {
  readonly id = "militarist";
  readonly name = "병가";
  readonly description = "전투와 병법에 특화된 성향";

  getEffect(ctx: NationTypeContext): NationTypeEffect {
    return {
      // 전투 보너스
      attackBonus: 0.1,
      defenseBonus: 0.05,
      // 훈련 효율 보너스
      trainingEfficiency: 1.2,
      // 내정 페널티
      agricultureEfficiency: 0.9,
      commerceEfficiency: 0.9,
    };
  }

  getAvailableCommands(): string[] {
    // 병가 전용 커맨드
    return ["nation_forced_march", "nation_military_training"];
  }
}
```

## 성향별 효과 요약

| 성향     | 주요 보너스            | 주요 페널티    |
| -------- | ---------------------- | -------------- |
| 덕가     | 민심 +20%              | 전투력 -10%    |
| 법가     | 세금 +15%, 질서 +10%   | 민심 -15%      |
| 병가     | 전투력 +10%, 훈련 +20% | 내정 -10%      |
| 도가     | 계략 +20%, 회피 +15%   | 공격력 -10%    |
| 불가     | 회복 +30%              | 공격력 -15%    |
| 도적     | 약탈 +50%, 모병 +20%   | 외교 불가      |
| 묵가     | 방어 +20%, 성벽 +15%   | 공격 -10%      |
| 명가     | 지력 +10%, 계략 +10%   | 무력 -5%       |
| 유가     | 내정 +15%, 충성도 +10% | 전투 -5%       |
| 음양가   | 계략 +25%              | 직접 전투 -15% |
| 종횡가   | 외교 +30%              | 전투 -10%      |
| 태평도   | 민심 +25%, 모병 +15%   | 기술 -10%      |
| 오두미도 | 병력 유지 -20%         | 기술 -15%      |
| 중립     | 외교 +10%              | 전투 -5%       |

## 테스트 작성

```typescript
describe("MilitaristNationType", () => {
  it("should provide attack bonus", () => {
    const nationType = new MilitaristNationType();
    const effect = nationType.getEffect(createContext());
    expect(effect.attackBonus).toBeGreaterThan(0);
  });

  it("should have agriculture penalty", () => {
    const nationType = new MilitaristNationType();
    const effect = nationType.getEffect(createContext());
    expect(effect.agricultureEfficiency).toBeLessThan(1);
  });
});
```

## 레거시 참조 파일

- `legacy/hwe/sammo/ActionNationType/` - 국가 성향
- `legacy/hwe/sammo/Enums/NationType.php` - 성향 enum
