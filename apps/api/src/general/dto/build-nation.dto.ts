import { z } from 'zod';

/**
 * 국가 건국 후보 등록 요청 DTO
 */
export const zBuildNationCandidateDto = z.object({
    cityId: z.number().int().positive('cityId must be a positive integer'),
    nationName: z.string().min(1).max(18, 'nationName must be between 1 and 18 characters'),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'color must be a valid hex color'),
    nationTyp: z.number().int().min(0, 'nationTyp must be a non-negative integer'),
});

export type BuildNationCandidateDto = z.infer<typeof zBuildNationCandidateDto>;
