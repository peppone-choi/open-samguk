# 레거시 비교 분석

새로 작성한 코드가 레거시 동작과 일치하는지 비교합니다.

## 분석 대상
$ARGUMENTS

## 수행 작업
1. 레거시 코드 (`legacy/`) 에서 해당 기능 찾기
2. 입력/출력 동작 비교
3. 엣지 케이스 확인
4. 차이점 문서화

레거시 경로:
- PHP 도메인 로직: `legacy/hwe/sammo/`
- TypeScript: `legacy/hwe/ts/`
- API 핸들러: `legacy/hwe/j_*.php`, `legacy/hwe/API/`
