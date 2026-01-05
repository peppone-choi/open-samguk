import { z } from 'zod';

/**
 * 국가 가입 요청 DTO
 */
export const zJoinDto = z.object({
    nationId: z.number().int().positive('nationId must be a positive integer'),
});

export type JoinDto = z.infer<typeof zJoinDto>;
