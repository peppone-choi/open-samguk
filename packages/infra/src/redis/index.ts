import { Redis } from 'ioredis';
import { env } from '../env.js';

let redis: Redis | null = null;

export function createRedisClient(): Redis {
  if (redis) return redis;

  redis = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
  });

  redis.on('error', (err) => {
    console.error('Redis error:', err);
  });

  return redis;
}

/**
 * Redis Stream에 메시지를 추가합니다.
 */
export async function addToStream(streamKey: string, data: Record<string, string>): Promise<string> {
  const client = createRedisClient();
  return (await client.xadd(streamKey, '*', ...Object.entries(data).flat())) as string;
}

/**
 * Redis Stream Consumer Group을 생성합니다. (이미 존재하면 무시)
 */
export async function createConsumerGroup(streamKey: string, groupName: string): Promise<void> {
  const client = createRedisClient();
  try {
    await client.xgroup('CREATE', streamKey, groupName, '$', 'MKSTREAM');
  } catch (err: any) {
    if (!err.message.includes('BUSYGROUP')) {
      throw err;
    }
  }
}
