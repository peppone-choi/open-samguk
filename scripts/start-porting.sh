#!/bin/bash
#
# Legacy 포팅 병렬 작업 시작 스크립트
# 5개 터미널 세션 + 5개 웹 세션
#

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PROMPTS_DIR="$PROJECT_DIR/scripts/prompts"

echo "╔══════════════════════════════════════════════════════════╗"
echo "║       Legacy Porting - Parallel Execution Mode           ║"
echo "╠══════════════════════════════════════════════════════════╣"
echo "║  Project: open-samguk                                    ║"
echo "║  Sessions: 5 Terminal + 5 Web                            ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# tmux 확인
if ! command -v tmux &> /dev/null; then
    echo "❌ tmux 필요: brew install tmux"
    exit 1
fi

# 프롬프트 디렉토리 생성
mkdir -p "$PROMPTS_DIR"

# 세션 1: 장수 커맨드
cat > "$PROMPTS_DIR/session1.txt" << 'PROMPT'
docs/architecture/legacy-commands.md를 참고하여 아직 포팅되지 않은 장수 커맨드를 구현해줘.
packages/logic/src/domain/commands/ 폴더의 기존 패턴을 따라서.
레거시 코드는 legacy/hwe/sammo/Command/General/ 참조.

우선순위:
1. che_맹훈련 (GeneralIntenseTrainingCommand)
2. che_접경귀환 (GeneralBorderReturnCommand)
3. che_선양 (GeneralAbdicateCommand)
4. che_탈취 (GeneralSeizeCommand)
5. che_해산 (GeneralDisbandCommand)

각 커맨드마다:
1. 레거시 코드 분석
2. TypeScript 구현
3. 테스트 작성
4. pnpm typecheck && pnpm test 검증
5. 실패시 수정 후 재검증 (성공할 때까지)
PROMPT

# 세션 2: 국가 커맨드
cat > "$PROMPTS_DIR/session2.txt" << 'PROMPT'
docs/architecture/legacy-commands.md를 참고하여 아직 포팅되지 않은 국가 커맨드를 구현해줘.
packages/logic/src/domain/commands/ 폴더의 기존 패턴을 따라서.
레거시 코드는 legacy/hwe/sammo/Command/Nation/ 참조.

우선순위:
1. 선전포고 (NationDeclareWarCommand)
2. 휴전제의 (NationProposeArmisticeCommand)
3. 동맹제의 (NationProposeAllianceCommand)
4. 불가침제의 (NationProposeNonAggressionCommand)
5. 세금조정 (NationAdjustTaxCommand)

각 커맨드마다:
1. 레거시 코드 분석
2. TypeScript 구현
3. 테스트 작성
4. pnpm typecheck && pnpm test 검증
5. 실패시 수정 후 재검증 (성공할 때까지)
PROMPT

# 세션 3: 트리거 시스템
cat > "$PROMPTS_DIR/session3.txt" << 'PROMPT'
Phase J2 트리거 시스템을 완성해줘.
docs/architecture/legacy-engine-triggers.md 참조.
레거시 코드: legacy/hwe/sammo/GeneralTrigger/, legacy/hwe/sammo/WarUnitTrigger/

필요한 작업:
1. 트리거 registry 구현 (packages/logic/src/domain/TriggerRegistry.ts)
2. attempt/execute 2단계 분리
3. 우선순위 기반 실행
4. RNG 시드 컨텍스트 포함
5. 기존 SoldierMaintenanceTrigger 패턴 확장

작업 후:
- 테스트 작성
- pnpm typecheck && pnpm test 검증
- 실패시 수정 후 재검증
PROMPT

# 세션 4: 패리티 테스트
cat > "$PROMPTS_DIR/session4.txt" << 'PROMPT'
Phase I 레거시 패리티 테스트 하네스를 완성해줘.
packages/logic/src/test/ParityHarness.ts 확장.

필요한 작업:
1. 입력 포맷 고정: 엔티티 스냅샷, 시드, 게임 시간, 시나리오, 커맨드
2. 출력 포맷 고정: delta, 로그 요약, 주요 수치
3. 정규화/정렬 규칙 명시
4. Vitest 테스트 케이스 작성
5. RNG/조사/가중치 비교 테스트

docs/testing-policy.md 참조.
pnpm typecheck && pnpm test 로 검증.
PROMPT

# 세션 5: 특기 시스템
cat > "$PROMPTS_DIR/session5.txt" << 'PROMPT'
전투 특기와 내정 특기를 포팅해줘.
레거시: legacy/hwe/sammo/ActionSpecialWar/, legacy/hwe/sammo/ActionSpecialDomestic/
대상: packages/logic/src/domain/specials/ (새로 생성)

먼저 Special 인터페이스를 정의하고:

전투 특기 우선순위:
1. 돌격 특기
2. 화공 특기
3. 계략 특기

내정 특기 우선순위:
1. 농업 특기
2. 상업 특기
3. 기술 특기

기존 Command, Trigger 패턴 참고.
작업 후 pnpm typecheck && pnpm test 검증.
PROMPT

echo "📝 프롬프트 파일 생성 완료"
echo ""

# 기존 세션 정리
echo "🧹 기존 세션 정리 중..."
for i in {1..5}; do
    tmux kill-session -t "porting$i" 2>/dev/null
done

# 새 세션 시작
echo ""
echo "🚀 포팅 세션 시작..."

for i in {1..5}; do
    tmux new-session -d -s "porting$i" "cd $PROJECT_DIR && claude"
    echo "   ✓ porting$i 시작됨"
    echo "     프롬프트: $PROMPTS_DIR/session$i.txt"
done

# 웹 세션
echo ""
echo "🌐 웹 세션 열기..."
for i in {1..5}; do
    open "https://claude.ai/new"
    sleep 0.3
done

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║                      준비 완료!                          ║"
echo "╠══════════════════════════════════════════════════════════╣"
echo "║                                                          ║"
echo "║  세션 접속 후 프롬프트 복사-붙여넣기:                     ║"
echo "║                                                          ║"
echo "║  Session 1 (장수 커맨드):                                 ║"
echo "║    tmux attach -t porting1                               ║"
echo "║    cat scripts/prompts/session1.txt                      ║"
echo "║                                                          ║"
echo "║  Session 2 (국가 커맨드):                                 ║"
echo "║    tmux attach -t porting2                               ║"
echo "║    cat scripts/prompts/session2.txt                      ║"
echo "║                                                          ║"
echo "║  Session 3 (트리거):                                      ║"
echo "║    tmux attach -t porting3                               ║"
echo "║    cat scripts/prompts/session3.txt                      ║"
echo "║                                                          ║"
echo "║  Session 4 (패리티 테스트):                               ║"
echo "║    tmux attach -t porting4                               ║"
echo "║    cat scripts/prompts/session4.txt                      ║"
echo "║                                                          ║"
echo "║  Session 5 (특기):                                        ║"
echo "║    tmux attach -t porting5                               ║"
echo "║    cat scripts/prompts/session5.txt                      ║"
echo "║                                                          ║"
echo "╠══════════════════════════════════════════════════════════╣"
echo "║  세션 전환: Ctrl+B → D (나가기)                           ║"
echo "║  세션 목록: tmux ls                                       ║"
echo "║  전체 종료: tmux kill-server                              ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "📋 작업 목록: scripts/porting-tasks.md"
echo ""
