import Redis from 'ioredis';

let redisClient: Redis | null = null;
let subscriberClient: Redis | null = null;

interface RedisConfig {
  host: string;
  port: number;
}

function getConfig(): RedisConfig {
  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  };
}

export function createRedisClient(): Redis {
  const config = getConfig();
  const client = new Redis({
    host: config.host,
    port: config.port,
    retryStrategy(times: number) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    lazyConnect: true,
  });

  client.on('error', (err) => {
    console.error('[Redis] Connection error:', err.message);
  });

  client.on('connect', () => {
    console.log('[Redis] Connected to', `${config.host}:${config.port}`);
  });

  client.on('close', () => {
    console.warn('[Redis] Connection closed');
  });

  client.on('reconnecting', (time: number) => {
    console.log('[Redis] Reconnecting in', time, 'ms');
  });

  return client;
}

export async function getRedisClient(): Promise<Redis> {
  if (!redisClient) {
    redisClient = createRedisClient();
    await redisClient.connect();
  }
  return redisClient;
}

export async function getSubscriberClient(): Promise<Redis> {
  if (!subscriberClient) {
    subscriberClient = createRedisClient();
    await subscriberClient.connect();
  }
  return subscriberClient;
}

export async function storeOfflineMessage(
  userId: string,
  message: Record<string, unknown>
): Promise<void> {
  const client = await getRedisClient();
  const key = `offline:messages:${userId}`;
  await client.lpush(key, JSON.stringify(message));
  await client.expire(key, 604800);
}

export async function getOfflineMessages(
  userId: string
): Promise<Record<string, unknown>[]> {
  const client = await getRedisClient();
  const key = `offline:messages:${userId}`;
  const messages = await client.lrange(key, 0, -1);
  await client.del(key);
  return messages.map((msg) => JSON.parse(msg));
}

export async function shutdownRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
  if (subscriberClient) {
    await subscriberClient.quit();
    subscriberClient = null;
  }
}
