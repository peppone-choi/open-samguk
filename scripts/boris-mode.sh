#!/bin/bash
#
# Boris Mode: Claude Code 병렬 실행 스크립트
# 사용법: ./scripts/boris-mode.sh [터미널수] [웹수]
#

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TERMINAL_SESSIONS=${1:-5}
WEB_SESSIONS=${2:-5}

echo "╔══════════════════════════════════════════════════╗"
echo "║       Boris Mode: Claude Code Parallel Run       ║"
echo "╠══════════════════════════════════════════════════╣"
echo "║  Terminal Sessions: $TERMINAL_SESSIONS                            ║"
echo "║  Web Sessions: $WEB_SESSIONS                                 ║"
echo "║  Project: $PROJECT_DIR"
echo "╚══════════════════════════════════════════════════╝"
echo ""

# tmux 설치 확인
if ! command -v tmux &> /dev/null; then
    echo "❌ tmux가 설치되어 있지 않습니다."
    echo "   설치: brew install tmux"
    exit 1
fi

# claude 설치 확인
if ! command -v claude &> /dev/null; then
    echo "❌ claude가 설치되어 있지 않습니다."
    echo "   설치: npm install -g @anthropic-ai/claude-code"
    exit 1
fi

# 기존 세션 정리
echo "🧹 기존 Claude 세션 정리 중..."
for i in $(seq 1 10); do
    tmux kill-session -t "claude$i" 2>/dev/null
done

# 터미널 세션 시작
echo ""
echo "🚀 터미널 세션 시작 중..."
for i in $(seq 1 $TERMINAL_SESSIONS); do
    tmux new-session -d -s "claude$i" "cd $PROJECT_DIR && claude"
    echo "   ✓ claude$i 시작됨"
done

# 웹 세션 열기
if [ $WEB_SESSIONS -gt 0 ]; then
    echo ""
    echo "🌐 웹 세션 열기 중..."
    for i in $(seq 1 $WEB_SESSIONS); do
        open "https://claude.ai/new"
        sleep 0.3
    done
    echo "   ✓ $WEB_SESSIONS개 웹 탭 열림"
fi

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║                    준비 완료!                    ║"
echo "╠══════════════════════════════════════════════════╣"
echo "║  세션 접속:  tmux attach -t claude1              ║"
echo "║  세션 목록:  tmux ls                             ║"
echo "║  세션 전환:  Ctrl+B → D (나가기) → attach        ║"
echo "║  전체 종료:  tmux kill-server                    ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""
echo "💡 팁: 각 세션에서 Shift+Tab으로 플랜 모드 시작!"
