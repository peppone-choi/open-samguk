# 웹 세션 2: 특기 시스템 구현

## 프로젝트 개요

삼국지 모의전투 게임의 레거시 PHP 코드를 TypeScript로 포팅하는 프로젝트입니다.

## 이 세션의 목표

전투 특기 21개 + 내정 특기 9개 = 총 30개 구현

## 작업 환경

- 레거시 전투: `legacy/hwe/sammo/ActionSpecialWar/` (PHP)
- 레거시 내정: `legacy/hwe/sammo/ActionSpecialDomestic/` (PHP)
- 구현 위치: `packages/logic/src/domain/specials/` (TypeScript)
- 기존 파일: `BaseSpecial.ts`, `types.ts`, `index.ts`

## 구현할 전투 특기 (20개)

### 공격 특기 (7개)

```
1. che_필살.php → CriticalSpecial.ts      - 필살 확률 증가
2. che_무쌍.php → UnrivaledSpecial.ts     - 공격/방어 보너스
3. che_돌격.php → ChargeSpecial.ts        - 돌격 데미지 증가
4. che_집중.php → ConcentrationSpecial.ts - 명중률 증가
5. che_격노.php → RageSpecial.ts          - 분노 시 공격력 증가
6. che_저격.php → SniperSpecial.ts        - 저격 확률 증가
7. che_위압.php → IntimidationSpecial.ts  - 적 사기 감소
```

### 방어 특기 (4개)

```
8. che_견고.php → FortitudeSpecial.ts     - 방어력 증가
9. che_신중.php → CautionSpecial.ts       - 회피율 증가
10. che_신산.php → DivineCalcSpecial.ts   - 계략 방어
11. che_반계.php → CounterSpecial.ts      - 계략 반사
```

### 병종 특기 (5개)

```
12. che_기병.php → CavalrySpecial.ts      - 기병 보너스
13. che_궁병.php → ArcherSpecial.ts       - 궁병 보너스
14. che_보병.php → InfantrySpecial.ts     - 보병 보너스
15. che_귀병.php → SpiritSpecial.ts       - 귀병 보너스
16. che_공성.php → SiegeSpecial.ts        - 공성 보너스
```

### 보조 특기 (4개)

```
17. che_환술.php → IllusionSpecial.ts     - 계략 강화
18. che_의술.php → MedicineSpecial.ts     - 치료 강화
19. che_징병.php → ConscriptSpecial.ts    - 징병 효율
20. che_척사.php → ExorcismSpecial.ts     - 귀병 대항
```

## 구현할 내정 특기 (9개)

```
1. che_경작.php → CultivationSpecial.ts   - 농업 개발 +30%
2. che_상재.php → CommerceSpecial.ts      - 상업 개발 +30%
3. che_인덕.php → BenevolenceSpecial.ts   - 민심/충성 보너스
4. che_축성.php → ConstructionSpecial.ts  - 성벽/수비 +30%
5. che_수비.php → DefenseSpecial.ts       - 수비 강화 +30%
6. che_발명.php → InventionSpecial.ts     - 기술 연구 +50%
7. che_통찰.php → InsightSpecial.ts       - 첩보 성공률 +30%
8. che_귀모.php → StrategySpecial.ts      - 계략 성공률 +20%
9. che_거상.php → MerchantSpecial.ts      - (비활성화)
```

## 구현 템플릿

```typescript
// packages/logic/src/domain/specials/war/CriticalSpecial.ts
import { BaseSpecial, SpecialEffect, SpecialContext } from "../BaseSpecial.js";

export class CriticalSpecial extends BaseSpecial {
  readonly id = "critical";
  readonly name = "필살";
  readonly category = "war" as const;
  readonly description = "필살 발동 확률이 증가합니다.";

  getWarEffect(ctx: SpecialContext): SpecialEffect {
    return {
      criticalChanceBonus: 0.15, // +15% 필살 확률
      criticalDamageBonus: 0.3, // +30% 필살 데미지
    };
  }

  getDomesticEffect(ctx: SpecialContext): SpecialEffect {
    return {}; // 전투 특기는 내정 효과 없음
  }
}
```

```typescript
// packages/logic/src/domain/specials/domestic/CultivationSpecial.ts
import { BaseSpecial, SpecialEffect, SpecialContext } from "../BaseSpecial.js";

export class CultivationSpecial extends BaseSpecial {
  readonly id = "cultivation";
  readonly name = "경작";
  readonly category = "domestic" as const;
  readonly description = "농업 개발 효율이 30% 증가합니다.";

  getWarEffect(ctx: SpecialContext): SpecialEffect {
    return {}; // 내정 특기는 전투 효과 없음
  }

  getDomesticEffect(ctx: SpecialContext): SpecialEffect {
    return {
      agricultureBonus: 0.3, // +30% 농업 개발
    };
  }
}
```

## 특기 효과 정리표

### 전투 특기 효과

| 특기 | 주요 효과        | 수치      |
| ---- | ---------------- | --------- |
| 필살 | 필살 확률/데미지 | +15%/+30% |
| 무쌍 | 공격/방어        | +15%/+10% |
| 돌격 | 돌격 데미지      | +40%      |
| 집중 | 명중률           | +20%      |
| 견고 | 방어력           | +20%      |
| 기병 | 기병 공격/속도   | +20%/+10% |
| 궁병 | 궁병 사거리/명중 | +1/+15%   |
| 보병 | 보병 방어/체력   | +15%/+10% |

### 내정 특기 효과

| 특기 | 주요 효과 | 수치      |
| ---- | --------- | --------- |
| 경작 | 농업 개발 | +30%      |
| 상재 | 상업 개발 | +30%      |
| 인덕 | 민심/충성 | +20%/+10% |
| 축성 | 성벽/수비 | +30%      |
| 발명 | 기술 연구 | +50%      |
| 통찰 | 첩보 성공 | +30%      |

## 테스트 템플릿

```typescript
// packages/logic/src/domain/specials/war/CriticalSpecial.test.ts
import { describe, it, expect } from "vitest";
import { CriticalSpecial } from "./CriticalSpecial.js";

describe("CriticalSpecial", () => {
  it("should increase critical chance", () => {
    const special = new CriticalSpecial();
    const effect = special.getWarEffect({});

    expect(effect.criticalChanceBonus).toBe(0.15);
  });

  it("should increase critical damage", () => {
    const special = new CriticalSpecial();
    const effect = special.getWarEffect({});

    expect(effect.criticalDamageBonus).toBe(0.3);
  });

  it("should have no domestic effect", () => {
    const special = new CriticalSpecial();
    const effect = special.getDomesticEffect({});

    expect(Object.keys(effect).length).toBe(0);
  });
});
```

## 파일 구조

```
packages/logic/src/domain/specials/
├── BaseSpecial.ts          # 기존 - 기본 클래스
├── types.ts                # 기존 - 타입 정의
├── index.ts                # 업데이트 필요 - export
├── war/
│   ├── CriticalSpecial.ts
│   ├── UnrivaledSpecial.ts
│   ├── ChargeSpecial.ts
│   ├── ... (20개)
│   └── index.ts
└── domestic/
    ├── CultivationSpecial.ts
    ├── CommerceSpecial.ts
    ├── ... (9개)
    └── index.ts
```

## 진행 체크리스트

전투 특기:

- [ ] CriticalSpecial + test
- [ ] UnrivaledSpecial + test
- [ ] ChargeSpecial + test
- [ ] ConcentrationSpecial + test
- [ ] FortitudeSpecial + test
- [ ] ... (나머지 15개)

내정 특기:

- [ ] CultivationSpecial + test
- [ ] CommerceSpecial + test
- [ ] BenevolenceSpecial + test
- [ ] ... (나머지 6개)

## 완료 기준

- 전투 특기 20개 + 내정 특기 9개 = 29개 구현
- 각 특기에 최소 2개 테스트
- index.ts에 모든 특기 export
- `pnpm --filter @sammo-ts/logic test` 통과
