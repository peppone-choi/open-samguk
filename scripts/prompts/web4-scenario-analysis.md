# Web Session 4: 시나리오 데이터 분석

## 목표
legacy/hwe/scenario/ 폴더의 시나리오 JSON 파일 구조를 분석하고, 시나리오 로딩 시스템을 설계합니다.

## 분석 대상 경로
```
legacy/hwe/scenario/
├── scenario_0.json
├── scenario_1.json
├── ...
├── scenario_2901.json
├── map/           # 맵 데이터
└── unit/          # 유닛 데이터
```

## 수행 작업

### 1. JSON 스키마 분석
```typescript
// 예상 스키마
interface Scenario {
  id: number;
  name: string;
  description: string;
  map: MapData;
  nations: NationData[];
  generals: GeneralData[];
  cities: CityData[];
  events: EventData[];
  // ...
}
```

### 2. 시나리오별 특성
```markdown
## 시나리오: [ID] - [이름]

### 기본 정보
- 맵 타입: che/chess/cr/ludo/pokemon
- 시작 년도: XXXX년
- 플레이어 수: N명

### 초기 세력
| 국가 | 수도 | 장수 수 | 특징 |
|------|------|---------|------|
| 위 | 낙양 | 20 | ... |

### 특수 규칙
- [규칙 1]
- [규칙 2]

### 이벤트
- [초기 이벤트 목록]
```

### 3. 맵 데이터 구조
- 도시 좌표
- 도시 간 연결 (경로)
- 지형 정보

### 4. 유닛 팩 구조
- 유닛 그래픽
- 유닛 스탯
- 특수 능력

### 5. 시나리오 로딩 흐름
```
1. JSON 파일 읽기
2. 스키마 검증 (zod)
3. 메모리 상태 초기화
4. 초기 이벤트 실행
```

## 참고 문서
- docs/architecture/legacy-scenarios.md

## 최종 산출물
`docs/architecture/scenario-schema.md` 파일에 정리된 시나리오 스키마 및 로딩 설계
