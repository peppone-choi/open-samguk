# 핸드오프 문서 - 삼국지 모의전투 HiDCHe TypeScript 포팅

## 프로젝트 개요

**삼국지 모의전투 HiDCHe** 레거시 PHP 게임 엔진을 TypeScript로 포팅하는 프로젝트입니다.

- **프로젝트 경로**: `/Users/apple/Desktop/open-samguk/`
- **레거시 코드**: `legacy/` 디렉토리
- **새 코드**: `packages/`, `apps/` 디렉토리

---

## 완료된 작업

### Phase 0: 모노레포 기반 (완료)

| 항목                 | 상태 | 위치                     |
| -------------------- | ---- | ------------------------ |
| pnpm workspace       | ✅   | `pnpm-workspace.yaml`    |
| TypeScript 설정      | ✅   | `tsconfig.base.json`     |
| ESLint (flat config) | ✅   | `eslint.config.mjs`      |
| Prettier             | ✅   | `.prettierrc`            |
| Vitest               | ✅   | `vitest.config.ts`       |
| 빌드 도구 (tsdown)   | ✅   | 각 패키지 `package.json` |

### Phase 1: 핵심 유틸리티 포팅 (완료)

| 항목                              | 상태 | 위치                                      |
| --------------------------------- | ---- | ----------------------------------------- |
| LiteHashDRBG (SHA-512 결정론 RNG) | ✅   | `packages/common/src/rng/LiteHashDRBG.ts` |
| RandUtil (가중치 선택, 셔플)      | ✅   | `packages/common/src/rng/RandUtil.ts`     |
| JosaUtil (한글 조사 처리)         | ✅   | `packages/common/src/josa/JosaUtil.ts`    |
| RNG 테스트 (35개)                 | ✅   | `packages/common/__tests__/rng.test.ts`   |

**버그 수정**: JavaScript 32비트 비트연산 한계로 인한 `1 << 53` 오버플로우 → `2 ** 53` 수정

### Phase 2: 엔티티 타입 정의 (완료)

| 엔티티                 | 파일                                        |
| ---------------------- | ------------------------------------------- |
| General (장수)         | `packages/logic/src/entities/General.ts`    |
| Nation (국가)          | `packages/logic/src/entities/Nation.ts`     |
| City (도시)            | `packages/logic/src/entities/City.ts`       |
| Troop (부대)           | `packages/logic/src/entities/Troop.ts`      |
| Diplomacy (외교)       | `packages/logic/src/entities/Diplomacy.ts`  |
| WorldState (월드 상태) | `packages/logic/src/entities/WorldState.ts` |
| Enums                  | `packages/logic/src/entities/enums.ts`      |

### Phase 3: DB 연동 기반 (진행중)

| 항목                 | 상태 | 위치                                  |
| -------------------- | ---- | ------------------------------------- |
| Prisma 스키마        | ✅   | `packages/infra/prisma/schema.prisma` |
| DB↔Memory 변환 함수  | ✅   | `packages/logic/src/converters/`      |
| 기본 액션 인터페이스 | ⏳   | 미구현                                |

---

## 프로젝트 구조

```
/Users/apple/Desktop/open-samguk/
├── package.json                    # 루트 (pnpm workspace)
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── eslint.config.mjs
├── vitest.config.ts
├── .prettierrc
│
├── packages/
│   ├── common/                     # @sammo/common - 공용 유틸리티
│   │   └── src/
│   │       ├── rng/               # RNG (LiteHashDRBG, RandUtil)
│   │       ├── josa/              # 한글 조사 처리
│   │       ├── string/            # 문자열 유틸
│   │       └── types/             # 공용 타입
│   │
│   ├── infra/                      # @sammo/infra - 인프라
│   │   ├── prisma/
│   │   │   └── schema.prisma      # Prisma 스키마 (PostgreSQL)
│   │   └── src/
│   │       ├── prisma/            # Prisma 클라이언트
│   │       ├── redis/             # Redis 클라이언트
│   │       └── env/               # 환경 검증
│   │
│   └── logic/                      # @sammo/logic - 게임 로직
│       └── src/
│           ├── entities/          # 도메인 엔티티 타입
│           └── converters/        # DB↔Memory 변환
│
├── apps/
│   ├── api/                        # @sammo/api - NestJS API 서버
│   ├── engine/                     # @sammo/engine - Turn Daemon
│   └── web/                        # @sammo/web - Next.js 프론트엔드
│
├── docs/
│   ├── architecture/              # 아키텍처 문서
│   ├── domain-entities.md         # 도메인 엔티티 목록
│   └── handoff.md                 # 이 문서
│
└── legacy/                         # 레거시 PHP 코드
    ├── hwe/
    │   ├── sammo/                 # PHP 게임 로직
    │   ├── sql/schema.sql         # 레거시 스키마
    │   └── ts/                    # 레거시 TypeScript
    └── src/sammo/                 # PHP 유틸리티
```

---

## 핵심 아키텍처 결정

### 1. In-Memory State = Source of Truth

게임 상태는 메모리에서 관리하고, DB는 영속화 용도로만 사용:

```typescript
interface WorldState {
  env: GameEnv;
  generals: Map<GeneralId, General>;
  nations: Map<NationId, Nation>;
  cities: Map<CityId, City>;
  troops: Map<GeneralId, Troop>;
  diplomacy: Map<string, Diplomacy>;
}
```

### 2. 결정론적 RNG

`LiteHashDRBG`는 SHA-512 기반 결정론적 난수 생성기:

```typescript
const rng = new LiteHashDRBG("seed", stateIdx, bufferIdx);
const value = rng.nextInt(100); // 0~100 정수
const float = rng.nextFloat1(); // 0.0~1.0 실수
```

동일 시드와 상태로 생성하면 항상 같은 시퀀스 생성 (PHP/Python과 호환).

### 3. 엔티티 구조화

레거시 플랫 구조를 논리적 서브타입으로 그룹화:

```typescript
interface General {
  no: GeneralId;
  name: string;
  // 그룹화된 서브타입
  stats: GeneralStats; // leadership, strength, intel
  resources: GeneralResources; // gold, rice
  military: GeneralMilitary; // crew, train, atmos
  equipment: GeneralEquipment; // weapon, book, horse, item
  trait: GeneralTrait; // personal, special
  // ...
}
```

### 4. DB↔Memory 변환

Prisma 모델과 인메모리 엔티티 간 변환:

```typescript
// DB → Memory
const general = dbToGeneral(prismaGeneral);

// Memory → DB (전체)
const prismaData = generalToDb(general);

// Memory → DB (부분 업데이트)
const updateData = generalToDbUpdate({ resources: { gold: 500 } });
```

---

## 다음 작업 (우선순위 순)

### 즉시 필요

1. **Prisma 마이그레이션 실행**

   ```bash
   cd packages/infra
   npx prisma migrate dev --name init
   ```

2. **기본 액션 인터페이스 정의**

   ```typescript
   // packages/logic/src/actions/Action.ts
   interface Action {
     type: string;
     execute(state: WorldState, rng: RNG): ActionResult;
   }
   ```

3. **WorldState 로더/세이버 구현**
   - DB에서 전체 상태 로드
   - 메모리 상태를 DB에 저장
   - Snapshot/Journal 패턴

### 중기 작업

4. **Turn Daemon 구현** (`apps/engine/`)
   - 턴 루프
   - 액션 실행
   - 상태 영속화

5. **API 엔드포인트** (`apps/api/`)
   - tRPC 라우터
   - 인증/인가
   - WebSocket (실시간 업데이트)

6. **프론트엔드** (`apps/web/`)
   - 게임 UI
   - 실시간 상태 동기화

### 장기 작업

7. **레거시 커맨드 포팅**
   - `legacy/hwe/sammo/Command/` 참조
   - 각 커맨드를 Action으로 변환

8. **전투 시스템**
   - `legacy/hwe/sammo/Engine/` 참조
   - 병종, 특기, 아이템 효과

9. **AI 시스템**
   - NPC 행동 결정
   - 국가 AI

---

## 주요 레거시 참조 파일

| 기능      | 레거시 위치                                       |
| --------- | ------------------------------------------------- |
| 장수 로직 | `legacy/hwe/sammo/General.php`, `GeneralBase.php` |
| 국가 로직 | `legacy/hwe/sammo/Nation.php`                     |
| 도시 로직 | `legacy/hwe/sammo/City.php`                       |
| 커맨드    | `legacy/hwe/sammo/Command/*.php`                  |
| 전투      | `legacy/hwe/sammo/Engine/war*.php`                |
| DB 스키마 | `legacy/hwe/sql/schema.sql`                       |
| 상수/설정 | `legacy/hwe/sammo/Const*.php`                     |
| RNG       | `legacy/src/sammo/LiteHashDRBG.php`               |

---

## 명령어 참조

```bash
# 의존성 설치
pnpm install

# 전체 빌드
pnpm -r build

# 테스트 실행
pnpm test

# 개발 서버
pnpm dev:api    # API 서버
pnpm dev:web    # 프론트엔드

# Prisma
pnpm db:generate  # 클라이언트 생성
pnpm db:migrate   # 마이그레이션
pnpm db:push      # 스키마 푸시
```

---

## 제약 사항

1. **타입 안전성**: `as any`, `@ts-ignore` 사용 금지
2. **결정론**: 모든 랜덤은 `LiteHashDRBG`/`RandUtil` 사용
3. **한국어**: 모든 주석/로그는 한국어
4. **불필요한 주석 금지**: 코드로 설명 가능하면 주석 제거
5. **테스트 필수**: 핵심 로직에는 테스트 작성

---

## 환경 변수

```env
# packages/infra/.env
DATABASE_URL="postgresql://user:password@localhost:5432/sammo"
REDIS_URL="redis://localhost:6379"
```

---

## 문의

- 아키텍처: `docs/architecture/` 참조
- 레거시 분석: `docs/legacy-*.md` 참조
- 엔티티 관계: `docs/domain-entities.md` 참조

---

_마지막 업데이트: 2026-01-06_
