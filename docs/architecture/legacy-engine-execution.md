# 레거시 턴 실행 파이프라인

턴 실행의 주요 단계와 포팅 기준을 상세히 정리합니다.

## 레거시 위치

- `legacy/hwe/sammo/TurnExecutionHelper.php`
- `legacy/hwe/proc.php`
- `legacy/hwe/sammo/LastTurn.php`

## 실행 개요

`TurnExecutionHelper::executeAllCommand()`가 전체 턴 루프를 제어합니다.

핵심 단계:

1. 턴 시간 도달 여부 확인
2. 전역 락 획득 (`plock`)
3. 온라인/트래픽 갱신
4. 월간 턴 처리
5. 분 단위 턴 처리
6. 토너먼트/경매 처리
7. 락 해제

## 장수 턴 처리 흐름 (상세)

`executeGeneralCommandUntil()` 기준:

- `general` 목록을 `turntime` 순으로 처리
- `preprocessCommand()`
  - 부상 경감, 병력/군량 소모 트리거 실행
- `processBlocked()`
  - `block` 상태에 따라 `killturn` 감소 및 로그 기록
- 국가 커맨드 처리
  - `nation_turn` 로드
  - 제약/쿨다운 검사 -> 실행 -> 결과 저장
- 장수 커맨드 처리
  - `general_turn` 로드
  - 제약/쿨다운 검사 -> 실행 -> 대체 커맨드 처리
- AI 적용
  - NPC/자동화 대상일 경우 `GeneralAI`가 커맨드 선택
- `updateTurnTime()`
  - `killturn` 0 처리 (NPC 전환 또는 삭제)
  - 은퇴 처리
  - 다음 턴 시간 계산

## killturn 갱신 규칙 (요약)

- NPC 또는 자동 실행 시 `killturn` 감소
- 휴식 커맨드는 `killturn` 감소
- 일반 실행 시 `killturn`을 기본값으로 리셋

## RNG 시드 규칙

- `preprocess`, `nationCommand`, `generalCommand` 각각 별도 시드
- 구성: hiddenSeed + year + month + generalId + commandName

## 월간 처리 흐름

- `runEventHandler(EventTarget::PreMonth)`
- `preUpdateMonthly()`
- `turnDate()`
- `checkStatistic()`
- `runEventHandler(EventTarget::Month)`
- `postUpdateMonthly()`

## 락/동시성

- 레거시는 `plock` 테이블로 동시 실행을 차단
- 포팅에서는 데몬 단일 실행을 전제로 락을 단순화

## 포팅 포인트

- 메모리 상태 기준으로 순차 처리
- 체크포인트로 부분 실행 지원
- 월간 처리 순서 고정
- 결과는 로그/히스토리로 기록
