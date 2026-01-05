# Agent 7: Enums 및 DTO/VO 마이그레이션

## 업무 범위
열거형, 데이터 전송 객체, 값 객체를 TypeScript로 포팅

## 대상 디렉토리
- 소스1: `legacy/hwe/sammo/Enums/*.php` (16개 파일)
- 소스2: `legacy/hwe/sammo/DTO/*.php` (14개 파일)
- 소스3: `legacy/hwe/sammo/VO/*.php` (1개 파일)
- 타겟: `packages/logic/src/domain/enums/` 및 `packages/logic/src/domain/dto/`

## Enums 체크리스트
```bash
ls legacy/hwe/sammo/Enums/
```

예상 파일:
- [ ] GeneralQueryMode.php → GeneralQueryMode.ts
- [ ] InheritanceKey.php → InheritanceKey.ts
- [ ] PenaltyKey.php → PenaltyKey.ts
- [ ] MessageType.php → MessageType.ts
- [ ] DiplomacyState.php → DiplomacyState.ts
- [ ] OfficerLevel.php → OfficerLevel.ts
- [ ] EventTarget.php → EventTarget.ts
- [ ] (기타 열거형들)

## DTO 체크리스트
```bash
ls legacy/hwe/sammo/DTO/
```

예상 파일:
- [ ] GeneralDTO.php → GeneralDTO.ts
- [ ] NationDTO.php → NationDTO.ts
- [ ] CityDTO.php → CityDTO.ts
- [ ] BattleDTO.php → BattleDTO.ts
- [ ] (기타 DTO들)

## VO 체크리스트
```bash
ls legacy/hwe/sammo/VO/
```

- [ ] 각 VO 파일 포팅

## 포팅 규칙
1. PHP enum/const → TypeScript enum 또는 const 객체
2. PHP DTO class → TypeScript interface 또는 class
3. 타입 안전성 보장
4. Zod 스키마 정의 (API 검증용)

## 파일 구조
```typescript
// packages/logic/src/domain/enums/OfficerLevel.ts
export enum OfficerLevel {
  None = 0,
  Soldier = 1,
  Captain = 2,
  General = 3,
  Commander = 4,
  // ...
  Lord = 12,
}

// packages/logic/src/domain/enums/DiplomacyState.ts
export enum DiplomacyState {
  None = 0,
  War = 1,
  NonAggression = 2,
  Alliance = 3,
}

// packages/logic/src/domain/dto/GeneralDTO.ts
import { z } from 'zod';

export const GeneralDTOSchema = z.object({
  id: z.number(),
  name: z.string(),
  nationId: z.number(),
  cityId: z.number(),
  leadership: z.number(),
  strength: z.number(),
  intelligence: z.number(),
  // ...
});

export type GeneralDTO = z.infer<typeof GeneralDTOSchema>;
```
