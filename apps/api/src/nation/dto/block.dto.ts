import { z } from 'zod';

/**
 * 스카웃 차단 설정 요청 DTO
 */
export const zSetBlockScoutDto = z.object({
    value: z.boolean(),
});

export type SetBlockScoutDto = z.infer<typeof zSetBlockScoutDto>;

/**
 * 선전포고 차단 설정 요청 DTO
 */
export const zSetBlockWarDto = z.object({
    value: z.boolean(),
});

export type SetBlockWarDto = z.infer<typeof zSetBlockWarDto>;
