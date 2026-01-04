# 레거시 도시 엔진

도시 상태와 관련 로직을 정리합니다. 포팅 시 도시 상태를 메모리에 상주시키고 인덱스를 유지해야 합니다.

## 레거시 위치

- `legacy/hwe/sammo/CityConstBase.php`
- `legacy/hwe/sammo/CityInitialDetail.php`
- `legacy/hwe/sammo/CityHelper.php`
- `legacy/hwe/sammo/WarUnitCity.php`

## 주요 상태

- 인구/경제: `pop`, `agri`, `comm`, `secu`, `trade`
- 방어: `def`, `wall`
- 위치/소속: `nation`, `front`, `state`, `region`, `term`
- 전쟁: `conflict` (JSON)

## 파생 인덱스

- 국가별 도시 목록
- 전선 도시 목록 (`front = 1`)
- 공급 도시 목록 (`supply = 1`)

## 상호작용

- 월간 경제 업데이트
- 점령/전투 처리
- 국가/도시 레벨 업데이트

## 포팅 포인트

- 도시는 메모리 상주 필수 엔티티
- `conflict` JSON 필드는 직렬화 규칙 고정
- 전투 결과로 도시 상태가 변할 때 인덱스를 즉시 갱신
