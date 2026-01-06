# 레거시 경제 시스템

월간 경제 업데이트와 자원 흐름을 정리합니다. 포팅 시 월간 처리 순서와 결과 기록을 동일하게 유지해야 합니다.

## 레거시 위치

- `legacy/hwe/func_gamerule.php`
- `legacy/hwe/sammo/Event/Action/*`

## 월간 처리 순서 (레거시)

1. `preUpdateMonthly()`
2. `turnDate()`로 연/월 갱신
3. `checkStatistic()` (연간/월간 통계)
4. `EventTarget::Month` 이벤트 실행
5. `postUpdateMonthly()`

## preUpdateMonthly 세부 작업

- 연감 로그 기록 (`LogHistory()`)
- 접속률/벌점 감소
- `general.makelimit` 감소
- `nation.strategic_cmd_limit`, `nation.surlimit` 감소
- 세율 동기화 (`rate_tmp = rate`)
- 개발비(`develcost`) 갱신
- 도시 상태/전쟁 표시 정리 (`city.state`, `term`, `conflict`)
- 첩보 기간 감소 (`nation.spy`)

## postUpdateMonthly 세부 작업 (요약)

- 국가 국력(`power`) 계산 및 갱신
- 외교 전쟁 기한(`term`) 갱신
- 개전/종전 로그 기록
- 외교 상태 전이 (불가침 종료, 선포 -> 교전)
- 전쟁 설정 가능 횟수 갱신
- 방랑군 자동 해체
- 장수 수 갱신 (`updateGeneralNumber()`)
- 천하통일 검사
- 토너먼트 트리거
- 경매 등록
- 전선 설정

## 포팅 포인트

- 월간 처리 순서 고정
- 결정론 RNG 사용
- 월간 처리 결과는 로그/통계 테이블에 기록
- 메모리 상태 기준으로 갱신 후 영속화
