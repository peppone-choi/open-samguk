# 레거시 유산 포인트

유산(계승) 포인트 시스템과 저장 구조를 정리합니다.

## 레거시 위치

- `legacy/hwe/sammo/InheritancePointManager.php`
- `legacy/hwe/sammo/Enums/InheritanceKey.php`

## 관련 테이블

- `inheritance_result`
- `storage` (inheritance namespace)

## 구조

- `InheritanceKey`에 대한 타입/계수 정의
- `storeType`이 `true`이면 KVStorage 기반 저장
- `storeType`이 `false`이면 계산형 지표
- 특정 키는 `rank`, `raw`, `aux` 참조

## 포팅 포인트

- 포인트 계산은 결정론적으로 유지
- 계정 단위 저장소(`inheritance_{owner}`) 유지
- 스냅샷/저널에 포함하여 복구 가능하게 유지
