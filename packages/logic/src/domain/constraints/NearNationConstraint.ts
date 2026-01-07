import { Constraint, ConstraintContext, ConstraintResult, StateView } from "../Constraint.js";
import { MapUtil } from "../MapData.js";

/**
 * 대상 국가가 인접 국가인지 검사
 * 레거시: NearNation.php
 */
export class NearNationConstraint implements Constraint {
  name = "NearNation";

  requires(ctx: ConstraintContext) {
    return [
      { kind: "nation" as const, id: ctx.nationId ?? 0 },
      { kind: "destNation" as const, id: ctx.args.destNationId },
    ];
  }

  test(ctx: ConstraintContext, view: StateView): ConstraintResult {
    const srcNationId = ctx.nationId ?? 0;
    const destNationId = ctx.args.destNationId;

    if (!destNationId) {
      return { kind: "deny", reason: "대상 국가가 지정되지 않았습니다." };
    }

    if (srcNationId === destNationId) {
      return { kind: "deny", reason: "같은 국가입니다." };
    }

    // WorldSnapshot에서 도시 정보 접근 필요
    // StateView는 개별 엔티티만 조회 가능하므로,
    // cities 전체를 순회하는 로직은 Command.run에서 직접 처리해야 함
    // 여기서는 단순히 allow 반환하고, 실제 검사는 Command에서 수행
    //
    // 향후 개선: StateView에 getAllCities() 등 추가 필요
    return { kind: "allow" };
  }
}

/**
 * 두 국가가 인접한지 검사하는 유틸리티 함수
 * WorldSnapshot을 직접 받아서 검사
 */
export function areNationsNeighbors(
  srcNationId: number,
  destNationId: number,
  cities: Record<number, { nationId: number }>,
  includeNoSupply: boolean = true
): boolean {
  if (srcNationId === destNationId) {
    return false;
  }

  // srcNation의 도시 ID 수집
  const srcNationCityIds = new Set<number>();
  for (const [cityId, city] of Object.entries(cities)) {
    if (city.nationId === srcNationId) {
      srcNationCityIds.add(Number(cityId));
    }
  }

  // destNation의 각 도시에 대해 인접 도시가 srcNation 소유인지 확인
  for (const [cityId, city] of Object.entries(cities)) {
    if (city.nationId === destNationId) {
      const connections = MapUtil.getConnections(Number(cityId));
      for (const adjCityId of connections) {
        if (srcNationCityIds.has(adjCityId)) {
          return true;
        }
      }
    }
  }

  return false;
}
