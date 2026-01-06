# 레거시 전투 파이프라인

전투 처리 흐름과 구성 요소를 정리합니다. 포팅 시 전투 입력 스냅샷과 RNG 시드를 명확히 관리해야 합니다.

## 레거시 위치

- `legacy/hwe/sammo/WarUnit.php`
- `legacy/hwe/sammo/WarUnitGeneral.php`
- `legacy/hwe/sammo/WarUnitCity.php`
- `legacy/hwe/process_war.php`

## 처리 흐름 (상세)

1. `warSeed`로 RNG 생성
2. 공격자 `WarUnitGeneral` 생성
3. 수비 장수 목록 구성 -> `WarUnitGeneral` 생성
4. 도시 `WarUnitCity` 포함 여부 결정
5. `extractBattleOrder()`로 수비 순서 정렬
6. `processWar_NG()`로 전투 진행
7. 결과 후처리 (도시 사망자, 기술, 외교 사상자)
8. 점령 시 `ConquerCity()` 호출

## 전투 후처리 (레거시)

- `city.dead` 증가 (공격/수비 비율 분리)
- `nation.tech` 증가
- `diplomacy.dead` 누적
- 점령 시 도시/국가 상태 변경

## 포팅 포인트

- 전투는 턴 처리 파이프라인에 통합
- 입력 스냅샷과 RNG 시드를 기록
- 전투 결과는 재현 가능해야 함
