# 레거시 아이템/특기 시스템

아이템, 특기, 성격, 시나리오 효과 구조를 정리합니다.

## 레거시 위치

- `legacy/hwe/sammo/ActionItem/*`
- `legacy/hwe/sammo/ActionSpecialDomestic/*`
- `legacy/hwe/sammo/ActionSpecialWar/*`
- `legacy/hwe/sammo/ActionPersonality/*`
- `legacy/hwe/sammo/ActionScenarioEffect/*`
- `legacy/hwe/sammo/BaseItem.php`
- `legacy/hwe/sammo/BaseSpecial.php`
- `legacy/hwe/sammo/iAction.php`

## iAction 인터페이스 (핵심)

- `getPreTurnExecuteTriggerList()`
- `onCalcDomestic()`, `onCalcStat()`, `onCalcOpposeStat()`
- `getWarPowerMultiplier()`
- `getBattleInitSkillTriggerList()`, `getBattlePhaseSkillTriggerList()`

## 적용 방식

- 장수의 `getActionList()`가 적용 가능한 액션을 수집
- 전투/내정 단계에서 트리거가 호출
- 특기/아이템 효과가 순차적으로 적용됨

## 포팅 포인트

- 액션 목록 생성 규칙을 명확히 유지
- 효과 적용 순서와 중첩 규칙 명시
- 결정론 RNG 적용
- 전투/내정 파이프라인에 동일한 훅 유지
