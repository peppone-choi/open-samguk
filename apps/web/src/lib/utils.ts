import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getKoreanInitials(text: string): string {
  const INITIALS = [
    "ㄱ",
    "ㄲ",
    "ㄴ",
    "ㄷ",
    "ㄸ",
    "ㄹ",
    "ㅁ",
    "ㅂ",
    "ㅃ",
    "ㅅ",
    "ㅆ",
    "ㅇ",
    "ㅈ",
    "ㅉ",
    "ㅊ",
    "ㅋ",
    "ㅌ",
    "ㅍ",
    "ㅎ",
  ];

  let result = "";
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    // 한글 음절 범위 (AC00 ~ D7A3)
    if (code >= 0xac00 && code <= 0xd7a3) {
      const initialIdx = Math.floor((code - 0xac00) / 588);
      result += INITIALS[initialIdx];
    } else {
      result += text[i];
    }
  }
  return result;
}
