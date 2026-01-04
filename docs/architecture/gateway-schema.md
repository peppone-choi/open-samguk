# Gateway 스키마 (Phase 1)

이 문서는 인증/세션을 위한 `gateway` 스키마의 테이블 구조를 정의합니다. 레거시 스키마(`legacy/f_install/sql/common_schema.sql`)를 기준으로 Postgres에 맞게 정리했습니다.

## system

- 서비스 상태 플래그
- 컬럼: `id`, `register_open`, `login_open`, `notice`, `created_at`, `updated_at`

## member

- 계정/권한/프로필
- 컬럼: `id`, `oauth_id`, `username`, `email`, `oauth_type`, `oauth_info`, `token_valid_until`
- 보안: `password_hash`, `salt`
- 메타: `third_use`, `name`, `picture`, `image_server`, `acl`, `penalty`
- 상태: `grade`, `reg_num`, `reg_date`, `block_num`, `block_date`, `delete_after`
- `oauth_type`는 enum(`NONE`, `KAKAO`)

## member_log

- 계정 활동 로그
- 컬럼: `id`, `member_id`, `date`, `action_type`, `action`
- `action_type`는 enum(`reg`, `try_login`, `login`, `logout`, `oauth`, `change_pw`, `make_general`, `access_server`, `delete`)

## login_token

- 자동 로그인/세션 토큰
- 컬럼: `id`, `member_id`, `base_token`, `reg_ip`, `reg_date`, `expire_date`
- `base_token`은 리프레시 토큰 해시 저장을 기본으로 한다.

## banned_member

- 차단 이메일 목록
- 컬럼: `id`, `hashed_email`, `info`

## 참고

- 실제 모델 정의는 TypeORM 엔티티로 관리: `apps/api/src/gateway/entities/*`
- 토큰 포맷과 인증 정책은 `docs/architecture/rest-api.md`에 정의한다.
