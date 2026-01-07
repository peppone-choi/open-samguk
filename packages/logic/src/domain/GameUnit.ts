import { UnitData } from "./scenario/schema.js";
import { RegionNameMap } from "./RegionMap.js";
import {
  BaseUnitConstraint,
  ImpossibleConstraint,
  ReqTechConstraint,
  ReqCitiesConstraint,
  ReqCitiesWithCityLevelConstraint,
  ReqHighLevelCitiesConstraint,
  ReqRegionsConstraint,
  ReqNationAuxConstraint,
  ReqMinRelYearConstraint,
  UnitConstraintContext,
} from "./unit-constraints/index.js";

/**
 * GameUnit Class
 * Handles individual unit logic, constraints, and modifiers.
 */
export class GameUnit {
  public readonly id: number;
  public readonly type: number;
  public readonly name: string;
  public readonly attack: number;
  public readonly defense: number;
  public readonly speed: number;
  public readonly cost: number;
  public readonly magicRate: number;
  public readonly attackRange: number;
  public readonly defenseRange: number;

  private readonly constraints: BaseUnitConstraint[];
  private readonly attackModifiers: Record<string, number>;
  private readonly defenseModifiers: Record<string, number>;
  public readonly descriptions: string[];

  public readonly attackAbility: string | null;
  public readonly defenseAbility: string | null;
  public readonly specialAbility: string | null;

  constructor(data: UnitData) {
    this.id = data.id;
    this.type = data.type;
    this.name = data.name;
    this.attack = data.attack;
    this.defense = data.defense;
    this.speed = data.speed;
    this.cost = data.cost;
    this.magicRate = data.magicRate;
    this.attackRange = data.attackRange;
    this.defenseRange = data.defenseRange;

    this.constraints = this.parseConstraints(data.constraints || []);
    this.attackModifiers = data.attackModifiers || {};
    this.defenseModifiers = data.defenseModifiers || {};
    this.descriptions = data.descriptions;

    this.attackAbility = data.attackAbility || null;
    this.defenseAbility = data.defenseAbility || null;
    this.specialAbility = data.specialAbility || null;
  }

  /**
   * Check if the unit can be recruited based on the context.
   */
  public canRecruit(context: UnitConstraintContext): boolean {
    for (const constraint of this.constraints) {
      if (!constraint.test(context)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Get the list of unmet constraints info.
   */
  public getUnmetConstraintsInfo(context: UnitConstraintContext): string[] {
    const unmet: string[] = [];
    for (const constraint of this.constraints) {
      if (!constraint.test(context)) {
        unmet.push(constraint.getInfo());
      }
    }
    return unmet;
  }

  /**
   * Get all constraint info strings.
   */
  public getConstraintInfos(): string[] {
    return this.constraints.map((c) => c.getInfo());
  }

  /**
   * Get attack modifier against a target unit type.
   */
  public getAttackModifier(targetType: number): number {
    return this.attackModifiers[targetType.toString()] ?? 1.0;
  }

  /**
   * Get defense modifier against an attacker unit type.
   */
  public getDefenseModifier(attackerType: number): number {
    return this.defenseModifiers[attackerType.toString()] ?? 1.0;
  }

  private parseConstraints(rawConstraints: any[]): BaseUnitConstraint[] {
    return rawConstraints.map((c: any) => {
      switch (c.type) {
        case "impossible":
          return new ImpossibleConstraint();
        case "tech":
          return new ReqTechConstraint(c.value);
        case "cities":
          // Assuming basic.json just has IDs for now.
          // If we want names, we'd need a lookup or pass them in JSON.
          return new ReqCitiesConstraint(c.value);
        case "regions":
          const regionIds = (c.value as string[]).map((name) => RegionNameMap[name] || 0);
          return new ReqRegionsConstraint(regionIds, c.value);
        case "year":
          return new ReqMinRelYearConstraint(c.value);
        case "nationAux":
          return new ReqNationAuxConstraint(c.key, c.cmp, c.value);
        default:
          return new ImpossibleConstraint();
      }
    });
  }
}
