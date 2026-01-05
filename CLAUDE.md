# Project Context for Claude Code

## 1. Commands (명령어)
```bash
# 개발 서버
pnpm dev:api          # NestJS 백엔드 (http://localhost:3000)
pnpm dev:web          # Next.js 프론트엔드 (http://localhost:3001)
pnpm dev:engine       # 게임 턴 데몬

# 빌드 & 테스트
pnpm build            # 전체 빌드
pnpm lint             # 전체 린트
pnpm test             # 전체 테스트
pnpm typecheck        # 타입 체크

# DB & 인프라
pnpm db:migrate       # TypeORM 마이그레이션
pnpm docker:up        # Docker (Postgres, Redis) 시작
pnpm docker:down      # Docker 종료

# 레거시 (참조용)
npm --prefix legacy run build    # 레거시 빌드
npm --prefix legacy run test     # 레거시 테스트
```

## 2. Architecture (아키텍처 & 구조)
- **Backend**: NestJS (REST API + TypeORM)
- **Frontend**: Next.js 15 (App Router + Tailwind + shadcn/ui)
- **Engine**: Node.js 턴 데몬 (게임 틱 처리)
- **Database**: PostgreSQL (Supabase/Docker)
- **Cache/Pub-Sub**: Redis Stream
- **Package Manager**: pnpm (workspace monorepo)

### 디렉토리 구조
```
apps/
  api/        # NestJS 백엔드
  web/        # Next.js 프론트엔드
  engine/     # 게임 턴 데몬
packages/
  common/     # 공유 유틸리티 (RNG, bytes, types)
  infra/      # DB/Redis 커넥터
  logic/      # 순수 게임 로직 (DI 기반)
legacy/       # 마이그레이션 대상 (참조용, 수정 금지)
docs/         # 아키텍처 문서
```

## 3. Workflow Rules (작업 규칙)

### Commit Style
- **Conventional Commits**: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`
- 명령형 영어: "Add feature" (O), "Added feature" (X)
- 예: `feat: add battle calculation module`

### Code Style
- TypeScript **Strict Mode** 필수
- 4 spaces 들여쓰기
- `camelCase` (변수/함수), `PascalCase` (클래스/타입)
- 도메인 용어 한글 허용: `use전투규칙`, `calculate내정효과`
- `any` 금지, `unknown` 최소화
- 공개 API는 명시적 타입 필수

### Error Handling
- 모든 비동기 작업은 try-catch 감싸기
- 에러 로깅 필수 (추후 Sentry 연동)

## 4. Past Mistakes (오답 노트)
> 클로드가 자주 틀리는 내용을 여기에 추가하세요

- [ ] `legacy/` 파일 직접 수정하지 말 것 (참조용)
- [ ] `any` 타입 사용 금지
- [ ] 테스트 없이 게임 로직 변경 금지
- [ ] `Math.random()` 사용 금지 → `LiteHashDRBG` 또는 `RNG` 사용
- [ ] moment.js 대신 **dayjs** 사용
- [ ] lodash 전체 import 금지 → 개별 import (`lodash/get`)

## 5. Verification (자가 검증)
작업 완료 전 반드시 확인:
```bash
pnpm typecheck && pnpm lint && pnpm test
```

실패 시 수정 후 재실행. **성공할 때까지 반복**.

## 6. Key Files (핵심 파일)
- 아키텍처 개요: `docs/architecture/overview.md`
- 레거시 엔진 맵: `docs/architecture/legacy-engine.md`
- 포팅 계획: `docs/architecture/rewrite-plan.md`
- 테스트 정책: `docs/testing-policy.md`
- RNG 구현: `legacy/hwe/ts/util/LiteHashDRBG.ts`, `legacy/hwe/ts/util/RNG.ts`
