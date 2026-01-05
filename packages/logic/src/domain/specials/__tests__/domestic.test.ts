import { describe, it, expect } from "vitest";
import { FarmingSpecial } from "../domestic/FarmingSpecial";
import { CommerceSpecial } from "../domestic/CommerceSpecial";
import { InventionSpecial } from "../domestic/InventionSpecial";
import { NoSpecialDomestic } from "../domestic/NoSpecialDomestic";

describe("Domestic Specials", () => {
  describe("FarmingSpecial (경작)", () => {
    const special = new FarmingSpecial();

    it("should have correct id and name", () => {
      expect(special.id).toBe(1);
      expect(special.name).toBe("경작");
    });

    it("should apply score x1.1 on 농업 turn", () => {
      const result = special.onCalcDomestic("농업", "score", 100);
      expect(result).toBeCloseTo(110);
    });

    it("should apply cost x0.8 on 농업 turn", () => {
      const result = special.onCalcDomestic("농업", "cost", 100);
      expect(result).toBe(80);
    });

    it("should apply success +0.1 on 농업 turn", () => {
      const result = special.onCalcDomestic("농업", "success", 0.5);
      expect(result).toBeCloseTo(0.6);
    });

    it("should not modify on other turn types", () => {
      const result = special.onCalcDomestic("상업", "score", 100);
      expect(result).toBe(100);
    });
  });

  describe("CommerceSpecial (상재)", () => {
    const special = new CommerceSpecial();

    it("should have correct id and name", () => {
      expect(special.id).toBe(2);
      expect(special.name).toBe("상재");
    });

    it("should apply score x1.1 on 상업 turn", () => {
      const result = special.onCalcDomestic("상업", "score", 100);
      expect(result).toBeCloseTo(110);
    });

    it("should apply cost x0.8 on 상업 turn", () => {
      const result = special.onCalcDomestic("상업", "cost", 100);
      expect(result).toBe(80);
    });

    it("should apply success +0.1 on 상업 turn", () => {
      const result = special.onCalcDomestic("상업", "success", 0.5);
      expect(result).toBeCloseTo(0.6);
    });

    it("should not modify on other turn types", () => {
      const result = special.onCalcDomestic("농업", "score", 100);
      expect(result).toBe(100);
    });
  });

  describe("InventionSpecial (발명)", () => {
    const special = new InventionSpecial();

    it("should have correct id and name", () => {
      expect(special.id).toBe(3);
      expect(special.name).toBe("발명");
    });

    it("should apply score x1.1 on 기술 turn", () => {
      const result = special.onCalcDomestic("기술", "score", 100);
      expect(result).toBeCloseTo(110);
    });

    it("should apply cost x0.8 on 기술 turn", () => {
      const result = special.onCalcDomestic("기술", "cost", 100);
      expect(result).toBe(80);
    });

    it("should apply success +0.1 on 기술 turn", () => {
      const result = special.onCalcDomestic("기술", "success", 0.5);
      expect(result).toBeCloseTo(0.6);
    });

    it("should not modify on other turn types", () => {
      const result = special.onCalcDomestic("농업", "score", 100);
      expect(result).toBe(100);
    });
  });

  describe("NoSpecialDomestic", () => {
    const special = new NoSpecialDomestic();

    it("should have correct id and name", () => {
      expect(special.id).toBe(0);
      expect(special.name).toBe("-");
    });

    it("should not modify any values", () => {
      expect(special.onCalcDomestic("농업", "score", 100)).toBe(100);
      expect(special.onCalcDomestic("상업", "cost", 50)).toBe(50);
      expect(special.onCalcDomestic("기술", "success", 0.7)).toBe(0.7);
    });
  });
});
