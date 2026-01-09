import { describe, it, expect, beforeEach } from "vitest";
import {
  UnificationCheckEvent,
  UnificationPostProcessEvent,
  FinalizeRankingEvent,
} from "./UnificationCheckEvent.js";
import { EventTarget } from "../../enums/EventTarget.js";
import { createMockWorldSnapshot, createMockNation } from "../../test-utils.js";

describe("UnificationCheckEvent", () => {
  let event: UnificationCheckEvent;

  beforeEach(() => {
    event = new UnificationCheckEvent();
  });

  describe("metadata", () => {
    it("should have correct id", () => {
      expect(event.id).toBe("unification_check_event");
    });

    it("should have correct name", () => {
      expect(event.name).toBe("천하통일 검사");
    });

    it("should target Month", () => {
      expect(event.target).toBe(EventTarget.Month);
    });

    it("should have high priority (5)", () => {
      expect(event.priority).toBe(5);
    });
  });

  describe("condition", () => {
    it("should return false if already unified", () => {
      const snapshot = createMockWorldSnapshot({
        env: { isUnited: true },
      });
      expect(event.condition(snapshot)).toBe(false);
    });

    it("should return true when no active nations remain", () => {
      const snapshot = createMockWorldSnapshot({
        nations: {},
      });
      expect(event.condition(snapshot)).toBe(true);
    });

    it("should return true when only one active nation remains", () => {
      const snapshot = createMockWorldSnapshot({
        nations: {
          1: { name: "위" },
        },
      });
      expect(event.condition(snapshot)).toBe(true);
    });

    it("should return false when multiple active nations exist", () => {
      const snapshot = createMockWorldSnapshot({
        nations: {
          1: { name: "위" },
          2: { name: "촉" },
        },
      });
      expect(event.condition(snapshot)).toBe(false);
    });

    it("should exclude neutral nation (id=0) from count", () => {
      const snapshot = createMockWorldSnapshot({
        nations: {
          0: { name: "중립" },
          1: { name: "위" },
        },
      });
      expect(event.condition(snapshot)).toBe(true);
    });

    it("should exclude invader nations from count", () => {
      const snapshot = createMockWorldSnapshot({
        nations: {
          1: { name: "위" },
          2: { name: "이민족", aux: { isInvader: true } },
        },
      });
      expect(event.condition(snapshot)).toBe(true);
    });

    it("should exclude Yellow Turbans from count", () => {
      const snapshot = createMockWorldSnapshot({
        nations: {
          1: { name: "위" },
          2: { name: "황건적", aux: { isYellowTurbans: true } },
        },
      });
      expect(event.condition(snapshot)).toBe(true);
    });

    it("should count multiple regular nations", () => {
      const snapshot = createMockWorldSnapshot({
        nations: {
          0: { name: "중립" },
          1: { name: "위" },
          2: { name: "촉" },
          3: { name: "이민족", aux: { isInvader: true } },
        },
      });
      expect(event.condition(snapshot)).toBe(false);
    });
  });

  describe("action", () => {
    it("should return game over delta when no nations remain", () => {
      const snapshot = createMockWorldSnapshot({
        nations: {},
        gameTime: { year: 250, month: 6 },
      });

      const delta = event.action(snapshot);

      expect(delta.env?.isUnited).toBe(true);
      expect(delta.env?.unificationDate).toEqual({ year: 250, month: 6 });
      expect(delta.env?.unifiedBy).toBeNull();
      expect(delta.logs?.global).toContainEqual(expect.stringContaining("모든 국가가 멸망"));
    });

    it("should return unification delta when one nation remains", () => {
      const snapshot = createMockWorldSnapshot({
        nations: {
          1: { name: "위" },
        },
        gameTime: { year: 250, month: 6 },
      });

      const delta = event.action(snapshot);

      expect(delta.env?.isUnited).toBe(true);
      expect(delta.env?.unificationDate).toEqual({ year: 250, month: 6 });
      expect(delta.env?.unifiedBy).toBe(1);
      expect(delta.logs?.global).toContainEqual(expect.stringContaining("천하통일"));
      expect(delta.logs?.global).toContainEqual(expect.stringContaining("위"));
    });

    it("should include year and month in unification log", () => {
      const snapshot = createMockWorldSnapshot({
        nations: {
          1: { name: "촉한" },
        },
        gameTime: { year: 263, month: 12 },
      });

      const delta = event.action(snapshot);

      expect(delta.logs?.global?.some((log) => log.includes("263년 12월"))).toBe(true);
    });

    it("should correctly identify winner excluding invaders", () => {
      const snapshot = createMockWorldSnapshot({
        nations: {
          1: { name: "위" },
          2: { name: "이민족", aux: { isInvader: true } },
        },
        gameTime: { year: 250, month: 1 },
      });

      const delta = event.action(snapshot);

      expect(delta.env?.unifiedBy).toBe(1);
    });
  });
});

describe("UnificationPostProcessEvent", () => {
  let event: UnificationPostProcessEvent;

  beforeEach(() => {
    event = new UnificationPostProcessEvent();
  });

  describe("metadata", () => {
    it("should have correct id", () => {
      expect(event.id).toBe("unification_post_process_event");
    });

    it("should have correct name", () => {
      expect(event.name).toBe("통일 후속 처리");
    });

    it("should target United", () => {
      expect(event.target).toBe(EventTarget.United);
    });

    it("should have priority 10", () => {
      expect(event.priority).toBe(10);
    });
  });

  describe("condition", () => {
    it("should always return true (United target handles filtering)", () => {
      const snapshot = createMockWorldSnapshot({
        env: { isUnited: true },
      });
      expect(event.condition(snapshot)).toBe(true);
    });
  });

  describe("action", () => {
    it("should return log about inheritance point settlement", () => {
      const snapshot = createMockWorldSnapshot({
        env: { isUnited: true },
      });

      const delta = event.action(snapshot);

      expect(delta.logs?.global).toContainEqual(expect.stringContaining("유산 포인트가 정산"));
    });
  });
});

describe("FinalizeRankingEvent", () => {
  let event: FinalizeRankingEvent;

  beforeEach(() => {
    event = new FinalizeRankingEvent();
  });

  describe("metadata", () => {
    it("should have correct id", () => {
      expect(event.id).toBe("finalize_ranking_event");
    });

    it("should have correct name", () => {
      expect(event.name).toBe("랭킹 확정");
    });

    it("should target United", () => {
      expect(event.target).toBe(EventTarget.United);
    });

    it("should have priority 20", () => {
      expect(event.priority).toBe(20);
    });
  });

  describe("condition", () => {
    it("should always return true", () => {
      const snapshot = createMockWorldSnapshot({
        env: { isUnited: true },
      });
      expect(event.condition(snapshot)).toBe(true);
    });
  });

  describe("action", () => {
    it("should set rankingFinalized to true", () => {
      const snapshot = createMockWorldSnapshot({
        env: { isUnited: true },
      });

      const delta = event.action(snapshot);

      expect(delta.env?.rankingFinalized).toBe(true);
    });

    it("should set rankingFinalizedDate", () => {
      const snapshot = createMockWorldSnapshot({
        env: { isUnited: true },
      });

      const delta = event.action(snapshot);

      expect(delta.env?.rankingFinalizedDate).toBeDefined();
      expect(typeof delta.env?.rankingFinalizedDate).toBe("string");
    });

    it("should return log about ranking finalization", () => {
      const snapshot = createMockWorldSnapshot({
        env: { isUnited: true },
      });

      const delta = event.action(snapshot);

      expect(delta.logs?.global).toContainEqual(expect.stringContaining("최종 랭킹이 확정"));
    });
  });
});
