import { z } from 'zod';

/**
 * 기밀 제한 설정 요청 DTO
 */
export const zSetSecretLimitDto = z.object({
    amount: z.number().int().min(1).max(99, 'secretLimit must be between 1 and 99'),
});

export type SetSecretLimitDto = z.infer<typeof zSetSecretLimitDto>;
