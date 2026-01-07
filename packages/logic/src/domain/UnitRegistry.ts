import { UnitData, UnitDataSchema } from "./scenario/schema.js";
import { GameUnit } from "./GameUnit.js";
import { readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

export class UnitRegistry {
  private static instance: UnitRegistry;
  private units: Map<number, GameUnit> = new Map();
  private loaded: boolean = false;

  private constructor() {}

  public static getInstance(): UnitRegistry {
    if (!UnitRegistry.instance) {
      UnitRegistry.instance = new UnitRegistry();
    }
    return UnitRegistry.instance;
  }

  public async load(): Promise<void> {
    if (this.loaded) return;

    try {
      const __dirname = dirname(fileURLToPath(import.meta.url));
      // Path relative to built file: packages/logic/dist/domain/UnitRegistry.js
      // We need to access src/domain/scenario/unit/basic.json or copy it to dist.
      // Assuming resource loading pattern for now, trying to resolve from source location if dev, or dist if prod.
      // But standard approach in this project seems to be reading from a known path or importing.
      // Since it's a JSON file, dynamic import might be tricky with assertions in recent Node.
      // Let's rely on fs read from a computed path.

      // Attempt to locate the file. If we are in dist/domain, we need to go up and find scenario/unit/basic.json.
      // In source: packages/logic/src/domain/scenario/unit/basic.json
      // Let's assume the file is copied to dist/domain/scenario/unit/basic.json during build
      // OR we just point to the source for now if running local dev.
      // Given the environment, let's look relative to this file.

      const basicJsonPath = join(__dirname, "scenario", "unit", "basic.json");
      const content = await readFile(basicJsonPath, "utf-8");
      const rawData = JSON.parse(content);

      if (!Array.isArray(rawData)) {
        throw new Error("Unit data is not an array");
      }

      for (const item of rawData) {
        // Validate with Zod
        const parsed = UnitDataSchema.safeParse(item);
        if (!parsed.success) {
          console.error(`Failed to parse unit ${item.id}:`, parsed.error);
          continue;
        }

        const unit = new GameUnit(parsed.data);
        this.units.set(unit.id, unit);
      }

      this.loaded = true;
      console.log(`Loaded ${this.units.size} units.`);
    } catch (e) {
      console.error("Failed to load unit registry:", e);
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
