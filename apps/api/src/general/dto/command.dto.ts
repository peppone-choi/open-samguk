import { z } from 'zod';

/**
 * 커맨드 예약 요청 DTO
 */
export const zReserveCommandDto = z.object({
    action: z.string().min(1, 'action is required'),
    turnList: z.array(z.number().int().min(0).max(12)).min(1, 'turnList must have at least one turn'),
    arg: z.record(z.unknown()).optional(),
});

export type ReserveCommandDto = z.infer<typeof zReserveCommandDto>;

/**
 * 벌크 커맨드 예약 요청 DTO
 */
export const zReserveBulkCommandDto = z.array(zReserveCommandDto).min(1, 'At least one command is required');

export type ReserveBulkCommandDto = z.infer<typeof zReserveBulkCommandDto>;

/**
 * 커맨드 푸시 요청 DTO
 */
export const zPushCommandDto = z.object({
    amount: z.number().int().min(-12).max(12, 'amount must be between -12 and 12'),
});

export type PushCommandDto = z.infer<typeof zPushCommandDto>;

/**
 * 커맨드 반복 요청 DTO
 */
export const zRepeatCommandDto = z.object({
    amount: z.number().int().min(1).max(12, 'amount must be between 1 and 12'),
});

export type RepeatCommandDto = z.infer<typeof zRepeatCommandDto>;
