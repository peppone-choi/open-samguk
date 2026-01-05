import { z } from 'zod';

/**
 * 국가 공지 설정 요청 DTO
 */
export const zSetNoticeDto = z.object({
    msg: z.string().max(16384, 'notice must be at most 16384 characters'),
});

export type SetNoticeDto = z.infer<typeof zSetNoticeDto>;

/**
 * 스카웃 메시지 설정 요청 DTO
 */
export const zSetScoutMsgDto = z.object({
    msg: z.string().max(1000, 'scout message must be at most 1000 characters'),
});

export type SetScoutMsgDto = z.infer<typeof zSetScoutMsgDto>;
