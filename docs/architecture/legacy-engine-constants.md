# 레거시 상수/규칙

게임 상수와 환경값을 정리합니다. 포팅 시 서버 시작 단계에서 상수를 로드하고 메모리에 고정합니다.

## 레거시 위치

- `legacy/hwe/sammo/GameConstBase.php`
- `legacy/hwe/sammo/GameUnitConstBase.php`
- `legacy/hwe/sammo/GameUnitDetail.php`
- `legacy/hwe/sammo/ServerDefaultEnv.php`
- `legacy/hwe/sammo/ServerEnv.php`

## 범주

- 턴/시간: `turnterm`, `startyear`, `year`, `month`
- 경제 규칙: 세율, 생산량, 상한치
- 전투 규칙: 병종 상성, 전투 계수
- 아이템/특기 규칙
- 유닛/무기 상수

## 환경값 저장소

- `game_env` (KVStorage)
- `nation_env` (국가별 KVStorage)
- `storage` (전역 KVStorage)

## 포팅 포인트

- 상수는 스냅샷에 포함하여 복구 일관성 확보
- 시나리오별 오버라이드 지원
- 상수 변경은 감사 로그 남김
