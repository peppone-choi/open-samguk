#!/bin/bash
#
# Claude 세션 관리 유틸리티
# 사용법: ./scripts/claude-sessions.sh [command]
#

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

show_help() {
    echo "Claude 세션 관리 유틸리티"
    echo ""
    echo "사용법: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  start [n]    n개의 세션 시작 (기본: 5)"
    echo "  list         활성 세션 목록"
    echo "  attach [n]   세션 n에 접속 (기본: 1)"
    echo "  stop [n]     세션 n 종료 (all: 전체)"
    echo "  web [n]      웹 세션 n개 열기"
    echo "  status       전체 상태 확인"
    echo ""
}

start_sessions() {
    count=${1:-5}
    echo "🚀 $count개 세션 시작 중..."
    for i in $(seq 1 $count); do
        tmux kill-session -t "claude$i" 2>/dev/null
        tmux new-session -d -s "claude$i" "cd $PROJECT_DIR && claude"
        echo "   ✓ claude$i"
    done
    echo "완료! 접속: tmux attach -t claude1"
}

list_sessions() {
    echo "📋 활성 Claude 세션:"
    tmux ls 2>/dev/null | grep claude || echo "   (없음)"
}

attach_session() {
    n=${1:-1}
    tmux attach -t "claude$n"
}

stop_sessions() {
    if [ "$1" = "all" ]; then
        echo "🛑 모든 세션 종료 중..."
        tmux kill-server 2>/dev/null
        echo "완료!"
    else
        n=${1:-1}
        echo "🛑 claude$n 종료 중..."
        tmux kill-session -t "claude$n" 2>/dev/null
        echo "완료!"
    fi
}

open_web() {
    count=${1:-5}
    echo "🌐 웹 세션 $count개 열기..."
    for i in $(seq 1 $count); do
        open "https://claude.ai/new"
        sleep 0.3
    done
}

show_status() {
    echo "╔══════════════════════════════════════╗"
    echo "║        Claude 세션 상태              ║"
    echo "╠══════════════════════════════════════╣"

    active=$(tmux ls 2>/dev/null | grep -c claude || echo "0")
    echo "║  활성 터미널 세션: $active개"
    echo "╠══════════════════════════════════════╣"

    if [ "$active" -gt 0 ]; then
        tmux ls 2>/dev/null | grep claude | while read line; do
            echo "║  - $line"
        done
    fi

    echo "╚══════════════════════════════════════╝"
}

case "$1" in
    start)
        start_sessions "$2"
        ;;
    list)
        list_sessions
        ;;
    attach)
        attach_session "$2"
        ;;
    stop)
        stop_sessions "$2"
        ;;
    web)
        open_web "$2"
        ;;
    status)
        show_status
        ;;
    *)
        show_help
        ;;
esac
