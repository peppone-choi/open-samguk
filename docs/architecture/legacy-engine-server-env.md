# 레거시 서버 환경

서버 환경 값과 설정 로딩 흐름을 정리합니다.

## 레거시 위치

- `legacy/hwe/sammo/ServerDefaultEnv.php`
- `legacy/hwe/sammo/ServerEnv.php`
- `legacy/hwe/sammo/ServerTool.php`

## 환경 저장소

- `game_env`: 전역 환경값 (KVStorage)
- `nation_env`: 국가별 환경값 (KVStorage)
- `storage`: 전역 KV (기타)

## 대표 환경 키(관찰 기준)

- `turnterm`, `turntime`
- `year`, `month`, `startyear`
- `scenario`, `join_mode`
- `autorun_user`
- `isunited`
- `killturn`
- `develcost`

## 포팅 포인트

- 시작 시 환경 로드 후 메모리에 고정
- 관리자 변경은 스냅샷/저널에 반영
- 환경 변경 이력 로그 필요
