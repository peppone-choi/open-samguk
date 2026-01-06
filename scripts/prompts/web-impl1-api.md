# Web 구현 1: REST API 엔드포인트

## 프로젝트 컨텍스트
```
프로젝트: open-samguk (삼국지 모의전투 포팅)
스택: NestJS + TypeORM + PostgreSQL
경로: apps/api/src/
```

## 참고 문서
먼저 이 파일들을 읽어주세요:
- `docs/architecture/api-endpoints.md` - API 목록
- `docs/architecture/overview.md` - 아키텍처 개요
- `CLAUDE.md` - 코딩 규칙

## 구현 작업

### 1. General API 모듈 구현
```typescript
// apps/api/src/general/general.module.ts
// apps/api/src/general/general.controller.ts
// apps/api/src/general/general.service.ts
```

엔드포인트:
- GET /api/general/:id - 장수 정보 조회
- GET /api/general/:id/log - 장수 로그 조회
- POST /api/general/join - 장수 가입
- POST /api/general/command - 커맨드 예약

### 2. Nation API 모듈 구현
```typescript
// apps/api/src/nation/nation.module.ts
// apps/api/src/nation/nation.controller.ts
// apps/api/src/nation/nation.service.ts
```

### 3. 코드 작성 규칙
- TypeScript Strict Mode
- 4 spaces 들여쓰기
- zod로 입력 검증
- 명시적 타입 선언
- 한글 주석 허용

### 4. 검증
각 파일 작성 후:
```bash
pnpm typecheck
pnpm test
```

## 출력 형식
파일 경로와 전체 코드를 제공해주세요:
```typescript
// 파일: apps/api/src/general/general.controller.ts
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
// ... 전체 코드
```
