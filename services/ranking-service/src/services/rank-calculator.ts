import Redis from 'ioredis';
import axios from 'axios';

const redis = new Redis(process.env.REDIS_HOST || 'localhost:6379');
const MAIN_API = process.env.MAIN_API_URL || 'http://localhost:3000/api';
const CACHE_TTL = parseInt(process.env.CACHE_TTL || '300', 10);

export interface RankEntry {
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  score: number;
  rank: number;
  change: number;
  metadata: {
    followers: number;
    engagement: number;
    fameScore: number;
    category?: string;
    college?: string;
    city?: string;
    country?: string;
  };
}

interface UserData {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  followers: number;
  engagement: number;
  fameScore: number;
  category?: string;
  college?: string;
  city?: string;
  country?: string;
}

const RANK_CATEGORIES = ['global', 'country', 'city', 'college', 'category'] as const;
export type RankCategory = typeof RANK_CATEGORIES[number];

function userScore(user: UserData): number {
  return Math.round(
    (user.fameScore || 0) * 0.5 +
    (user.followers || 0) * 0.0001 +
    (user.engagement || 0) * 100
  );
}

export async function fetchAllUsers(): Promise<UserData[]> {
  const cacheKey = 'rank:users:all';
  const cached = await redis.get(cacheKey);

  if (cached) {
    return JSON.parse(cached) as UserData[];
  }

  const response = await axios.get(`${MAIN_API}/users`, {
    params: { limit: 10000 },
    timeout: 30000,
  });

  const users = response.data.data || response.data || [];
  await redis.setex(cacheKey, 60, JSON.stringify(users));

  return users;
}

function buildSortedSetKey(category: RankCategory, qualifier?: string): string {
  if (qualifier) return `rank:${category}:${qualifier.toLowerCase().replace(/\s+/g, '_')}`;
  return `rank:${category}`;
}

function extractQualifier(user: UserData, category: RankCategory): string | null {
  switch (category) {
    case 'country': return user.country || null;
    case 'city': return user.city || null;
    case 'college': return user.college || null;
    case 'category': return user.category || null;
    case 'global': return 'global';
    default: return null;
  }
}

export async function updateRankingsForCategory(category: RankCategory, users: UserData[]): Promise<void> {
  const pipeline = redis.pipeline();

  if (category === 'global') {
    const key = buildSortedSetKey('global');
    pipeline.del(key);
    for (const user of users) {
      const score = userScore(user);
      pipeline.zadd(key, score, user.id);
    }
    return;
  }

  const grouped = new Map<string, UserData[]>();
  for (const user of users) {
    const qualifier = extractQualifier(user, category);
    if (qualifier) {
      const existing = grouped.get(qualifier) || [];
      existing.push(user);
      grouped.set(qualifier, existing);
    }
  }

  for (const [qualifier, group] of grouped) {
    const key = buildSortedSetKey(category, qualifier);
    pipeline.del(key);
    for (const user of group) {
      const score = userScore(user);
      pipeline.zadd(key, score, user.id);
    }
  }

  await pipeline.exec();
}

export async function updateAllRankings(): Promise<void> {
  const users = await fetchAllUsers();
  const updatePromises = RANK_CATEGORIES.map(cat => updateRankingsForCategory(cat, users));
  await Promise.all(updatePromises);
  console.log(`[Rank] Updated rankings for ${users.length} users across ${RANK_CATEGORIES.length} categories`);
}

export async function getRanking(
  category: RankCategory,
  qualifier?: string,
  limit: number = 50,
  offset: number = 0
): Promise<RankEntry[]> {
  const users = await fetchAllUsers();
  const key = qualifier ? buildSortedSetKey(category, qualifier) : buildSortedSetKey(category);

  const cachedRanks = await redis.zrevrange(key, offset, offset + limit - 1, 'WITHSCORES');
  if (cachedRanks.length === 0) {
    return [];
  }

  const userIdToScore = new Map<string, number>();
  for (let i = 0; i < cachedRanks.length; i += 2) {
    userIdToScore.set(cachedRanks[i], parseInt(cachedRanks[i + 1], 10));
  }

  const userMap = new Map<string, UserData>();
  for (const user of users) {
    userMap.set(user.id, user);
  }

  const previousRanksKey = `rank:previous:${key}`;
  const previousRanksRaw = await redis.hgetall(previousRanksKey);
  const previousRanks = new Map(Object.entries(previousRanksRaw).map(([k, v]) => [k, parseInt(v, 10)]));

  const entries: RankEntry[] = [];
  let rank = offset + 1;

  for (const [userId, score] of userIdToScore) {
    const user = userMap.get(userId);
    if (!user) continue;

    const prevRank = previousRanks.get(userId) || rank;
    const change = prevRank - rank;

    entries.push({
      userId: user.id,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      score,
      rank,
      change,
      metadata: {
        followers: user.followers || 0,
        engagement: user.engagement || 0,
        fameScore: user.fameScore || 0,
        category: user.category,
        college: user.college,
        city: user.city,
        country: user.country,
      },
    });

    rank++;
  }

  const nextPipeline = redis.pipeline();
  for (const entry of entries) {
    nextPipeline.hset(previousRanksKey, entry.userId, entry.rank);
  }
  nextPipeline.expire(previousRanksKey, 86400);
  await nextPipeline.exec();

  return entries;
}

export async function getUserRank(
  userId: string,
  category: RankCategory = 'global',
  qualifier?: string
): Promise<{ rank: number; total: number; score: number } | null> {
  const key = qualifier ? buildSortedSetKey(category, qualifier) : buildSortedSetKey(category);
  const total = await redis.zcard(key);
  const rank = await redis.zrevrank(key, userId);

  if (rank === null) return null;

  const score = await redis.zscore(key, userId);

  return {
    rank: rank + 1,
    total,
    score: parseInt(score || '0', 10),
  };
}
