# 코드 검증

작업 완료 후 전체 검증을 수행합니다.

## 수행 작업
1. TypeScript 타입 체크 실행
2. ESLint 린트 검사 실행
3. 관련 테스트 실행
4. 빌드 성공 여부 확인

## 명령어
```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm build
```

검증 결과를 요약하고, 실패한 항목이 있으면 수정 방안을 제시해주세요.
