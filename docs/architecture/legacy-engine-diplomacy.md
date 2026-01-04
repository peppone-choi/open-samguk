# 레거시 외교/메시지

외교와 메시지 시스템의 구조를 정리합니다. 외교는 메시지 기반 제안/수락 흐름을 거쳐 국가 커맨드로 상태를 전이합니다.

## 레거시 위치

- `legacy/hwe/sammo/DiplomaticMessage.php`
- `legacy/hwe/sammo/Message.php`
- `legacy/hwe/sammo/MessageTarget.php`

## 관련 테이블

- `diplomacy`
- `ng_diplomacy`
- `message`

## 외교 메시지 타입

- `noAggression` (불가침)
- `cancelNA` (불가침 파기)
- `stopWar` (종전)

## 수락 처리 흐름 (레거시)

1) 메시지 유효성 검사
2) 외교권자 여부 확인
3) `buildNationCommandClass()`로 수락 커맨드 구성
4) 조건 검사(`hasFullConditionMet`) 후 실행
5) 메시지 `used` 플래그 처리 및 알림 발송

## 포팅 포인트

- 외교 수락은 커맨드 실행으로 처리
- 메시지 만료/사용 여부 추적
- 외교 이벤트는 WS로 알림
