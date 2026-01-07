# Claude Code 병렬 실행 가이드

Boris Mode를 활용한 Legacy 포팅 병렬 작업 실행 가이드입니다.

---

## 사전 요구사항

### 1. 필수 설치

```bash
# tmux (터미널 멀티플렉서)
brew install tmux

# Claude Code
npm install -g @anthropic-ai/claude-code

# 프로젝트 의존성
cd ~/Desktop/open-samguk
pnpm install
```

### 2. 설치 확인

```bash
tmux -V          # tmux 3.x
claude --version # Claude Code 버전
pnpm -v          # pnpm 버전
```

---

## 빠른 시작

### 포팅 작업 시작 (권장)

```bash
cd ~/Desktop/open-samguk
./scripts/start-porting.sh
```

### 일반 병렬 작업 시작

```bash
./scripts/boris-mode.sh        # 기본 (터미널 5개 + 웹 5개)
./scripts/boris-mode.sh 3 3    # 커스텀 (터미널 3개 + 웹 3개)
```

---

## 스크립트 상세 설명

### `start-porting.sh` - 포팅 전용 병렬 실행

**기능:**

- 5개 터미널 세션 시작 (porting1~5)
- 5개 웹 세션 열기 (claude.ai)
- 각 세션별 프롬프트 파일 자동 생성

**세션별 작업:**

| 세션     | 작업 내용        | 프롬프트 파일                  |
| -------- | ---------------- | ------------------------------ |
| porting1 | 장수 커맨드 포팅 | `scripts/prompts/session1.txt` |
| porting2 | 국가 커맨드 포팅 | `scripts/prompts/session2.txt` |
| porting3 | 트리거 시스템    | `scripts/prompts/session3.txt` |
| porting4 | 패리티 테스트    | `scripts/prompts/session4.txt` |
| porting5 | 특기 시스템      | `scripts/prompts/session5.txt` |

---

### `boris-mode.sh` - 범용 병렬 실행

**기능:**

- n개 터미널 세션 시작
- n개 웹 세션 열기
- 기존 세션 자동 정리

**사용법:**

```bash
./scripts/boris-mode.sh [터미널수] [웹수]

# 예시
./scripts/boris-mode.sh          # 기본: 5개 + 5개
./scripts/boris-mode.sh 3        # 터미널 3개 + 웹 5개
./scripts/boris-mode.sh 5 10     # 터미널 5개 + 웹 10개
```

---

### `claude-sessions.sh` - 세션 관리 유틸리티

**명령어:**

```bash
./scripts/claude-sessions.sh start [n]    # n개 세션 시작
./scripts/claude-sessions.sh list         # 활성 세션 목록
./scripts/claude-sessions.sh attach [n]   # 세션 n 접속
./scripts/claude-sessions.sh stop [n|all] # 세션 종료
./scripts/claude-sessions.sh web [n]      # 웹 세션 열기
./scripts/claude-sessions.sh status       # 전체 상태
```

---

## 실행 워크플로우

### Step 1: 스크립트 실행

```bash
cd ~/Desktop/open-samguk
./scripts/start-porting.sh
```

출력 예시:

```
╔══════════════════════════════════════════════════════════╗
║       Legacy Porting - Parallel Execution Mode           ║
╚══════════════════════════════════════════════════════════╝

🧹 기존 세션 정리 중...
🚀 포팅 세션 시작...
   ✓ porting1 시작됨
   ✓ porting2 시작됨
   ...
🌐 웹 세션 열기...
```

### Step 2: 세션 접속

```bash
# 첫 번째 세션 접속
tmux attach -t porting1
```

### Step 3: 프롬프트 입력

```bash
# 세션 내에서 프롬프트 확인
cat scripts/prompts/session1.txt

# 또는 직접 복사-붙여넣기
```

**세션 1 프롬프트 예시:**

```
docs/architecture/legacy-commands.md를 참고하여 아직 포팅되지 않은
장수 커맨드를 구현해줘.
packages/logic/src/domain/commands/ 폴더의 기존 패턴을 따라서.
레거시 코드는 legacy/hwe/sammo/Command/General/ 참조.

우선순위:
1. che_맹훈련 (GeneralIntenseTrainingCommand)
2. che_접경귀환 (GeneralBorderReturnCommand)
...
```

### Step 4: 세션 전환

```bash
# 현재 세션에서 나가기 (세션은 계속 실행됨)
Ctrl+B, D

# 다른 세션으로 이동
tmux attach -t porting2

# 또는 세션 선택 화면
tmux attach
# → 화살표로 선택
```

### Step 5: 진행 상황 확인

```bash
# 활성 세션 목록
tmux ls

# 출력 예시:
# porting1: 1 windows (created Mon Jan  5 14:00:00 2026)
# porting2: 1 windows (created Mon Jan  5 14:00:01 2026)
# ...
```

---

## tmux 필수 단축키

| 단축키      | 설명                                             |
| ----------- | ------------------------------------------------ |
| `Ctrl+B, D` | 세션에서 나가기 (Detach)                         |
| `Ctrl+B, [` | 스크롤 모드 (위아래 화살표로 이동, `q`로 나가기) |
| `Ctrl+B, c` | 새 윈도우 생성                                   |
| `Ctrl+B, n` | 다음 윈도우                                      |
| `Ctrl+B, p` | 이전 윈도우                                      |
| `Ctrl+B, &` | 현재 윈도우 종료                                 |
| `Ctrl+B, ?` | 도움말                                           |

---

## 작업 검증

### 각 세션에서 작업 완료 후

```bash
# Claude에게 요청
작업 완료 후 pnpm typecheck && pnpm test 실행해서 검증해줘.
실패하면 수정하고 성공할 때까지 반복해.
```

### 전체 검증 (별도 터미널에서)

```bash
cd ~/Desktop/open-samguk
pnpm typecheck    # 타입 체크
pnpm lint         # 린트
pnpm test         # 테스트
pnpm build        # 빌드
```

---

## 웹 세션 활용 (claude.ai)

웹 세션은 분석/문서화 작업에 활용합니다.

### 권장 작업 분배

| 탭  | 작업          | 프롬프트 예시                                                                      |
| --- | ------------- | ---------------------------------------------------------------------------------- |
| 1   | API 분석      | "legacy/hwe/sammo/API/ 폴더의 모든 API를 분석하고 REST 엔드포인트 목록을 정리해줘" |
| 2   | 이벤트 분석   | "legacy/hwe/sammo/Event/ 폴더를 분석해서 이벤트 타입별로 정리해줘"                 |
| 3   | 아이템 분석   | "legacy/hwe/sammo/ActionItem/ 분석해서 아이템 효과 목록 만들어줘"                  |
| 4   | 시나리오 분석 | "legacy/hwe/scenario/ JSON 파일 구조 분석해줘"                                     |
| 5   | 컴포넌트 분석 | "legacy/hwe/ts/components/ Vue 컴포넌트 분석해줘"                                  |

---

## 트러블슈팅

### 세션이 안 보일 때

```bash
# tmux 서버 상태 확인
tmux ls

# 서버가 없으면 새로 시작
./scripts/start-porting.sh
```

### 세션 강제 종료

```bash
# 특정 세션 종료
tmux kill-session -t porting1

# 모든 세션 종료
tmux kill-server
```

### Claude가 응답하지 않을 때

```bash
# 세션에서 Ctrl+C로 중단
# 새 프롬프트 입력
```

### 프롬프트 파일이 없을 때

```bash
# 스크립트 재실행 (프롬프트 파일 재생성)
./scripts/start-porting.sh
```

---

## 팁

### 1. 플랜 모드 활용

각 세션에서 복잡한 작업 전 플랜 모드 사용:

```
Shift+Tab → 계획 수립 → 승인 후 실행
```

### 2. 자가 검증 요청

프롬프트 끝에 항상 추가:

```
작업이 끝나면 스스로 검증할 수 있는 테스트를 짜서 돌려보고,
실패하면 수정해. 성공할 때까지 반복해.
```

### 3. 커스텀 커맨드 활용

```
/verify          # 전체 검증
/refactor [파일] # 리팩토링
/review [파일]   # 코드 리뷰
/legacy-compare [기능]  # 레거시 비교
```

### 4. 백그라운드 작업

오래 걸리는 작업은 백그라운드로:

```
이 테스트를 백그라운드에서 실행하고 결과만 알려줘.
```

---

## 파일 구조

```
scripts/
├── README.md              # 이 가이드
├── start-porting.sh       # 포팅 작업 시작 스크립트
├── boris-mode.sh          # 범용 병렬 실행 스크립트
├── claude-sessions.sh     # 세션 관리 유틸리티
├── porting-tasks.md       # 작업 분배 문서
└── prompts/               # 세션별 프롬프트
    ├── session1.txt       # 터미널: 장수 커맨드
    ├── session2.txt       # 터미널: 국가 커맨드
    ├── session3.txt       # 터미널: 트리거 시스템
    ├── session4.txt       # 터미널: 패리티 테스트
    ├── session5.txt       # 터미널: 특기 시스템
    ├── web1-api-analysis.md        # 웹 분석: API
    ├── web2-event-analysis.md      # 웹 분석: 이벤트
    ├── web3-item-analysis.md       # 웹 분석: 아이템
    ├── web4-scenario-analysis.md   # 웹 분석: 시나리오
    ├── web5-component-analysis.md  # 웹 분석: 컴포넌트
    ├── web-impl1-api.md            # 웹 구현: REST API
    ├── web-impl2-events.md         # 웹 구현: 이벤트
    ├── web-impl3-items.md          # 웹 구현: 아이템
    ├── web-impl4-scenario.md       # 웹 구현: 시나리오
    └── web-impl5-frontend.md       # 웹 구현: 프론트엔드
```

---

## 관련 문서

- `CLAUDE.md` - 프로젝트 컨텍스트
- `docs/architecture/implementation-checklist.md` - 구현 체크리스트
- `docs/architecture/todo.md` - TODO 목록
- `docs/architecture/legacy-commands.md` - 레거시 커맨드 목록
