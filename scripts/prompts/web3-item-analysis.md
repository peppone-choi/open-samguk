# Web Session 3: 아이템 시스템 분석

## 목표

legacy/hwe/sammo/ActionItem/ 폴더의 아이템 시스템을 분석하고, packages/logic에 구현해야 할 아이템 효과 목록을 정리합니다.

## 분석 대상 경로

```
legacy/hwe/sammo/ActionItem/       # 아이템 액션
legacy/hwe/sammo/BaseItem.php      # 아이템 기본 클래스
legacy/hwe/sammo/iAction.php       # 액션 인터페이스
```

## 수행 작업

### 1. 아이템 분류

- **무기**: 공격력 관련
- **방어구**: 방어력 관련
- **말**: 이동/회피 관련
- **책**: 지력/특수 효과
- **소모품**: 일회성 효과

### 2. 각 아이템별 분석

```markdown
## 아이템명: [이름]

### 기본 정보

- 타입: 무기/방어구/말/책/소모품
- 희귀도: 일반/고급/유니크
- 획득 방법: 구매/경매/이벤트/전투

### 효과

- 기본 효과: [스탯 보너스 등]
- 특수 효과: [트리거 효과 등]
- 전투 효과: [전투 중 발동 효과]

### 장착 조건

- 스탯 요구치
- 클래스 제한

### 트리거 연동

- 관련 트리거 목록

### 레거시 파일

- legacy/hwe/sammo/ActionItem/XXX.php
```

### 3. 아이템-트리거 연동 맵

어떤 아이템이 어떤 트리거를 발동시키는지 매핑

### 4. 경매/거래 관련

- 경매 가능 여부
- 거래 가능 여부
- 가격 산정 로직

## 참고 문서

- docs/architecture/legacy-engine-items.md

## 최종 산출물

`docs/architecture/item-catalog.md` 파일에 정리된 전체 아이템 목록
