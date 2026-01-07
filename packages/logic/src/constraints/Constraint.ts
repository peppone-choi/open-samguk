import type { ConstraintInput, ConstraintResult, CommandEnv } from "../commands/types.js";

export type ConstraintDef = [string, ...unknown[]];

export type ConstraintChecker = (
  input: ConstraintInput,
  env: CommandEnv,
  args: unknown[]
) => ConstraintResult;

const constraintRegistry = new Map<string, ConstraintChecker>();

export function registerConstraint(name: string, checker: ConstraintChecker): void {
  constraintRegistry.set(name, checker);
}

export function testAllConstraints(
  constraints: ConstraintDef[],
  input: ConstraintInput,
  env: CommandEnv
): [string | null, string | null] {
  for (const [name, ...args] of constraints) {
    const checker = constraintRegistry.get(name);
    if (!checker) {
      console.warn(`Unknown constraint: ${name}`);
      continue;
    }

    const result = checker(input, env, args);
    if (!result.passed) {
      return [name, result.failReason ?? `${name} 조건을 만족하지 않습니다.`];
    }
  }

  return [null, null];
}

registerConstraint("AlwaysFail", (_input, _env, args): ConstraintResult => {
  const failMessage = args[0] as string;
  return { passed: false, failReason: failMessage };
});

registerConstraint("ReqGeneralGold", (input, _env, args): ConstraintResult => {
  const reqGold = args[0] as number;
  const gold = input.general.resources.gold;
  if (gold < reqGold) {
    return { passed: false, failReason: `자금이 부족합니다. (${gold}/${reqGold})` };
  }
  return { passed: true };
});

registerConstraint("ReqGeneralRice", (input, _env, args): ConstraintResult => {
  const reqRice = args[0] as number;
  const rice = input.general.resources.rice;
  if (rice < reqRice) {
    return { passed: false, failReason: `군량이 부족합니다. (${rice}/${reqRice})` };
  }
  return { passed: true };
});

registerConstraint("NotBeNeutral", (input, _env, _args): ConstraintResult => {
  if (input.general.nation === 0) {
    return { passed: false, failReason: "소속된 국가가 없습니다." };
  }
  return { passed: true };
});

registerConstraint("BeNeutral", (input, _env, _args): ConstraintResult => {
  if (input.general.nation !== 0) {
    return { passed: false, failReason: "이미 소속된 국가가 있습니다." };
  }
  return { passed: true };
});

registerConstraint("OccupiedCity", (input, _env, args): ConstraintResult => {
  const allowNeutral = (args[0] as boolean) ?? false;
  if (!input.city) {
    return { passed: false, failReason: "도시 정보가 없습니다." };
  }

  const cityNation = input.city.nation;
  const generalNation = input.general.nation;

  if (cityNation === generalNation) {
    return { passed: true };
  }

  if (allowNeutral && cityNation === 0) {
    return { passed: true };
  }

  return { passed: false, failReason: "아국 도시가 아닙니다." };
});

registerConstraint("NotOccupiedCity", (input, _env, _args): ConstraintResult => {
  if (!input.city) {
    return { passed: false, failReason: "도시 정보가 없습니다." };
  }

  if (input.city.nation === input.general.nation && input.general.nation !== 0) {
    return { passed: false, failReason: "아국 도시입니다." };
  }

  return { passed: true };
});

registerConstraint("NotSameDestCity", (input, _env, _args): ConstraintResult => {
  if (!input.destCity) {
    return { passed: false, failReason: "목적지가 지정되지 않았습니다." };
  }

  if (input.destCity.city === input.general.city) {
    return { passed: false, failReason: "같은 도시로는 이동할 수 없습니다." };
  }

  return { passed: true };
});

registerConstraint("NearCity", (input, _env, args): ConstraintResult => {
  const distance = args[0] as number;
  if (!input.destCity || !input.city) {
    return { passed: false, failReason: "도시 정보가 없습니다." };
  }

  const _calculatedDistance = 1;

  if (_calculatedDistance > distance) {
    return { passed: false, failReason: `거리가 너무 멉니다. (${distance}칸 이내만 가능)` };
  }

  return { passed: true };
});

registerConstraint("ReqCityTrust", (input, _env, args): ConstraintResult => {
  const minTrust = args[0] as number;
  if (!input.city) {
    return { passed: false, failReason: "도시 정보가 없습니다." };
  }

  if (input.city.economy.trust < minTrust) {
    return {
      passed: false,
      failReason: `도시 민심이 부족합니다. (${input.city.economy.trust}/${minTrust})`,
    };
  }

  return { passed: true };
});

registerConstraint("ReqCityCapacity", (input, _env, args): ConstraintResult => {
  const key = args[0] as string;
  const keyNick = args[1] as string;
  const reqVal = args[2] as number;

  if (!input.city) {
    return { passed: false, failReason: "도시 정보가 없습니다." };
  }

  const value = (input.city.population as unknown as Record<string, number>)[key] ?? 0;
  if (value < reqVal) {
    return {
      passed: false,
      failReason: `도시 ${keyNick}이(가) 부족합니다. (${value}/${reqVal})`,
    };
  }

  return { passed: true };
});

registerConstraint("BeLord", (input, _env, _args): ConstraintResult => {
  if (input.general.officerLevel !== 12) {
    return { passed: false, failReason: "군주만 가능한 명령입니다." };
  }
  return { passed: true };
});

registerConstraint("BeChief", (input, _env, _args): ConstraintResult => {
  if (input.general.officerLevel < 5) {
    return { passed: false, failReason: "수뇌급 이상만 가능한 명령입니다." };
  }
  return { passed: true };
});

registerConstraint("NotLord", (input, _env, _args): ConstraintResult => {
  if (input.general.officerLevel === 12) {
    return { passed: false, failReason: "군주는 불가능한 명령입니다." };
  }
  return { passed: true };
});

registerConstraint("ReqGeneralCrew", (input, _env, _args): ConstraintResult => {
  if (input.general.military.crew <= 0) {
    return { passed: false, failReason: "병력이 없습니다." };
  }
  return { passed: true };
});

registerConstraint("ReqGeneralCrewMargin", (input, _env, args): ConstraintResult => {
  const crewTypeId = args[0] as number;
  const leadership = input.general.stats.leadership;
  const maxCrew = leadership * 100;
  const currentCrew = input.general.military.crew;
  const currentType = input.general.military.crewType;

  if (currentType === crewTypeId && currentCrew >= maxCrew) {
    return { passed: false, failReason: "더 이상 병력을 보유할 수 없습니다." };
  }

  return { passed: true };
});

registerConstraint("AvailableRecruitCrewType", (_input, _env, _args): ConstraintResult => {
  return { passed: true };
});

export const ConstraintHelper = {
  AlwaysFail: (failMessage: string): ConstraintDef => ["AlwaysFail", failMessage],
  ReqGeneralGold: (reqGold: number): ConstraintDef => ["ReqGeneralGold", reqGold],
  ReqGeneralRice: (reqRice: number): ConstraintDef => ["ReqGeneralRice", reqRice],
  NotBeNeutral: (): ConstraintDef => ["NotBeNeutral"],
  BeNeutral: (): ConstraintDef => ["BeNeutral"],
  OccupiedCity: (allowNeutral = false): ConstraintDef => ["OccupiedCity", allowNeutral],
  NotOccupiedCity: (): ConstraintDef => ["NotOccupiedCity"],
  NotSameDestCity: (): ConstraintDef => ["NotSameDestCity"],
  NearCity: (distance: number): ConstraintDef => ["NearCity", distance],
  ReqCityTrust: (minTrust: number): ConstraintDef => ["ReqCityTrust", minTrust],
  ReqCityCapacity: (key: string, keyNick: string, reqVal: number): ConstraintDef => [
    "ReqCityCapacity",
    key,
    keyNick,
    reqVal,
  ],
  BeLord: (): ConstraintDef => ["BeLord"],
  BeChief: (): ConstraintDef => ["BeChief"],
  NotLord: (): ConstraintDef => ["NotLord"],
  ReqGeneralCrew: (): ConstraintDef => ["ReqGeneralCrew"],
  ReqGeneralCrewMargin: (crewTypeId: number): ConstraintDef => ["ReqGeneralCrewMargin", crewTypeId],
  AvailableRecruitCrewType: (crewTypeId: number): ConstraintDef => [
    "AvailableRecruitCrewType",
    crewTypeId,
  ],
};
