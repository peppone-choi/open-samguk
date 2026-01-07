/**
 * Constraint 시스템 - 제약조건 모듈
 *
 * 레거시 PHP Constraint 시스템을 TypeScript로 마이그레이션한 모듈입니다.
 * 각 제약조건은 Constraint 인터페이스를 구현하며,
 * requires()와 test() 메서드를 통해 검증 로직을 제공합니다.
 */

// General (장수) 관련 제약조건
export { BeChiefConstraint } from "./BeChiefConstraint.js";
export { BeLordConstraint } from "./BeLordConstraint.js";
export { BeNeutralConstraint } from "./BeNeutralConstraint.js";
export { NotBeNeutralConstraint } from "./NotBeNeutralConstraint.js";
export { NotChiefConstraint } from "./NotChiefConstraint.js";
export { NotLordConstraint } from "./NotLordConstraint.js";
export { ReqGeneralGoldConstraint } from "./ReqGeneralGoldConstraint.js";
export { ReqGeneralRiceConstraint } from "./ReqGeneralRiceConstraint.js";
export { ReqGeneralCrewConstraint } from "./ReqGeneralCrewConstraint.js";

// City (도시) 관련 제약조건
export { NeutralCityConstraint } from "./NeutralCityConstraint.js";
export { NotOccupiedCityConstraint } from "./NotOccupiedCityConstraint.js";
export { OccupiedCityConstraint } from "./OccupiedCityConstraint.js";

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
export { NearNationConstraint, areNationsNeighbors } from "./NearNationConstraint.js";
export { DisallowDiplomacyBetweenStatusConstraint } from "./DisallowDiplomacyBetweenStatusConstraint.js";
export { AllowDiplomacyBetweenStatusConstraint } from "./AllowDiplomacyBetweenStatusConstraint.js";
export { AllowDiplomacyStatusConstraint } from "./AllowDiplomacyStatusConstraint.js";
export { DisallowDiplomacyStatusConstraint } from "./DisallowDiplomacyStatusConstraint.js";
export { AllowDiplomacyWithTermConstraint } from "./AllowDiplomacyWithTermConstraint.js";
export { AllowJoinDestNationConstraint } from "./AllowJoinDestNationConstraint.js";
export { BattleGroundCityConstraint } from "./BattleGroundCityConstraint.js";
export { AllowRebellionConstraint } from "./AllowRebellionConstraint.js";
export { CheckNationNameDuplicateConstraint } from "./CheckNationNameDuplicateConstraint.js";
export { ExistsAllowJoinNationConstraint } from "./ExistsAllowJoinNationConstraint.js";
export { HasRouteConstraint } from "./HasRouteConstraint.js";
export { HasRouteWithEnemyConstraint } from "./HasRouteWithEnemyConstraint.js";
export { ReqGeneralCrewMarginConstraint } from "./ReqGeneralCrewMarginConstraint.js";
export { ReqTroopMembersConstraint } from "./ReqTroopMembersConstraint.js";
export { AllowStrategicCommandConstraint } from "./AllowStrategicCommandConstraint.js";
export { AvailableStrategicCommandConstraint } from "./AvailableStrategicCommandConstraint.js";
export { AdhocCallbackConstraint } from "./AdhocCallbackConstraint.js";
export { AvailableRecruitCrewTypeConstraint } from "./AvailableRecruitCrewTypeConstraint.js";
export { AvailableNationCommandConstraint } from "./AvailableNationCommandConstraint.js";

// 환경 값 관련 제약조건
export { ReqEnvValueConstraint } from "./ReqEnvValueConstraint.js";

export { SuppliedCityConstraint } from "./SuppliedCityConstraint.js";
export { WanderingNationConstraint } from "./WanderingNationConstraint.js";
export { NotWanderingNationConstraint } from "./NotWanderingNationConstraint.js";
export { NearCityConstraint } from "./NearCityConstraint.js";
export { ExistsDestGeneralConstraint } from "./ExistsDestGeneralConstraint.js";
export { FriendlyDestGeneralConstraint } from "./FriendlyDestGeneralConstraint.js";
export { DifferentNationDestGeneralConstraint } from "./DifferentNationDestGeneralConstraint.js";
export { NoPenaltyConstraint } from "./NoPenaltyConstraint.js";
export { ConstructableCityConstraint } from "./ConstructableCityConstraint.js";
export { RemainCityCapacityConstraint } from "./RemainCityCapacityConstraint.js";
export { ReqGeneralTrainMarginConstraint } from "./ReqGeneralTrainMarginConstraint.js";
export { ReqGeneralAtmosMarginConstraint } from "./ReqGeneralAtmosMarginConstraint.js";
export { AlwaysFailConstraint } from "./AlwaysFailConstraint.js";
export { BeOpeningPartConstraint } from "./BeOpeningPartConstraint.js";
export { NotOpeningPartConstraint } from "./NotOpeningPartConstraint.js";
export { RemainCityTrustConstraint } from "./RemainCityTrustConstraint.js";
export { ReqCityCapacityConstraint } from "./ReqCityCapacityConstraint.js";
export { ReqCityTrustConstraint } from "./ReqCityTrustConstraint.js";
export { MustBeNPCConstraint } from "./MustBeNPCConstraint.js";
export { AllowWarConstraint } from "./AllowWarConstraint.js";
export { ReqNationAuxValueConstraint } from "./ReqNationAuxValueConstraint.js";
export { ReqCityTraderConstraint } from "./ReqCityTraderConstraint.js";
export { MustBeTroopLeaderConstraint } from "./MustBeTroopLeaderConstraint.js";
export { AllowJoinActionConstraint } from "./AllowJoinActionConstraint.js";
