# 레거시 시나리오

시나리오 데이터 구조와 로딩 흐름을 정리합니다.

## 레거시 위치

- `legacy/hwe/sammo/Scenario.php`
- `legacy/hwe/sammo/Scenario/*`
- `legacy/hwe/scenario/*.json`
- `legacy/hwe/scenario/map/`
- `legacy/hwe/scenario/unit/`

## 구성 요소

- 지도 정보 및 도시 배치
- 초기 국가/장수 구성
- 시나리오별 규칙/상수 오버라이드

## 로딩 흐름

1. 시나리오 JSON 로드
2. 지도/유닛 데이터 병합
3. 초기 상태를 메모리에 구성

## 포팅 포인트

- 프로필은 서버+시나리오로 구성
- 시나리오 로더는 메모리 상태 초기화에 사용
- 시나리오 변경은 새로운 프로필로 취급
