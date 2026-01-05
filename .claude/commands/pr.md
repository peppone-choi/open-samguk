# PR 생성

현재 브랜치의 변경사항을 분석하여 PR을 생성합니다.

## 수행 작업
1. `git diff main...HEAD` 분석
2. 변경 내용 요약
3. CLAUDE.md 커밋 규칙에 맞춰 PR 제목 생성
4. PR 설명 작성:
   - 변경 요약
   - 테스트 방법
   - 체크리스트
5. `gh pr create` 실행

## PR 템플릿
```markdown
## Summary
- 변경 내용 요약

## Changes
- 구체적인 변경 목록

## Test Plan
- [ ] pnpm typecheck 통과
- [ ] pnpm lint 통과
- [ ] pnpm test 통과
- [ ] 수동 테스트 완료

## Screenshots (UI 변경 시)
```
