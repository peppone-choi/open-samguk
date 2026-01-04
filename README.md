# Open Samguk 포팅 문서

이 저장소는 레거시 삼국지 모의전투 서버를 NestJS 백엔드와 Next.js 프론트엔드로 포팅하기 위한 계획과 문서를 포함합니다. 문서는 도메인 엔티티와 상호작용을 중심으로 작성되며, 변형된 CQRS와 메모리 기반 상태 관리 원칙을 반영합니다.

## 범위

- 레거시 소스: `legacy/`
- 목표 스택: NestJS (백엔드), Next.js (프론트엔드)
- 영속성 DB: Postgres
- 실시간: WebSocket + SSE

## 핵심 원칙

- 소스 오브 트루스는 백엔드 메모리 상태
- DB는 영속성 보장만 담당 (스냅샷/저널)
- 시작 시 DB에서 적재, 종료 시 메모리 상태를 DB로 저장
- 커맨드와 쿼리를 분리하되, 읽기/쓰기는 메모리 상태를 기준으로 처리

## 문서

- 개요: `docs/architecture/overview.md`
- 런타임: `docs/architecture/runtime.md`
- 레거시 엔티티: `docs/architecture/legacy-entities.md`
- 레거시 엔진 맵: `docs/architecture/legacy-engine.md`
- 엔티티 상호작용: `docs/architecture/entity-interactions.md`
- 포팅 계획: `docs/architecture/rewrite-plan.md`
- 제약 계약: `docs/architecture/rewrite-constraints.md`
- 턴 데몬 수명주기: `docs/architecture/turn-daemon-lifecycle.md`
- 영속성 스키마: `docs/architecture/persistence-schema.md`
- 테스트 정책: `docs/testing-policy.md`
- TODO: `docs/architecture/todo.md`

전체 문서 목록은 `docs/architecture/overview.md`에 정리되어 있습니다.

## 참고

- 레거시 스키마: `legacy/hwe/sql/schema.sql`, `legacy/f_install/sql/common_schema.sql`
