import { Redis } from '@upstash/redis';

// Initialize Upstash Redis client
let redisClient: Redis | null = null;

export function getRedis(): Redis | null {
  if (redisClient) return redisClient;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  try {
    redisClient = new Redis({
      url,
      token,
      automaticDeserialization: true,
    });
    return redisClient;
  } catch (err) {
    console.error('[Upstash Redis] Initialization failed:', err);
    return null;
  }
}

export const redis = getRedis();

/**
 * Safely get cached data from Redis. Returns null on miss or error.
 */
export async function getCache<T>(key: string): Promise<T | null> {
  const client = getRedis();
  if (!client) return null;

  try {
    const data = await client.get<T>(key);
    return data ?? null;
  } catch (err) {
    console.warn(`[Upstash Redis] getCache error for key "${key}":`, err);
    return null;
  }
}

/**
 * Safely set cached data into Redis with an optional TTL in seconds.
 */
export async function setCache<T>(key: string, value: T, ttlSeconds = 60): Promise<void> {
  const client = getRedis();
  if (!client) return;

  try {
    if (ttlSeconds > 0) {
      await client.set(key, value, { ex: ttlSeconds });
    } else {
      await client.set(key, value);
    }
  } catch (err) {
    console.warn(`[Upstash Redis] setCache error for key "${key}":`, err);
  }
}

/**
 * Safely delete one or more cache keys.
 */
export async function delCache(...keys: string[]): Promise<void> {
  const client = getRedis();
  if (!client || keys.length === 0) return;

  try {
    await client.del(...keys);
  } catch (err) {
    console.warn(`[Upstash Redis] delCache error:`, err);
  }
}

/**
 * Deletes keys matching a pattern (e.g. "volunteers:*" or "chat:123:*").
 */
export async function delCachePattern(pattern: string): Promise<void> {
  const client = getRedis();
  if (!client) return;

  try {
    const keys = await client.keys(pattern);
    if (keys && keys.length > 0) {
      await client.del(...keys);
    }
  } catch (err) {
    console.warn(`[Upstash Redis] delCachePattern error for "${pattern}":`, err);
  }
}

/**
 * Fast caching wrapper: returns cached data if present, otherwise calls fetcher(), caches the result, and returns it.
 */
export async function getOrSetCache<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = await getCache<T>(key);
  if (cached !== null && cached !== undefined) {
    return cached;
  }

  const result = await fetcher();
  if (result !== null && result !== undefined) {
    // Non-blocking write to cache
    setCache(key, result, ttlSeconds).catch(() => {});
  }
  return result;
}

// ─────────────────────────────────────────────────────────────
// Real-Time Presence Helpers via Redis
// ─────────────────────────────────────────────────────────────

const PRESENCE_SET_KEY = 'presence:online_users';
const PRESENCE_TTL_SEC = 65; // 65 seconds heartbeat window

/**
 * Mark user online in Redis instantly.
 */
export async function setOnlinePresence(userId: string): Promise<void> {
  const client = getRedis();
  if (!client || !userId) return;

  try {
    const now = Date.now();
    await Promise.all([
      client.set(`presence:user:${userId}`, now, { ex: PRESENCE_TTL_SEC }),
      client.zadd(PRESENCE_SET_KEY, { score: now, member: userId }),
    ]);
  } catch (err) {
    console.warn('[Upstash Redis] setOnlinePresence error:', err);
  }
}

/**
 * Mark user offline in Redis immediately.
 */
export async function setOfflinePresence(userId: string): Promise<void> {
  const client = getRedis();
  if (!client || !userId) return;

  try {
    await Promise.all([
      client.del(`presence:user:${userId}`),
      client.zrem(PRESENCE_SET_KEY, userId),
    ]);
  } catch (err) {
    console.warn('[Upstash Redis] setOfflinePresence error:', err);
  }
}

/**
 * Check if a single user is online via fast Redis lookup.
 */
export async function isUserOnline(userId: string): Promise<boolean> {
  const client = getRedis();
  if (!client || !userId) return false;

  try {
    const exists = await client.exists(`presence:user:${userId}`);
    return exists === 1;
  } catch {
    return false;
  }
}

/**
 * Get all online user IDs within the active heartbeat window.
 */
export async function getOnlineUserIds(): Promise<Set<string>> {
  const client = getRedis();
  if (!client) return new Set();

  try {
    const threshold = Date.now() - PRESENCE_TTL_SEC * 1000;
    // Remove expired users from sorted set
    await client.zremrangebyscore(PRESENCE_SET_KEY, 0, threshold);
    const onlineIds = await client.zrange<string[]>(PRESENCE_SET_KEY, 0, -1);
    return new Set(onlineIds || []);
  } catch (err) {
    console.warn('[Upstash Redis] getOnlineUserIds error:', err);
    return new Set();
  }
}
