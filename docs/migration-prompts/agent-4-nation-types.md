# Agent 4: 국가 성향 시스템 마이그레이션

## 업무 범위
국가 성향 (NationType) 시스템을 TypeScript로 포팅

## 대상 디렉토리
- 소스: `legacy/hwe/sammo/ActionNationType/*.php` (15개 파일)
- 타겟: `packages/logic/src/domain/nation-types/`

## 체크리스트

- [ ] None.php → NoNationType.ts (기본값)
- [ ] che_덕가.php → VirtueNationType.ts
- [ ] che_도가.php → TaoismNationType.ts
- [ ] che_도적.php → BanditNationType.ts
- [ ] che_명가.php → LogiciansNationType.ts
- [ ] che_묵가.php → MohistNationType.ts
- [ ] che_법가.php → LegalistNationType.ts
- [ ] che_병가.php → MilitaristNationType.ts
- [ ] che_불가.php → BuddhistNationType.ts
- [ ] che_음양가.php → YinYangNationType.ts
- [ ] che_유가.php → ConfucianNationType.ts
- [ ] che_종횡가.php → DiplomatNationType.ts
- [ ] che_오두미도.php → FivePecksNationType.ts
- [ ] che_태평도.php → YellowTurbansNationType.ts
- [ ] che_중립.php → NeutralNationType.ts

## 각 성향별 효과 분석 필요
1. 장수 능력치 보정
2. 내정 효율 보정
3. 전투력 보정
4. 특수 기술/커맨드 해금
5. 외교 관계 영향

## 포팅 규칙
1. `NationType` 인터페이스 정의
2. 장단점 (pros/cons) 명시
3. 수치 보정 정확히 포팅
4. 특수 효과 및 제한사항 구현

## 파일 구조
```typescript
// packages/logic/src/domain/nation-types/types.ts
export interface NationType {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly pros: string[];
  readonly cons: string[];

  // 장수 능력치 보정
  modifyLeadership?(base: number): number;
  modifyStrength?(base: number): number;
  modifyIntelligence?(base: number): number;

  // 내정 효율 보정
  modifyDevelopment?(type: string, base: number): number;

  // 전투력 보정
  modifyAttackPower?(base: number): number;
  modifyDefensePower?(base: number): number;

  // 외교 영향
  getDiplomacyModifier?(targetNationType: string): number;
}
```

## 레거시 코드 분석 예시
```php
// che_병가.php 예시 분석
class che_병가 extends BaseNation {
    static $pros = ['전투력 +10%', '훈련 효율 +20%'];
    static $cons = ['내정 효율 -10%'];

    public function onCalcDomestic($type, $phase, $value) {
        if ($phase === 'score') {
            return $value * 0.9; // 내정 효율 -10%
        }
        return $value;
    }
}
```
