import Redis from "ioredis";

export type RedisClientType = Redis;

let redisClient: Redis | null = null;

export function createRedisClient(url?: string): Redis {
  if (redisClient) return redisClient;

  const redisUrl = url ?? process.env.REDIS_URL ?? "redis://localhost:6379";
  redisClient = new Redis(redisUrl);

  return redisClient;
}
