# Web Session 5: Vue 컴포넌트 분석

## 목표
legacy/hwe/ts/components/ 폴더의 Vue 컴포넌트를 분석하고, apps/web에 구현해야 할 React 컴포넌트 목록을 정리합니다.

## 분석 대상 경로
```
legacy/hwe/ts/components/
├── PageAuction.vue
├── PageBattleCenter.vue
├── PageBoard.vue
├── PageChiefCenter.vue
├── PageFront.vue
├── PageHistory.vue
├── PageJoin.vue
├── PageNationGeneral.vue
├── PageNPCControl.vue
├── PageTroop.vue
├── PageVote.vue
├── PartialReservedCommand.vue
└── ...
```

## 수행 작업

### 1. 페이지별 분석
```markdown
## 페이지: [이름]

### 기능
- [주요 기능 설명]

### UI 구성요소
- 헤더/네비게이션
- 메인 컨텐츠
- 사이드바
- 모달/팝업

### 데이터 요구사항
- API 호출 목록
- 실시간 업데이트 (WebSocket/SSE)

### 상태 관리
- 로컬 상태
- 전역 상태 (store)

### 사용자 인터랙션
- 버튼/폼
- 테이블 조작
- 드래그앤드롭

### 레거시 파일
- legacy/hwe/ts/components/PageXXX.vue
- 관련 PHP: legacy/hwe/v_XXX.php
```

### 2. 공통 컴포넌트 추출
- 버튼, 입력, 테이블 등 재사용 가능한 컴포넌트

### 3. shadcn/ui 매핑
| Vue 컴포넌트 | shadcn/ui 대응 |
|-------------|---------------|
| CustomButton | Button |
| CustomTable | Table |
| CustomModal | Dialog |

### 4. 라우팅 구조
```
/                    # 메인 (PageFront)
/join                # 가입 (PageJoin)
/auction             # 경매 (PageAuction)
/battle              # 전투 (PageBattleCenter)
/nation              # 국가 (PageNationGeneral)
/troop               # 부대 (PageTroop)
/vote                # 투표 (PageVote)
/history             # 기록 (PageHistory)
/board               # 게시판 (PageBoard)
```

### 5. 스타일 분석
- 레거시 SCSS: legacy/hwe/scss/
- 색상 팔레트
- 반응형 브레이크포인트

## 참고 문서
- docs/architecture/overview.md (Frontend 섹션)

## 최종 산출물
`docs/architecture/frontend-components.md` 파일에 정리된 컴포넌트 목록 및 라우팅 설계
