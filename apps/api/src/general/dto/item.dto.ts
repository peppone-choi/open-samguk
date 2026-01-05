import { z } from 'zod';

/**
 * 아이템 타입 열거형
 */
export const ItemType = z.enum(['weapon', 'book', 'horse', 'item']);
export type ItemType = z.infer<typeof ItemType>;

/**
 * 아이템 드롭 요청 DTO
 */
export const zDropItemDto = z.object({
    itemType: ItemType,
});

export type DropItemDto = z.infer<typeof zDropItemDto>;
