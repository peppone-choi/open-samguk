import { splitString, uniord } from "../string/StringUtil.js";

const KO_START_CODE = 44032;
const KO_FINISH_CODE = 55203;
const HANJA_START_CODE = 0x4e00;
const HANJA_FINISH_CODE = 0xfa0b;
const REG_INVALID_CHAR_W_HANJA = /[^a-zA-Z0-9ㄱ-ㅎ가-힣一-廓\s]+/gu;
const REG_INVALID_CHAR = /[^a-zA-Z0-9ㄱ-ㅎ가-힣\s]+/gu;
const REG_TARGET_CHAR = /^[\s\S]*?(\S*)\s*$/u;

const PRE_REG_NORMAL_FIXED = ["check|[hm]ook|limit"];
const PRE_REG_SPECIAL_CHAR = [
  "[ㄱ-ㄷㅁ-ㅎ]",
  "^[036]",
  "[^a-zA-Z][036]",
  "[a-zA-Z]9",
  "^[mn]",
  "\\S[mn]e?",
  "\\S(?:[aeiom]|lu)b",
  "(?:u|\\S[aei]|[^o]o)p",
  "(?:^i|[^auh]i|\\Su|[^ei][ae]|[^oi]o)t",
  "(?:\\S[iou]|[^e][ae])c?k",
  "\\S[aeiou](?:c|ng)",
  "foot|go+d|b[ai]g|private",
  "^(?:app|kor)",
];
const PRE_REG_SPECIAL_RO = ["[178ㄹ]", "^[lr]", "^\\Sr", "\\Sle?"];

const DEFAULT_POSTPOSITION: Record<string, string> = {
  은: "는",
  이: "가",
  과: "와",
  이나: "나",
  을: "를",
  으로: "로",
  이라: "라",
  이랑: "랑",
};

// 종성이 있는 한자들 (PHP 레거시에서 포팅)
const JONGSUNG_HANJA = new Set([
  0x523b, 0x5374, 0x5404, 0x606a, 0x6164, 0x6bbc, 0x73cf, 0x811a, 0x89ba, 0x89d2, 0x95a3, 0x4f83,
  0x520a, 0x58be, 0x5978, 0x59e6, 0x5e72, 0x5e79, 0x61c7, 0x63c0, 0x6746, 0x67ec, 0x687f, 0x6f97,
  0x764e, 0x770b, 0x78f5, 0x7a08, 0x7aff, 0x7c21, 0x809d, 0x826e, 0x8271, 0x8aeb, 0x9593, 0x4e6b,
  0x559d, 0x66f7, 0x6e34, 0x78a3, 0x7aed, 0x845b, 0x8910, 0x874e, 0x97a8, 0x52d8, 0x574e, 0x582a,
  0x5d4c, 0x611f, 0x61be, 0x6221, 0x6562, 0x67d1, 0x6a44, 0x6e1b, 0x7518, 0x75b3, 0x76e3, 0x77b0,
  0x7d3a, 0x90af, 0x9451, 0x9452, 0x9f95,
  // ... 나머지 한자 코드 생략 (실제 구현에서는 전체 목록 사용)
]);

// '로'로 끝나는 한자들
const RO_HANJA = new Set([
  0x4e6b, 0x559d, 0x66f7, 0x6e34, 0x78a3, 0x7aed, 0x845b, 0x8910, 0x874e, 0x97a8, 0x4e5e, 0x5091,
  0x6770, 0x6840, 0x6289, 0x6c7a, 0x6f54, 0x7d50, 0x7f3a, 0x8a23, 0x6c68,
  // ... 나머지 한자 코드 생략
]);

let regNormalFixed: RegExp;
let regSpecialChar: RegExp;
let regSpecialRo: RegExp;
let mapPostPosition: Map<string, string>;
let initialized = false;

function init(): void {
  if (initialized) return;
  initialized = true;

  regNormalFixed = new RegExp(`(?:${PRE_REG_NORMAL_FIXED.join("|")})$`, "iu");
  regSpecialChar = new RegExp(`(?:${PRE_REG_SPECIAL_CHAR.join("|")})$`, "iu");
  regSpecialRo = new RegExp(`(?:${PRE_REG_SPECIAL_RO.join("|")})$`, "iu");

  mapPostPosition = new Map();
  for (const [wJongsung, woJongsung] of Object.entries(DEFAULT_POSTPOSITION)) {
    mapPostPosition.set(`(${wJongsung})${woJongsung}`, wJongsung);
    mapPostPosition.set(wJongsung, wJongsung);
    mapPostPosition.set(woJongsung, wJongsung);
  }
}

function checkText(text: string, isRo: boolean): boolean {
  init();
  if (regNormalFixed.test(text)) return false;
  if (regSpecialChar.test(text)) return true;
  if (!isRo && regSpecialRo.test(text)) return true;
  return false;
}

function checkCode(code: number, isRo: boolean): boolean {
  const jongsung = (code - KO_START_CODE) % 28;
  if (jongsung === 0) return false;
  if (isRo && jongsung === 8) return false;
  return true;
}

/**
 * 텍스트가 종성으로 끝나는지 확인
 */
export function check(text: string, type: string): boolean {
  init();

  const htarget = text.replace(REG_INVALID_CHAR_W_HANJA, " ").replace(REG_TARGET_CHAR, "$1");

  if (!htarget) return false;

  const isRo = type === "으로" || type === "로";

  // 한자 로직
  const hcodeChars = splitString(htarget);
  const hcode = uniord(hcodeChars[hcodeChars.length - 1]);

  if (HANJA_START_CODE <= hcode && hcode <= HANJA_FINISH_CODE) {
    if (isRo && RO_HANJA.has(hcode)) return false;
    if (JONGSUNG_HANJA.has(hcode)) return true;
    if (hcode < KO_START_CODE || KO_FINISH_CODE < hcode) return false;
  }

  const target = text.replace(REG_INVALID_CHAR, " ").replace(REG_TARGET_CHAR, "$1");

  const codeChars = splitString(target);
  const code = uniord(codeChars[codeChars.length - 1]);

  if (KO_START_CODE <= code && code <= KO_FINISH_CODE) {
    return checkCode(code, isRo);
  }

  return checkText(target, isRo);
}

/**
 * 텍스트에 맞는 조사 선택
 *
 * @param text - 조사를 붙일 텍스트
 * @param wJongsung - 종성이 있을 때의 조사 (은, 이, 과, 이나, 을, 으로, 이라, 이랑)
 * @param woJongsung - 종성이 없을 때의 조사 (생략 시 자동 매핑)
 */
export function pick(text: string | null | undefined, wJongsung: string, woJongsung = ""): string {
  init();

  const normalizedText = text == null ? "" : String(text);

  if (!woJongsung) {
    const mapped = mapPostPosition.get(wJongsung);
    if (!mapped) {
      throw new Error("올바르지 않은 조사 지정");
    }
    const actualWJongsung = mapped;
    const actualWoJongsung = DEFAULT_POSTPOSITION[actualWJongsung];
    return check(normalizedText, actualWJongsung) ? actualWJongsung : actualWoJongsung;
  }

  return check(normalizedText, wJongsung) ? wJongsung : woJongsung;
}

/**
 * 텍스트에 적절한 조사를 붙여 반환
 */
export function put(text: string, wJongsung: string, woJongsung = ""): string {
  return text + pick(text, wJongsung, woJongsung);
}

/**
 * 조사 선택 함수를 미리 바인딩하여 반환
 */
export function fix(wJongsung: string, woJongsung = ""): (text: string) => string {
  init();

  let actualWJongsung = wJongsung;
  let actualWoJongsung = woJongsung;

  if (!woJongsung) {
    const mapped = mapPostPosition.get(wJongsung);
    if (!mapped) {
      throw new Error("올바르지 않은 조사 지정");
    }
    actualWJongsung = mapped;
    actualWoJongsung = DEFAULT_POSTPOSITION[actualWJongsung];
  }

  return (text: string) => put(text, actualWJongsung, actualWoJongsung);
}

/**
 * 텍스트 내의 조사 마커를 일괄 처리
 *
 * @param text - 처리할 텍스트
 * @param decorator - 구분자 (기본값: ';')
 * @example batch(";바람;은;") => "바람은"
 */
export function batch(text: string, decorator = ";"): string {
  init();

  const escapedDecorator =
    decorator === ";" ? ";" : decorator.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(
    `${escapedDecorator}([^${escapedDecorator}]+)${escapedDecorator}`,
    "g"
  );

  const matches: Array<{ full: string; content: string; index: number }> = [];
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    matches.push({
      full: match[0],
      content: match[1],
      index: match.index,
    });
  }

  let matchCnt = matches.length;
  if (matchCnt & 1) matchCnt -= 1;
  if (matchCnt === 0) return text;

  const result: string[] = [];
  let prePos = 0;

  for (let matchIdx = 0; matchIdx < matchCnt; matchIdx += 2) {
    const bodyMatch = matches[matchIdx];
    const josaMatch = matches[matchIdx + 1];

    if (bodyMatch.index > prePos) {
      result.push(text.slice(prePos, bodyMatch.index));
    }
    prePos = bodyMatch.index + bodyMatch.full.length;
    result.push(bodyMatch.content);

    if (josaMatch.index > prePos) {
      result.push(text.slice(prePos, josaMatch.index));
    }
    prePos = josaMatch.index + josaMatch.full.length;

    const pickedJosa = pick(bodyMatch.content, josaMatch.content);
    result.push(pickedJosa);
  }

  if (prePos < text.length) {
    result.push(text.slice(prePos));
  }

  return result.join("");
}

export const JosaUtil = {
  check,
  pick,
  put,
  fix,
  batch,
};
