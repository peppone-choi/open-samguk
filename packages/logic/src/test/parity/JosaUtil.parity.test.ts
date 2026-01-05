import { describe, it, expect } from "vitest";
import { JosaUtil } from "@sammo-ts/common";

describe("JosaUtil Parity Tests", () => {
  describe("을/를 조사", () => {
    const testCases = [
      { text: "유비", expected: "를" },
      { text: "조조", expected: "를" },
      { text: "관우", expected: "를" },
      { text: "장비", expected: "를" },
      { text: "제갈량", expected: "을" },
      { text: "조운", expected: "을" },
      { text: "여포", expected: "를" },
      { text: "손권", expected: "을" },
      { text: "마초", expected: "를" },
      { text: "황충", expected: "을" },
      { text: "위연", expected: "을" },
      { text: "강유", expected: "를" },
      { text: "사마의", expected: "를" },
      { text: "노숙", expected: "을" },
      { text: "주유", expected: "를" },
      { text: "육손", expected: "을" },
    ];

    it.each(testCases)("$text -> $expected", ({ text, expected }) => {
      expect(JosaUtil.pick(text, "을")).toBe(expected);
    });
  });

  describe("이/가 조사", () => {
    const testCases = [
      { text: "유비", expected: "가" },
      { text: "손권", expected: "이" },
      { text: "조운", expected: "이" },
      { text: "관우", expected: "가" },
      { text: "제갈량", expected: "이" },
      { text: "장비", expected: "가" },
    ];

    it.each(testCases)("$text -> $expected", ({ text, expected }) => {
      expect(JosaUtil.pick(text, "이")).toBe(expected);
    });
  });

  describe("은/는 조사", () => {
    const testCases = [
      { text: "유비", expected: "는" },
      { text: "조운", expected: "은" },
      { text: "관우", expected: "는" },
      { text: "손권", expected: "은" },
    ];

    it.each(testCases)("$text -> $expected", ({ text, expected }) => {
      expect(JosaUtil.pick(text, "은")).toBe(expected);
    });
  });

  describe("으로/로 조사", () => {
    const testCases = [
      { text: "칼", expected: "로" }, // ㄹ 받침
      { text: "창", expected: "으로" },
      { text: "활", expected: "로" }, // ㄹ 받침
      { text: "도끼", expected: "로" }, // 받침 없음
      { text: "검", expected: "으로" },
      { text: "봉", expected: "으로" },
      { text: "할", expected: "로" }, // ㄹ 받침
    ];

    it.each(testCases)("$text -> $expected", ({ text, expected }) => {
      expect(JosaUtil.pick(text, "으로")).toBe(expected);
    });
  });

  describe("와/과 조사", () => {
    const testCases = [
      { text: "유비", expected: "와" },
      { text: "조운", expected: "과" },
      { text: "관우", expected: "와" },
      { text: "손권", expected: "과" },
    ];

    it.each(testCases)("$text -> $expected", ({ text, expected }) => {
      expect(JosaUtil.pick(text, "과")).toBe(expected);
    });
  });

  describe("이나/나 조사", () => {
    const testCases = [
      { text: "유비", expected: "나" },
      { text: "조운", expected: "이나" },
    ];

    it.each(testCases)("$text -> $expected", ({ text, expected }) => {
      expect(JosaUtil.pick(text, "이나")).toBe(expected);
    });
  });

  describe("이라/라 조사", () => {
    const testCases = [
      { text: "유비", expected: "라" },
      { text: "조운", expected: "이라" },
    ];

    it.each(testCases)("$text -> $expected", ({ text, expected }) => {
      expect(JosaUtil.pick(text, "이라")).toBe(expected);
    });
  });

  describe("이랑/랑 조사", () => {
    const testCases = [
      { text: "유비", expected: "랑" },
      { text: "조운", expected: "이랑" },
    ];

    it.each(testCases)("$text -> $expected", ({ text, expected }) => {
      expect(JosaUtil.pick(text, "이랑")).toBe(expected);
    });
  });

  describe("특수 케이스", () => {
    it("숫자로 끝나는 경우", () => {
      // JosaUtil 정규식에 버그가 있어서 숫자는 모두 받침 없음으로 처리됨
      expect(JosaUtil.pick("0", "을")).toBe("를");
      expect(JosaUtil.pick("3", "을")).toBe("를");
      expect(JosaUtil.pick("6", "을")).toBe("를");
    });

    it("영어로 끝나는 경우", () => {
      // 영어는 패턴 기반으로 처리
      expect(JosaUtil.pick("check", "을")).toBe("를"); // 정규식 예외
    });

    it("빈 문자열", () => {
      // 빈 문자열의 경우 받침 없음으로 처리
      expect(JosaUtil.pick("", "을")).toBe("를");
    });
  });

  describe("batch 처리", () => {
    it("여러 조사를 한번에 처리", () => {
      // batch 형식: ;body;filler;josa; (4개의 세미콜론, filler는 보통 빈 문자열)
      const template = ";유비;;을; 만나 ;조조;;이; 도망갔다";
      const result = JosaUtil.batch(template);
      expect(result).toBe("유비를 만나 조조가 도망갔다");
    });

    it("복잡한 문장 처리", () => {
      const template = ";관우;;이; ;유비;;을; 도와 ;조조;;과; 싸웠다";
      const result = JosaUtil.batch(template);
      expect(result).toBe("관우가 유비를 도와 조조와 싸웠다");
    });

    it("은/는 조사 포함 문장", () => {
      const template = ";제갈량;;은; ;지략;;으로; 유명하다";
      const result = JosaUtil.batch(template);
      expect(result).toBe("제갈량은 지략으로 유명하다");
    });

    it("조사가 없는 문장은 그대로 반환", () => {
      const template = "아무 조사가 없는 문장";
      const result = JosaUtil.batch(template);
      expect(result).toBe("아무 조사가 없는 문장");
    });

    it("여러 줄 문장 처리", () => {
      const template = `;유비;;이; 말했다.
;조조;;은; 대답했다.`;
      const result = JosaUtil.batch(template);
      expect(result).toBe(`유비가 말했다.
조조는 대답했다.`);
    });
  });

  describe("결정론 검증", () => {
    it("같은 입력에 항상 같은 결과", () => {
      const inputs = ["유비", "조조", "관우", "장비", "제갈량"];
      const josas = ["을", "이", "은", "으로", "과"];

      for (const input of inputs) {
        for (const josa of josas) {
          const result1 = JosaUtil.pick(input, josa);
          const result2 = JosaUtil.pick(input, josa);
          expect(result1).toBe(result2);
        }
      }
    });

    it("batch도 결정론적", () => {
      const template = ";유비;;을; 만나 ;조조;;이; 도망갔다";
      const result1 = JosaUtil.batch(template);
      const result2 = JosaUtil.batch(template);
      expect(result1).toBe(result2);
      expect(result1).toBe("유비를 만나 조조가 도망갔다");
    });
  });
});
