import { RankCategory, RankEntry, getRanking, getUserRank, fetchAllUsers } from './rank-calculator';

export interface LeaderboardSummary {
  global: RankEntry[];
  country?: RankEntry[];
  city?: RankEntry[];
  college?: RankEntry[];
  category?: RankEntry[];
  userRank?: {
    global: { rank: number; total: number; score: number } | null;
    country: { rank: number; total: number; score: number } | null;
    city: { rank: number; total: number; score: number } | null;
    college: { rank: number; total: number; score: number } | null;
    category: { rank: number; total: number; score: number } | null;
  };
  metadata: {
    totalUsers: number;
    updatedAt: string;
    nextUpdate: string;
  };
}

export async function getLeaderboard(
  userId?: string,
  limit: number = 50
): Promise<LeaderboardSummary> {
  const users = await fetchAllUsers();

  const topGlobal = await getRanking('global', undefined, limit);

  let countryEntries: RankEntry[] | undefined;
  let cityEntries: RankEntry[] | undefined;
  let collegeEntries: RankEntry[] | undefined;
  let categoryEntries: RankEntry[] | undefined;

  if (userId) {
    const user = users.find(u => u.id === userId);
    if (user) {
      if (user.country) countryEntries = await getRanking('country', user.country, limit);
      if (user.city) cityEntries = await getRanking('city', user.city, limit);
      if (user.college) collegeEntries = await getRanking('college', user.college, limit);
      if (user.category) categoryEntries = await getRanking('category', user.category, limit);
    }
  }

  let userRankResult: LeaderboardSummary['userRank'];
  if (userId) {
    const user = users.find(u => u.id === userId);
    userRankResult = {
      global: await getUserRank(userId, 'global'),
      country: user?.country ? await getUserRank(userId, 'country', user.country) : null,
      city: user?.city ? await getUserRank(userId, 'city', user.city) : null,
      college: user?.college ? await getUserRank(userId, 'college', user.college) : null,
      category: user?.category ? await getUserRank(userId, 'category', user.category) : null,
    };
  }

  return {
    global: topGlobal,
    country: countryEntries,
    city: cityEntries,
    college: collegeEntries,
    category: categoryEntries,
    userRank: userRankResult,
    metadata: {
      totalUsers: users.length,
      updatedAt: new Date().toISOString(),
      nextUpdate: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    },
  };
}
