import { z } from 'zod';

/**
 * 세율 설정 요청 DTO
 */
export const zSetRateDto = z.object({
    amount: z.number().int().min(5).max(30, 'rate must be between 5 and 30'),
});

export type SetRateDto = z.infer<typeof zSetRateDto>;
