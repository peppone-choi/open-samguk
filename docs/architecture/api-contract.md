# API 요청/응답 스키마

이 문서는 레거시 API의 공통 요청/응답 규칙을 표준화합니다. 신규 구현은 이 규칙을 기본 계약으로 사용합니다.

## 공통 요청 규칙

레거시:
- 엔드포인트는 `api.php` 한 곳이며, 라우팅은 `path` 쿼리로 결정됨.
  - 예: `api.php?path=Global/GetMap`
- GET 요청은 쿼리 파라미터로 인자를 전달.
- POST/PUT/PATCH 요청은 JSON 바디로 인자를 전달.
- 경로 파라미터는 `StrVar`/`NumVar`로 확장되며 쿼리에 병합됨.

REST(신규):
- 기본 경로는 `/api/v1`.
- 리소스 경로로 라우팅하며, 인자는 JSON 바디/쿼리로 전달.
- 응답 포맷은 레거시와 동일한 `result` 래퍼를 유지한다.

요청 예시:

```http
GET /api.php?path=Global/GetMap&neutralView=1
POST /api.php?path=Command/ReserveCommand
Content-Type: application/json
{"turnList":[0,1],"action":"che_휴식","arg":{"type":"rest"}}
```

## 공통 응답 스키마

모든 응답은 아래 형태를 따른다.

```ts
type ValidResponse = {
  result: true;
};

type InvalidResponse = {
  result: false;
  reason: string;
  recovery?: "login" | "2fa" | "gateway" | "game_login" | "game_quota";
  recovery_arg?: string | number;
};
```

성공 응답은 `ValidResponse`에 데이터 필드를 추가한다.

```ts
type GetMapResponse = ValidResponse & {
  cityList: City[];
  version: number;
};
```

## 표준화 규칙

- `result`는 반드시 포함한다.
- 실패 시 `reason`은 사용자 메시지로 노출 가능한 문자열로 통일한다.
- 인증/세션 문제는 `recovery`로 복구 플로우를 지시한다.
- 신규 API는 레거시와 동일한 포맷을 유지하고, 필요 시 추가 메타 필드는 확장형으로 정의한다.
