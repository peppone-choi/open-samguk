import { z } from 'zod';

/**
 * 봉급 설정 요청 DTO
 */
export const zSetBillDto = z.object({
    amount: z.number().int().min(20).max(200, 'bill must be between 20 and 200'),
});

export type SetBillDto = z.infer<typeof zSetBillDto>;
