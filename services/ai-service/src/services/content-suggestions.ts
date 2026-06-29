import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_HOST || 'localhost:6379');

interface TrendingTopic {
  topic: string;
  category: string;
  volume: number;
  trend: 'rising' | 'falling' | 'stable';
}

interface ContentSuggestion {
  type: 'topic' | 'hashtag' | 'posting_time' | 'content_format';
  title: string;
  description: string;
  expectedImpact: 'high' | 'medium' | 'low';
  reason: string;
}

interface ContentSuggestionInput {
  userId: string;
  niche: string;
  recentTopics: string[];
  topHashtags: string[];
  bestPostingTimes: string[];
  topPerformingFormats: string[];
}

const TRENDING_TOPICS: TrendingTopic[] = [
  { topic: 'AI in Daily Life', category: 'technology', volume: 850000, trend: 'rising' },
  { topic: 'Sustainable Fashion', category: 'lifestyle', volume: 620000, trend: 'rising' },
  { topic: 'Home Workout Routines', category: 'fitness', volume: 540000, trend: 'stable' },
  { topic: 'Digital Nomad Life', category: 'travel', volume: 480000, trend: 'rising' },
  { topic: 'Mental Health Awareness', category: 'health', volume: 720000, trend: 'rising' },
  { topic: 'Street Food Reviews', category: 'food', volume: 390000, trend: 'stable' },
  { topic: 'Indoor Gardening', category: 'hobbies', volume: 280000, trend: 'rising' },
  { topic: 'Budget Travel Tips', category: 'travel', volume: 410000, trend: 'stable' },
  { topic: 'Morning Routines', category: 'lifestyle', volume: 560000, trend: 'falling' },
  { topic: 'Book Recommendations', category: 'education', volume: 320000, trend: 'rising' },
];

const POSTING_TIME_SLOTS = [
  { time: '07:00 - 09:00', day: 'Weekdays', engagement: 0.12, reason: 'Morning commute browsing' },
  { time: '11:00 - 13:00', day: 'Weekdays', engagement: 0.15, reason: 'Lunch break scrolling' },
  { time: '17:00 - 19:00', day: 'Weekdays', engagement: 0.10, reason: 'After work wind-down' },
  { time: '20:00 - 23:00', day: 'All days', engagement: 0.18, reason: 'Evening prime time' },
  { time: '09:00 - 11:00', day: 'Weekends', engagement: 0.20, reason: 'Weekend morning relaxation' },
];

function getTrendingTopics(niche: string): TrendingTopic[] {
  const nicheLower = niche.toLowerCase();
  const nicheCategory = ['lifestyle', 'fitness', 'health', 'travel', 'food', 'hobbies', 'education', 'technology'];
  const matchedCategory = nicheCategory.find(c => nicheLower.includes(c));

  if (matchedCategory) {
    return TRENDING_TOPICS.filter(t => t.category === matchedCategory).slice(0, 5);
  }
  return TRENDING_TOPICS.slice(0, 5);
}

function getSuggestedHashtags(topHashtags: string[], trendingTopics: TrendingTopic[]): string[] {
  const topicHashtags = trendingTopics.map(t => t.topic.replace(/\s+/g, ''));
  return [...new Set([...topicHashtags, ...topHashtags])].slice(0, 10);
}

function getOptimalPostingTimes(userTimes: string[]): { time: string; day: string; engagement: number; reason: string }[] {
  const allTimes = [...POSTING_TIME_SLOTS];
  const userHours = userTimes.map(t => parseInt(t.split(':')[0], 10));

  if (userHours.length > 0) {
    const avgHour = userHours.reduce((a, b) => a + b, 0) / userHours.length;
    allTimes.sort((a, b) => {
      const slotHourA = parseInt(a.time.split(':')[0], 10);
      const slotHourB = parseInt(b.time.split(':')[0], 10);
      const diffA = Math.abs(slotHourA - avgHour);
      const diffB = Math.abs(slotHourB - avgHour);
      return diffA - diffB;
    });
  }

  return allTimes.sort((a, b) => b.engagement - a.engagement).slice(0, 3);
}

const CONTENT_FORMATS: { format: string; description: string; expectedImpact: 'high' | 'medium' | 'low' }[] = [
  { format: 'Tutorial/How-to', description: 'Step-by-step educational content', expectedImpact: 'high' },
  { format: 'Behind the Scenes', description: 'Authentic, unpolished content', expectedImpact: 'medium' },
  { format: 'User Generated Content', description: 'Repost and engage with fan content', expectedImpact: 'high' },
  { format: 'Polls/Questions', description: 'Interactive content for engagement', expectedImpact: 'medium' },
  { format: 'Day in the Life', description: 'Vlog-style personal content', expectedImpact: 'medium' },
  { format: 'Comparison/Ranking', description: 'List-style comparative content', expectedImpact: 'high' },
  { format: 'Myth Busting', description: 'Contrarian or clarifying content', expectedImpact: 'medium' },
];

export async function getContentSuggestions(input: ContentSuggestionInput): Promise<ContentSuggestion[]> {
  const cacheKey = `suggestions:${input.userId}:${input.niche}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached) as ContentSuggestion[];
  }

  const trending = getTrendingTopics(input.niche);
  const suggestions: ContentSuggestion[] = [];

  for (const topic of trending.slice(0, 3)) {
    suggestions.push({
      type: 'topic',
      title: `Trending: ${topic.topic}`,
      description: `Create content about "${topic.topic}" — currently trending ${topic.trend} with ${(topic.volume / 1000).toFixed(0)}K engagements`,
      expectedImpact: topic.trend === 'rising' ? 'high' : 'medium',
      reason: `Capitalize on the ${topic.trend} trend in ${topic.category}`,
    });
  }

  const suggestedHashtags = getSuggestedHashtags(input.topHashtags, trending);
  suggestions.push({
    type: 'hashtag',
    title: 'Optimized Hashtag Mix',
    description: `Use: ${suggestedHashtags.slice(0, 5).join(', ')}`,
    expectedImpact: 'high',
    reason: 'Mix of broad and niche hashtags increases discoverability by up to 40%',
  });

  const optimalTimes = getOptimalPostingTimes(input.bestPostingTimes);
  const bestTime = optimalTimes[0];
  suggestions.push({
    type: 'posting_time',
    title: `Best Time: ${bestTime.time} (${bestTime.day})`,
    description: `Post during ${bestTime.time} on ${bestTime.day} for maximum engagement`,
    expectedImpact: 'high',
    reason: bestTime.reason,
  });

  const formatsNotUsed = CONTENT_FORMATS.filter(
    f => !input.topPerformingFormats.includes(f.format)
  );
  if (formatsNotUsed.length > 0) {
    const topFormat = formatsNotUsed.sort((a, b) => {
      const order = { high: 3, medium: 2, low: 1 };
      return order[b.expectedImpact] - order[a.expectedImpact];
    })[0];
    suggestions.push({
      type: 'content_format',
      title: `Try: ${topFormat.format}`,
      description: topFormat.description,
      expectedImpact: topFormat.expectedImpact,
      reason: `This format could diversify your content and attract new audiences`,
    });
  }

  await redis.setex(cacheKey, 600, JSON.stringify(suggestions));

  return suggestions;
}

export function getTrendingTopicsPublic(niche?: string): TrendingTopic[] {
  if (niche) {
    const nicheLower = niche.toLowerCase();
    const matchedCategory = ['technology', 'lifestyle', 'fitness', 'health', 'travel', 'food', 'hobbies', 'education']
      .find(c => nicheLower.includes(c));
    if (matchedCategory) {
      return TRENDING_TOPICS.filter(t => t.category === matchedCategory);
    }
  }
  return TRENDING_TOPICS;
}
