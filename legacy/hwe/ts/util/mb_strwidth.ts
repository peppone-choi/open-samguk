//https://gist.github.com/demouth/3217440
/**
 * mb_strwidth
 * @see http://php.net/manual/function.mb-strwidth.php
 */
export function mb_strwidth(str: string): number {
  const l = str.length;
  let length = 0;
  for (let i = 0; i < l; i++) {
    const c = str.charCodeAt(i);
    if (0x0000 <= c && c <= 0x0019) {
      length += 0;
    } else if (0x0020 <= c && c <= 0x1fff) {
      length += 1;
    } else if (0x2000 <= c && c <= 0xff60) {
      length += 2;
    } else if (0xff61 <= c && c <= 0xff9f) {
      length += 1;
    } else if (0xffa0 <= c) {
      length += 2;
    }
  }
  return length;
}
