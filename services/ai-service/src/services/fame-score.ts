import Redis from 'ioredis';
import axios from 'axios';

const redis = new Redis(process.env.REDIS_HOST || 'localhost:6379');
const MAIN_API = process.env.MAIN_API_URL || 'http://localhost:3000/api';

interface FameScoreInput {
  engagementRate: number;
  consistency: number;
  contentQuality: number;
  audienceGrowth: number;
  influence: number;
}

interface FameScoreResult {
  overall: number;
  breakdown: {
    engagement: number;
    consistency: number;
    contentQuality: number;
    audienceGrowth: number;
    influence: number;
  };
  updatedAt: string;
}

const WEIGHTS = {
  engagement: 0.30,
  consistency: 0.20,
  contentQuality: 0.15,
  audienceGrowth: 0.20,
  influence: 0.15,
};

function calculateScore(input: FameScoreInput): FameScoreResult {
  const engagement = input.engagementRate * WEIGHTS.engagement;
  const consistency = input.consistency * WEIGHTS.consistency;
  const contentQuality = input.contentQuality * WEIGHTS.contentQuality;
  const audienceGrowth = input.audienceGrowth * WEIGHTS.audienceGrowth;
  const influence = input.influence * WEIGHTS.influence;

  const overall = Math.min(100, Math.round((engagement + consistency + contentQuality + audienceGrowth + influence) * 100) / 100);

  return {
    overall,
    breakdown: {
      engagement: Math.round(engagement * 100) / 100,
      consistency: Math.round(consistency * 100) / 100,
      contentQuality: Math.round(contentQuality * 100) / 100,
      audienceGrowth: Math.round(audienceGrowth * 100) / 100,
      influence: Math.round(influence * 100) / 100,
    },
    updatedAt: new Date().toISOString(),
  };
}

async function fetchUserMetrics(userId: string): Promise<FameScoreInput> {
  const [engagementRes, contentRes, growthRes, influenceRes] = await Promise.all([
    axios.get(`${MAIN_API}/users/${userId}/engagement`),
    axios.get(`${MAIN_API}/users/${userId}/content`),
    axios.get(`${MAIN_API}/users/${userId}/growth`),
    axios.get(`${MAIN_API}/users/${userId}/influence`),
  ]);

  return {
    engagementRate: engagementRes.data.rate ?? 0,
    consistency: contentRes.data.consistency ?? 0,
    contentQuality: contentRes.data.quality ?? 0,
    audienceGrowth: growthRes.data.growth ?? 0,
    influence: influenceRes.data.score ?? 0,
  };
}

export async function getFameScore(userId: string): Promise<FameScoreResult> {
  const cacheKey = `fame:score:${userId}`;

  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached) as FameScoreResult;
  }

  const metrics = await fetchUserMetrics(userId);
  const result = calculateScore(metrics);

  await redis.setex(cacheKey, 300, JSON.stringify(result));

  return result;
}

export async function recalculateFameScore(userId: string): Promise<FameScoreResult> {
  const cacheKey = `fame:score:${userId}`;
  const metrics = await fetchUserMetrics(userId);
  const result = calculateScore(metrics);

  await redis.setex(cacheKey, 300, JSON.stringify(result));

  return result;
}
