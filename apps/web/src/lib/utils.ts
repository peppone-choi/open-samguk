import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 이미지 서버 기본 URL
 * 환경변수로 설정 가능, 기본값은 JSDelivr CDN
 */
export const IMAGE_BASE_URL =
  process.env.NEXT_PUBLIC_IMAGE_URL ||
  "https://cdn.jsdelivr.net/gh/peppone-choi/samguk-image@master";

/**
 * 게임 이미지 경로 생성 (맵, 병종, 도시 등)
 * @param path - 이미지 상대 경로 (예: "game/map/che", "game/src/궁병.jpg")
 */
export function getGameImageUrl(path: string): string {
  return `${IMAGE_BASE_URL}/${path}`;
}

/**
 * 장수 아이콘 경로 생성
 * @param imgsvr - 아이콘 서버 타입 (0: 기본, 1: 커스텀 시나리오)
 * @param picture - 아이콘 파일명
 * @param iconSet - 아이콘 세트 (시나리오별 폴더명, 기본: "icons")
 */
export function getGeneralIconUrl(
  imgsvr: number,
  picture: string,
  iconSet: string = "icons"
): string {
  if (imgsvr === 1) {
    return `${IMAGE_BASE_URL}/${iconSet}/${picture}`;
  }
  return `${IMAGE_BASE_URL}/icons/${picture}`;
}

/**
 * 기본 아이콘 URL
 */
export const DEFAULT_ICON_URL = `${IMAGE_BASE_URL}/icons/default.jpg`;

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
