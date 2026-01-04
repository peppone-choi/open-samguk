# 마이그레이션 정책

Phase 1부터 DB 스키마 변경은 TypeORM 마이그레이션으로만 관리한다. 런타임에서 `synchronize`는 사용하지 않는다.

## 원칙

- 모든 스키마 변경은 마이그레이션 파일로 버전 관리
- 개발/운영 환경 모두 동일한 마이그레이션 경로 사용
- 스키마는 `gateway`(계정/세션), `game`(스냅샷/저널)로 분리

## 실행 방법

`apps/api` 기준:

- `npm run db:migrate` 마이그레이션 적용
- `npm run db:revert` 마지막 마이그레이션 롤백
- 새 마이그레이션 생성 예시:
  - `npm run typeorm -- migration:create src/migrations/0001-gateway-init`
  - `npm run typeorm -- migration:generate src/migrations/0001-gateway-init`

## 데이터 소스

- CLI 엔트리: `apps/api/src/data-source.ts`
- 환경 변수: `apps/api/.env.example`
