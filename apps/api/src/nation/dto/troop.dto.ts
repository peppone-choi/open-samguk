import { z } from 'zod';

/**
 * 부대명 설정 요청 DTO
 */
export const zSetTroopNameDto = z.object({
    troopName: z.string().min(1).max(18, 'troopName must be between 1 and 18 characters'),
});

export type SetTroopNameDto = z.infer<typeof zSetTroopNameDto>;
