/**
 * 난수 생성기 인터페이스
 *
 * 결정론적 RNG 구현을 위한 공통 인터페이스
 * 같은 seed로 생성된 RNG는 항상 같은 시퀀스를 생성해야 함
 */
export interface RNG {
  /**
   * @returns nextInt()가 반환 가능한 최댓값
   */
  getMaxInt(): number;

  /**
   * 지정된 바이트 수만큼의 난수 바이트를 생성
   *
   * @param bytes - 생성할 바이트 수
   * @returns Little Endian 형태로 채워진 바이트 배열
   */
  nextBytes(bytes: number): Uint8Array;

  /**
   * 지정된 비트 수만큼의 난수 비트를 생성
   *
   * @param bits - 생성할 비트 수
   * @returns 비트가 채워진 바이트 배열
   */
  nextBits(bits: number): Uint8Array;

  /**
   * 0과 최대치 사이의 임의의 정수를 반환
   *
   * @param max - 최대치 (해당 값 포함). null이면 getMaxInt() 값 사용
   * @returns 0 이상 max 이하의 정수
   */
  nextInt(max?: number | null): number;

  /**
   * 0.0 이상 1.0 이하의 난수 실수를 반환
   *
   * @returns [0.0, 1.0] 범위의 실수
   */
  nextFloat1(): number;
}
