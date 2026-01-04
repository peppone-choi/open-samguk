# 레거시 로그/기록

로그/기록 구조와 포팅 기준을 정리합니다. 로그는 append-only이며 실시간 스트림과 연결됩니다.

## 레거시 위치

- `legacy/hwe/sammo/ActionLogger.php`
- `legacy/hwe/sammo/UserLogger.php`

## 관련 테이블

- `general_record` (`log_type`: action, battle_brief, battle, history)
- `world_history`
- `user_record`
- `member_log`
- `api_log`, `err_log`

## 로그 흐름

- 커맨드 실행 시 `ActionLogger`로 기록
- 전역 이벤트는 `world_history`에 기록
- 유저 활동은 `user_record`와 `member_log`에 기록

## 포팅 포인트

- 로그는 append-only로 유지
- 메모리 상태 변경 후 비동기 영속화
- 실시간 스트림과 연결하여 UI 갱신
