import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const globalForRedis = globalThis as unknown as { redis: Redis | null };

function createRedis(): Redis | null {
  try {
    return new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) return null;
        return Math.min(times * 200, 2000);
      },
      lazyConnect: true,
    });
  } catch {
    return null;
  }
}

export const redis: Redis | null = globalForRedis.redis ?? createRedis();
if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;

export async function getHistoryBalance(userId: number): Promise<unknown[]> {
  if (!redis) return [];
  const key = `user.${userId}.historyBalance`;
  const raw = await redis.get(key);
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export async function appendHistoryBalance(
  userId: number,
  entry: { user_id: number; type: string; balance_before: number; balance_after: number; date: string }
): Promise<void> {
  if (!redis) return;
  const key = `user.${userId}.historyBalance`;
  const arr = await getHistoryBalance(userId);
  arr.push(entry);
  await redis.set(key, JSON.stringify(arr));
}
