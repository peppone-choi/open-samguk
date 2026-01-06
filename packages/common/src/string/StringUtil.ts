/**
 * 유니코드 문자의 코드포인트 반환
 */
export function uniord(c: string): number {
  const code = c.codePointAt(0);
  return code ?? 0;
}

/**
 * 문자열을 개별 유니코드 문자 배열로 분리
 */
export function splitString(str: string): string[] {
  return [...str];
}
