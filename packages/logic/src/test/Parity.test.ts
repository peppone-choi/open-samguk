import { describe, it, expect } from 'vitest';
import * as JosaUtil from '@sammo-ts/common';

/**
 * 레거시 동등성(Parity) 테스트
 * Phase I2: 공통 유틸리티부터 비교 테스트 보유
 */
describe('Legacy Parity: JosaUtil', () => {
  it('을/를 조사가 정확하게 선택되어야 함', () => {
    expect(JosaUtil.pick('유비', '을')).toBe('를');
    expect(JosaUtil.pick('조조', '을')).toBe('를');
    expect(JosaUtil.pick('관우', '을')).toBe('를');
    expect(JosaUtil.pick('장비', '을')).toBe('를');
    expect(JosaUtil.pick('제갈량', '을')).toBe('을');
  });

  it('이/가 조사가 정확하게 선택되어야 함', () => {
    expect(JosaUtil.pick('유비', '이')).toBe('가');
    expect(JosaUtil.pick('손권', '이')).toBe('이');
  });

  it('은/는 조사가 정확하게 선택되어야 함', () => {
    expect(JosaUtil.pick('유비', '은')).toBe('는');
    expect(JosaUtil.pick('조운', '은')).toBe('은');
  });
});
