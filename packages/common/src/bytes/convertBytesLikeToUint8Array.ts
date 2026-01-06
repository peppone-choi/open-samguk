import type { BytesLike } from "../types/BytesLike.js";

/**
 * BytesLike 타입을 Uint8Array로 변환
 *
 * @param bytes - 변환할 바이트 데이터
 * @returns Uint8Array
 */
export function convertBytesLikeToUint8Array(bytes: BytesLike): Uint8Array {
  if (bytes instanceof Uint8Array) {
    return bytes;
  }

  if (bytes instanceof ArrayBuffer) {
    return new Uint8Array(bytes);
  }

  if (Array.isArray(bytes)) {
    return new Uint8Array(bytes);
  }

  // string인 경우 UTF-8로 인코딩
  if (typeof bytes === "string") {
    const encoder = new TextEncoder();
    return encoder.encode(bytes);
  }

  throw new Error(`지원하지 않는 바이트 타입: ${typeof bytes}`);
}
