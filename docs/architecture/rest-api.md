# REST API 설계 (Phase 1)

이 문서는 Phase 1에서 필요한 REST API의 범위와 기본 계약을 정리합니다. 응답 래퍼는 `docs/architecture/api-contract.md`를 따른다.

## 기본 규칙

- 기본 경로: `/api/v1`
- 응답 래퍼: `{ result: true | false, ... }`
- 인증 필요 API는 `Authorization: Bearer <token>` 헤더 사용(토큰 포맷은 Phase 1에서 결정).

## 인증/세션

- `POST /api/v1/auth/login`
  - 입력: `{ username, password }`
  - 출력: `{ result, memberId, accessToken, refreshToken, expiresAt }`
- `POST /api/v1/auth/refresh`
  - 입력: `{ refreshToken }`
  - 출력: `{ result, accessToken, refreshToken, expiresAt }`
- `POST /api/v1/auth/logout`
  - 입력: `{ refreshToken }`
  - 출력: `{ result }`
- `GET /api/v1/session`
  - 출력: `{ result, memberId, name, roles, serverAccess }`

토큰 정책(Phase 1):

- 액세스 토큰은 짧은 만료의 JWT(예: 15분)로 발급한다.
- 리프레시 토큰은 `login_token`에 저장하며, 원문 대신 해시를 저장한다.
- 로그인/로그아웃 시 `member_log`에 action 기록.

## 시스템 플래그

- `GET /api/v1/system`
  - 출력: `{ result, registerOpen, loginOpen, notice }`

## 로깅(서버 내부)

- API 요청/에러 로깅은 서버 내부 미들웨어/인터셉터로 처리한다.
- 외부로 노출되는 로그 기록 API는 Phase 1 범위에서 제외한다.

## 상태 점검

- `GET /api/v1/health`
  - 출력: `{ result, status }`
