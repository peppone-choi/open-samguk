import { createHash } from "node:crypto";
import type { RNG } from "./RNG.js";

/**
 * SHA-512 기반 결정론적 난수 생성기
 *
 * Reseed를 하지 않는 단순한 형태의 Hash-based DRBG
 * 동일한 seed와 state로 생성하면 항상 같은 난수 시퀀스를 생성
 *
 * JavaScript의 Number.MAX_SAFE_INTEGER 제한(53비트)을 준수
 */
export class LiteHashDRBG implements RNG {
  /** JavaScript에서 안전하게 지원하는 최대 정수 비트 수 */
  static readonly MAX_RNG_SUPPORT_BIT = 53;
  /** 지원하는 최대 정수 값 (Number.MAX_SAFE_INTEGER = 2^53 - 1) */
  static readonly MAX_INT = Number.MAX_SAFE_INTEGER;
  /** SHA-512 해시 출력 크기 (바이트) */
  static readonly BUFFER_BYTE_SIZE = 512 / 8; // 64 bytes

  /** 비트 마스크 → 비트 수 매핑 테이블 */
  private static readonly INT_BIT_MASK_MAP = new Map<number, number>([
    [0x1, 1],
    [0x3, 2],
    [0x7, 3],
    [0xf, 4],
    [0x1f, 5],
    [0x3f, 6],
    [0x7f, 7],
    [0xff, 8],
    [0x1ff, 9],
    [0x3ff, 10],
    [0x7ff, 11],
    [0xfff, 12],
    [0x1fff, 13],
    [0x3fff, 14],
    [0x7fff, 15],
    [0xffff, 16],
    [0x1_ffff, 17],
    [0x3_ffff, 18],
    [0x7_ffff, 19],
    [0xf_ffff, 20],
    [0x1f_ffff, 21],
    [0x3f_ffff, 22],
    [0x7f_ffff, 23],
    [0xff_ffff, 24],
    [0x1ff_ffff, 25],
    [0x3ff_ffff, 26],
    [0x7ff_ffff, 27],
    [0xfff_ffff, 28],
    [0x1fff_ffff, 29],
    [0x3fff_ffff, 30],
    [0x7fff_ffff, 31],
    [0xffff_ffff, 32],
    // 32비트 이상은 BigInt로 처리 후 Number로 변환 필요
    // JavaScript에서 비트 연산은 32비트로 제한되므로 별도 처리
  ]);

  private readonly seed: Uint8Array;
  private buffer: Uint8Array;
  private bufferIdx: number;
  private stateIdx: number;

  /**
   * LiteHashDRBG 생성
   *
   * @param seed - 시드 값 (문자열 또는 바이트 배열)
   * @param stateIdx - 상태 인덱스 (기본값: 0)
   * @param bufferIdx - 버퍼 인덱스 (기본값: 0)
   */
  constructor(seed: string | Uint8Array, stateIdx = 0, bufferIdx = 0) {
    if (bufferIdx < 0) {
      throw new Error(`bufferIdx ${bufferIdx} < 0`);
    }
    if (bufferIdx >= LiteHashDRBG.BUFFER_BYTE_SIZE) {
      throw new Error(`bufferIdx ${bufferIdx} >= ${LiteHashDRBG.BUFFER_BYTE_SIZE}`);
    }
    if (stateIdx < 0) {
      throw new Error(`stateIdx ${stateIdx} < 0`);
    }

    // seed를 바이트 배열로 변환
    if (typeof seed === "string") {
      this.seed = new TextEncoder().encode(seed);
    } else {
      this.seed = seed;
    }

    this.stateIdx = stateIdx;
    this.buffer = new Uint8Array(LiteHashDRBG.BUFFER_BYTE_SIZE);
    this.bufferIdx = 0;

    this.genNextBlock();
    this.bufferIdx = bufferIdx;
  }

  /**
   * 빌더 패턴으로 LiteHashDRBG 생성
   */
  static build(seed: string | Uint8Array, idx = 0): LiteHashDRBG {
    return new LiteHashDRBG(seed, idx);
  }

  /**
   * 다음 SHA-512 블록 생성
   */
  private genNextBlock(): void {
    // seed + stateIdx (little endian 32비트)를 해시
    const stateIdxBytes = new Uint8Array(4);
    const view = new DataView(stateIdxBytes.buffer);
    view.setUint32(0, this.stateIdx, true); // little endian

    const combined = new Uint8Array(this.seed.length + 4);
    combined.set(this.seed);
    combined.set(stateIdxBytes, this.seed.length);

    const hash = createHash("sha512");
    hash.update(combined);
    this.buffer = new Uint8Array(hash.digest());
    this.bufferIdx = 0;
    this.stateIdx += 1;
  }

  getMaxInt(): number {
    return LiteHashDRBG.MAX_INT;
  }

  /**
   * 비트 마스크 계산 (n보다 크거나 같은 가장 작은 2^k - 1)
   */
  private static calcBitMask(n: number): number {
    let result = n;
    result |= result >>> 1;
    result |= result >>> 2;
    result |= result >>> 4;
    result |= result >>> 8;
    result |= result >>> 16;
    // JavaScript 비트 연산은 32비트 제한이므로 여기서 멈춤
    return result >>> 0; // unsigned로 변환
  }

  /**
   * 비트 마스크에 대응하는 비트 수 계산
   */
  private static getBitsForMask(mask: number): number {
    // 테이블에서 찾기
    const bits = LiteHashDRBG.INT_BIT_MASK_MAP.get(mask);
    if (bits !== undefined) {
      return bits;
    }

    // 테이블에 없으면 계산 (33~53비트 범위)
    let count = 0;
    let n = mask;
    while (n > 0) {
      count++;
      n >>>= 1;
    }
    return count;
  }

  nextBytes(bytes: number): Uint8Array {
    if (bytes <= 0) {
      throw new Error(`bytes must be positive: ${bytes}`);
    }

    // 버퍼 내에서 충분히 읽을 수 있는 경우
    if (this.bufferIdx + bytes <= LiteHashDRBG.BUFFER_BYTE_SIZE) {
      const result = this.buffer.slice(this.bufferIdx, this.bufferIdx + bytes);
      this.bufferIdx += bytes;
      if (this.bufferIdx === LiteHashDRBG.BUFFER_BYTE_SIZE) {
        this.genNextBlock();
      }
      return result;
    }

    // 여러 블록에 걸쳐 읽어야 하는 경우
    const result = new Uint8Array(bytes);
    let resultIdx = 0;

    // 현재 버퍼의 남은 부분 복사
    const remaining = LiteHashDRBG.BUFFER_BYTE_SIZE - this.bufferIdx;
    result.set(this.buffer.slice(this.bufferIdx), resultIdx);
    resultIdx += remaining;
    let bytesLeft = bytes - remaining;

    // 추가 블록 읽기
    while (bytesLeft > LiteHashDRBG.BUFFER_BYTE_SIZE) {
      this.genNextBlock();
      result.set(this.buffer, resultIdx);
      resultIdx += LiteHashDRBG.BUFFER_BYTE_SIZE;
      bytesLeft -= LiteHashDRBG.BUFFER_BYTE_SIZE;
    }

    this.genNextBlock();
    if (bytesLeft === 0) {
      return result;
    }

    result.set(this.buffer.slice(0, bytesLeft), resultIdx);
    this.bufferIdx = bytesLeft;
    return result;
  }

  nextBits(bits: number): Uint8Array {
    const bytes = (bits + 7) >>> 3;
    const headBits = bits & 0x7;

    const buffer = this.nextBytes(bytes);
    if (headBits === 0) {
      return buffer;
    }

    // 마지막 바이트의 상위 비트를 마스킹
    buffer[bytes - 1] &= 0xff >>> (8 - headBits);
    return buffer;
  }

  /**
   * 바이트 배열을 64비트 unsigned 정수로 파싱 (little endian)
   * JavaScript의 53비트 제한으로 인해 BigInt 사용 후 Number 변환
   */
  private static parseU64(buffer: Uint8Array): number {
    let result = BigInt(0);
    for (let i = 0; i < Math.min(buffer.length, 8); i++) {
      result |= BigInt(buffer[i]) << BigInt(i * 8);
    }
    return Number(result);
  }

  /**
   * 지정된 비트 수만큼의 난수 정수 생성 (내부용)
   */
  private _nextInt(bits: number): number {
    // bits만큼 읽고, 8바이트로 패딩
    const rawBuffer = this.nextBits(bits);
    const buffer = new Uint8Array(8);
    buffer.set(rawBuffer);
    return LiteHashDRBG.parseU64(buffer);
  }

  nextInt(max?: number | null): number {
    // max가 없거나 MAX_INT인 경우
    if (max === null || max === undefined || max === LiteHashDRBG.MAX_INT) {
      const rawBuffer = this.nextBits(LiteHashDRBG.MAX_RNG_SUPPORT_BIT);
      const buffer = new Uint8Array(8);
      buffer.set(rawBuffer);
      return LiteHashDRBG.parseU64(buffer);
    }

    if (max > LiteHashDRBG.MAX_INT) {
      throw new Error("Over Max Int");
    }
    if (max === 0) {
      return 0;
    }
    if (max < 0) {
      return -this.nextInt(-max);
    }

    // rejection sampling으로 균등 분포 보장
    const mask = LiteHashDRBG.calcBitMask(max);
    const bits = LiteHashDRBG.getBitsForMask(mask);

    let n = this._nextInt(bits);
    while (n > max) {
      n = this._nextInt(bits);
    }

    return n;
  }

  nextFloat1(): number {
    const max = 2 ** LiteHashDRBG.MAX_RNG_SUPPORT_BIT;

    let nInt: number;
    do {
      const rawBuffer = this.nextBits(LiteHashDRBG.MAX_RNG_SUPPORT_BIT + 1);
      const buffer = new Uint8Array(8);
      buffer.set(rawBuffer);
      nInt = LiteHashDRBG.parseU64(buffer);
    } while (nInt > max);

    return nInt / max;
  }

  /**
   * 현재 상태 정보 반환 (디버깅/복원용)
   */
  getState(): { stateIdx: number; bufferIdx: number } {
    return {
      stateIdx: this.stateIdx,
      bufferIdx: this.bufferIdx,
    };
  }
}
