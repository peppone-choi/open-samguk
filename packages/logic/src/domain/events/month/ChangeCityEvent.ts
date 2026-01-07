import { GameEvent, EventTarget } from "../types.js";
import { WorldSnapshot, WorldDelta, City } from "../../entities.js";

/**
 * 도시 속성 변경 이벤트
 * 레거시: ChangeCity.php
 */
export class ChangeCityEvent implements GameEvent {
  public id = "change_city_event";
  public name = "도시 속성 변경";
  public target = EventTarget.MONTH;
  public priority = 50;

  constructor(
    private targetCriteria: string | [string, ...any[]] = "all",
    private actions: Record<string, any> = {}
  ) {}

  condition(): boolean {
    return true;
  }

  action(snapshot: WorldSnapshot): WorldDelta {
    const delta: WorldDelta = {
      cities: {},
    };

    const targetCityIds = this.getTargetCityIds(snapshot);

    for (const cityId of targetCityIds) {
      const city = snapshot.cities[cityId];
      if (!city) continue;

      const cityDelta: any = {};
      let changed = false;

      for (const [key, value] of Object.entries(this.actions)) {
        const newValue = this.calculateNewValue(city, key, value);
        if (newValue !== undefined) {
          cityDelta[key] = newValue;
          changed = true;
        }
      }

      if (changed) {
        delta.cities![cityId] = cityDelta;
      }
    }

    return delta;
  }

  private getTargetCityIds(snapshot: WorldSnapshot): number[] {
    const allCities = Object.values(snapshot.cities);

    if (this.targetCriteria === "all") {
      return allCities.map((c) => c.id);
    }

    const type = Array.isArray(this.targetCriteria) ? this.targetCriteria[0] : this.targetCriteria;
    const args = Array.isArray(this.targetCriteria) ? this.targetCriteria.slice(1) : [];

    switch (type) {
      case "free":
        return allCities.filter((c) => c.nationId === 0).map((c) => c.id);
      case "occupied":
        return allCities.filter((c) => c.nationId !== 0).map((c) => c.id);
      case "cities":
        // args contains city names or IDs
        return allCities
          .filter((c) => args.includes(c.id) || args.includes(c.name))
          .map((c) => c.id);
      default:
        return [];
    }
  }

  private calculateNewValue(city: City, key: string, value: any): any {
    const currentValue = (city as any)[key];
    if (currentValue === undefined) return undefined;

    if (typeof value === "number") {
      // If integer, direct set. If float, it's a multiplier.
      // Legacy php uses is_float check. In TS, number is unified.
      // But we can check if it has decimals.
      if (Number.isInteger(value)) return value;
      return Math.floor(currentValue * value);
    }

    if (typeof value === "string") {
      // Percent check: 120%
      if (value.endsWith("%")) {
        const percent = parseFloat(value.replace("%", "")) / 100;
        const maxKey = `${key}Max`;
        const maxVal = (city as any)[maxKey] || 100;
        return Math.floor(maxVal * percent);
      }

      // Math check: +30, -50, *1.2, /2
      const match = value.match(/^([\+\-\/\*])(\d+(\.\d+)?)$/);
      if (match) {
        const op = match[1];
        const val = parseFloat(match[2]);
        switch (op) {
          case "+":
            return Math.floor(currentValue + val);
          case "-":
            return Math.max(0, Math.floor(currentValue - val));
          case "*":
            return Math.floor(currentValue * val);
          case "/":
            return val === 0 ? currentValue : Math.floor(currentValue / val);
        }
      }
    }

    return value; // Default direct set
  }
}
