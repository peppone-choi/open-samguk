import { UnitData, UnitDataSchema } from "./scenario/schema.js";
import { GameUnit } from "./GameUnit.js";
import { readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

export class UnitRegistry {
  private static instance: UnitRegistry;
  private units: Map<number, GameUnit> = new Map();
  private lastLoadedSet: string | null = null;

  private constructor() {}

  public static getInstance(): UnitRegistry {
    if (!UnitRegistry.instance) {
      UnitRegistry.instance = new UnitRegistry();
    }
    return UnitRegistry.instance;
  }

  public async load(
    unitSetName: string = "basic",
    cityNameMap: Record<string, number> = {},
    regionNameMap: Record<string, number> = {}
  ): Promise<void> {
    if (this.lastLoadedSet === unitSetName) return;

    try {
      const __dirname = dirname(fileURLToPath(import.meta.url));
      // In source: packages/logic/src/domain/scenario/unit/*.json
      // In dist: packages/logic/dist/domain/scenario/unit/*.json
      const unitJsonPath = join(__dirname, "scenario", "unit", `${unitSetName}.json`);
      const content = await readFile(unitJsonPath, "utf-8");
      const rawData = JSON.parse(content);

      if (!Array.isArray(rawData)) {
        throw new Error(`Unit data for ${unitSetName} is not an array`);
      }

      this.units.clear();
      for (const item of rawData) {
        // Validate with Zod
        const parsed = UnitDataSchema.safeParse(item);
        if (!parsed.success) {
          console.error(`Failed to parse unit ${item.id} in set ${unitSetName}:`, parsed.error);
          continue;
        }

        const unit = new GameUnit(parsed.data, cityNameMap, regionNameMap);
        this.units.set(unit.id, unit);
      }

      this.lastLoadedSet = unitSetName;
      console.log(`Loaded ${this.units.size} units from set: ${unitSetName}`);
    } catch (e) {
      console.error(`Failed to load unit registry for set ${unitSetName}:`, e);
      throw e;
    }
  }

  public getUnit(id: number): GameUnit | undefined {
    return this.units.get(id);
  }

  public getAllUnits(): GameUnit[] {
    return Array.from(this.units.values());
  }

  public getUnitsByType(type: number): GameUnit[] {
    return this.getAllUnits().filter((u) => u.type === type);
  }
}
