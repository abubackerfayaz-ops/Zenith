// ─── Enums ────────────────────────────────────────────────────────────

export enum ContentType {
  Post = 'post',
  Reel = 'reel',
  Story = 'story',
}

export enum Privacy {
  Public = 'public',
  Followers = 'followers',
  Private = 'private',
}

export enum NotificationType {
  Like = 'like',
  Comment = 'comment',
  Follow = 'follow',
  Mention = 'mention',
  Battle = 'battle',
  BattleWin = 'battle_win',
  BattleLoss = 'battle_loss',
  Achievement = 'achievement',
  RankUp = 'rank_up',
  FameMilestone = 'fame_milestone',
  Message = 'message',
}

export enum BattleStatus {
  Pending = 'pending',
  Active = 'active',
  Completed = 'completed',
  Cancelled = 'cancelled',
}

export enum MediaType {
  Image = 'image',
  Video = 'video',
  Audio = 'audio',
}

export enum PersonalityType {
  Charismatic = 'charismatic',
  Controversial = 'controversial',
  Influential = 'influential',
  Creative = 'creative',
  Viral = 'viral',
  Elite = 'elite',
}

export enum FameTier {
  Bronze = 'bronze',
  Silver = 'silver',
  Gold = 'gold',
  Platinum = 'platinum',
  Diamond = 'diamond',
  Legendary = 'legendary',
}

export enum TokenSymbol {
  Fame = 'FAME',
  Star = 'STAR',
  Vote = 'VOTE',
}

export enum ActivityAction {
  CreatedPost = 'created_post',
  LikedPost = 'liked_post',
  Commented = 'commented',
  Shared = 'shared',
  WonBattle = 'won_battle',
  LostBattle = 'lost_battle',
  GainedFollower = 'gained_follower',
  ReachedMilestone = 'reached_milestone',
  EarnedBadge = 'earned_badge',
}

// ─── Core Models ──────────────────────────────────────────────────────

export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  bio: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  website: string | null;
  location: string | null;
  privacy: Privacy;
  isVerified: boolean;
  isOnboarded: boolean;
  fameScore: FameScore;
  personality: PersonalityType | null;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  reelsCount: number;
  battleWins: number;
  battleLosses: number;
  createdAt: string;
  updatedAt: string;
}

export interface FameScore {
  total: number;
  rank: number;
  tier: FameTier;
  breakdown: FameScoreBreakdown;
  history: FameScoreHistoryPoint[];
}

export interface FameScoreBreakdown {
  engagement: number;
  popularity: number;
  influence: number;
  creativity: number;
  consistency: number;
}

export interface FameScoreHistoryPoint {
  date: string;
  score: number;
}

export interface Post {
  id: string;
  author: User;
  content: string | null;
  media: Media[];
  hashtags: Hashtag[];
  mentions: string[];
  privacy: Privacy;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  viewsCount: number;
  isLiked: boolean;
  isSaved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Media {
  id: string;
  url: string;
  thumbnailUrl: string | null;
  type: MediaType;
  width: number;
  height: number;
  duration: number | null;
  alt: string | null;
}

export interface Story {
  id: string;
  author: User;
  media: Media;
  caption: string | null;
  viewersCount: number;
  viewers: string[];
  expiresAt: string;
  createdAt: string;
}

export interface Reel {
  id: string;
  author: User;
  media: Media;
  caption: string | null;
  hashtags: Hashtag[];
  mentions: string[];
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  viewsCount: number;
  isLiked: boolean;
  isSaved: boolean;
  duration: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  author: User;
  content: string;
  media: Media | null;
  likesCount: number;
  repliesCount: number;
  parentId: string | null;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  sender: User;
  receiver: User;
  content: string | null;
  media: Media | null;
  isRead: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  actor: User;
  targetId: string;
  targetType: ContentType | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface Ranking {
  id: string;
  user: User;
  rank: number;
  previousRank: number;
  score: number;
  change: number;
  tier: FameTier;
}

export interface Battle {
  id: string;
  challenger: User;
  opponent: User;
  status: BattleStatus;
  category: string;
  challengerScore: number;
  opponentScore: number;
  challengerVotes: number;
  opponentVotes: number;
  winnerId: string | null;
  expiresAt: string;
  createdAt: string;
  endedAt: string | null;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  staked: number;
  transactions: Transaction[];
}

export interface Transaction {
  id: string;
  type: 'reward' | 'stake' | 'unstake' | 'tip' | 'purchase';
  amount: number;
  token: TokenSymbol;
  description: string;
  createdAt: string;
}

export interface Hashtag {
  id: string;
  name: string;
  postsCount: number;
  isTrending: boolean;
}

export interface Personality {
  type: PersonalityType;
  label: string;
  description: string;
  color: string;
  icon: string;
  minScore: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
  progress: number;
  maxProgress: number;
}

export interface Activity {
  id: string;
  action: ActivityAction;
  user: User;
  targetId: string | null;
  targetType: ContentType | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

// ─── API Types ────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  displayName: string;
  email: string;
  password: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
