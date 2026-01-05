/**
 * Constraint 시스템 - 제약조건 모듈
 *
 * 레거시 PHP Constraint 시스템을 TypeScript로 마이그레이션한 모듈입니다.
 * 각 제약조건은 Constraint 인터페이스를 구현하며,
 * requires()와 test() 메서드를 통해 검증 로직을 제공합니다.
 */

// General (장수) 관련 제약조건
export { BeChiefConstraint } from "./BeChiefConstraint.js";
export { NotChiefConstraint } from "./NotChiefConstraint.js";
export { NotLordConstraint } from "./NotLordConstraint.js";

// City (도시) 관련 제약조건
export { NeutralCityConstraint } from "./NeutralCityConstraint.js";
export { NotOccupiedCityConstraint } from "./NotOccupiedCityConstraint.js";

// DestCity (대상 도시) 관련 제약조건
export { NotNeutralDestCityConstraint } from "./NotNeutralDestCityConstraint.js";
export { OccupiedDestCityConstraint } from "./OccupiedDestCityConstraint.js";
export { NotOccupiedDestCityConstraint } from "./NotOccupiedDestCityConstraint.js";
export { SuppliedDestCityConstraint } from "./SuppliedDestCityConstraint.js";

// 범용 값 검사 제약조건
export { ReqGeneralValueConstraint } from "./ReqGeneralValueConstraint.js";
export { ReqNationValueConstraint } from "./ReqNationValueConstraint.js";
export { ReqCityValueConstraint } from "./ReqCityValueConstraint.js";
export { ReqDestCityValueConstraint } from "./ReqDestCityValueConstraint.js";
export { ReqDestNationValueConstraint } from "./ReqDestNationValueConstraint.js";

// Nation (국가) 관련 제약조건
export { ReqNationGoldConstraint } from "./ReqNationGoldConstraint.js";
export { ReqNationRiceConstraint } from "./ReqNationRiceConstraint.js";

// 기타 제약조건
export { NotCapitalConstraint } from "./NotCapitalConstraint.js";
export { NotSameDestCityConstraint } from "./NotSameDestCityConstraint.js";
export { ExistsDestNationConstraint } from "./ExistsDestNationConstraint.js";
export { DifferentDestNationConstraint } from "./DifferentDestNationConstraint.js";

// 외교 관련 제약조건
export {
  NearNationConstraint,
  areNationsNeighbors,
} from "./NearNationConstraint.js";
export { DisallowDiplomacyBetweenStatusConstraint } from "./DisallowDiplomacyBetweenStatusConstraint.js";
export { AllowDiplomacyBetweenStatusConstraint } from "./AllowDiplomacyBetweenStatusConstraint.js";

// 환경 값 관련 제약조건
export { ReqEnvValueConstraint } from "./ReqEnvValueConstraint.js";
