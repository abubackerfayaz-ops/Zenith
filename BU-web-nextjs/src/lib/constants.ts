// ─── Routes ───────────────────────────────────────────────────────────

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  EXPLORE: '/explore',
  NOTIFICATIONS: '/notifications',
  MESSAGES: '/messages',
  PROFILE: (username: string) => `/profile/${username}`,
  POST: (id: string) => `/post/${id}`,
  REEL: (id: string) => `/reel/${id}`,
  STORY: (id: string) => `/story/${id}`,
  BATTLE: (id: string) => `/battle/${id}`,
  BATTLE_CREATE: '/battle/create',
  RANKINGS: '/rankings',
  SETTINGS: '/settings',
  SETTINGS_PROFILE: '/settings/profile',
  SETTINGS_PRIVACY: '/settings/privacy',
  SETTINGS_NOTIFICATIONS: '/settings/notifications',
  WALLET: '/wallet',
  ADMIN: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_REPORTS: '/admin/reports',
  HASHTAG: (tag: string) => `/hashtag/${tag}`,
  TRENDING: '/trending',
  SEARCH: '/search',
} as const;

// ─── API Endpoints ────────────────────────────────────────────────────

export const API = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },
  USERS: {
    BASE: '/users',
    PROFILE: (id: string) => `/users/${id}`,
    FOLLOWERS: (id: string) => `/users/${id}/followers`,
    FOLLOWING: (id: string) => `/users/${id}/following`,
    FOLLOW: (id: string) => `/users/${id}/follow`,
    UNFOLLOW: (id: string) => `/users/${id}/unfollow`,
    SEARCH: '/users/search',
  },
  POSTS: {
    BASE: '/posts',
    DETAIL: (id: string) => `/posts/${id}`,
    LIKE: (id: string) => `/posts/${id}/like`,
    UNLIKE: (id: string) => `/posts/${id}/unlike`,
    SAVE: (id: string) => `/posts/${id}/save`,
    UNSAVE: (id: string) => `/posts/${id}/unsave`,
    COMMENTS: (id: string) => `/posts/${id}/comments`,
    COMMENT: (postId: string, commentId: string) =>
      `/posts/${postId}/comments/${commentId}`,
    REPORT: (id: string) => `/posts/${id}/report`,
  },
  REELS: {
    BASE: '/reels',
    DETAIL: (id: string) => `/reels/${id}`,
    LIKE: (id: string) => `/reels/${id}/like`,
    UNLIKE: (id: string) => `/reels/${id}/unlike`,
  },
  STORIES: {
    BASE: '/stories',
    DETAIL: (id: string) => `/stories/${id}`,
    VIEW: (id: string) => `/stories/${id}/view`,
  },
  BATTLES: {
    BASE: '/battles',
    DETAIL: (id: string) => `/battles/${id}`,
    VOTE: (id: string) => `/battles/${id}/vote`,
    MY_BATTLES: '/battles/mine',
  },
  RANKINGS: {
    BASE: '/rankings',
    LEADERBOARD: '/rankings/leaderboard',
    TOP: '/rankings/top',
  },
  NOTIFICATIONS: {
    BASE: '/notifications',
    READ: (id: string) => `/notifications/${id}/read`,
    READ_ALL: '/notifications/read-all',
  },
  MESSAGES: {
    BASE: '/messages',
    CONVERSATIONS: '/messages/conversations',
    CONVERSATION: (id: string) => `/messages/conversations/${id}`,
  },
  HASHTAGS: {
    BASE: '/hashtags',
    TRENDING: '/hashtags/trending',
    DETAIL: (tag: string) => `/hashtags/${tag}`,
  },
  WALLET: {
    BASE: '/wallet',
    TRANSACTIONS: '/wallet/transactions',
    STAKE: '/wallet/stake',
    UNSTAKE: '/wallet/unstake',
  },
  ADMIN: {
    USERS: '/admin/users',
    REPORTS: '/admin/reports',
    STATS: '/admin/stats',
    BAN: (id: string) => `/admin/users/${id}/ban`,
    UNBAN: (id: string) => `/admin/users/${id}/unban`,
  },
  FEED: {
    FOR_YOU: '/feed/for-you',
    FOLLOWING: '/feed/following',
    TRENDING: '/feed/trending',
  },
  SEARCH: '/search',
} as const;

// ─── Emojis ───────────────────────────────────────────────────────────

export const EMOJIS = {
  FIRE: '🔥',
  TROPHY: '🏆',
  STAR: '⭐',
  CROWN: '👑',
  ROCKET: '🚀',
  HEART: '❤️',
  THUMBS_UP: '👍',
  CLAP: '👏',
  PARTY: '🎉',
  MEDAL: '🏅',
  LIGHTNING: '⚡',
  DIAMOND: '💎',
  GEM: '💎',
  MONEY: '💰',
  CHART_UP: '📈',
  CHART_DOWN: '📉',
  FIREWORK: '🎆',
  SPARKLES: '✨',
  EYES: '👀',
  FAME: '🌟',
};

// ─── Fame Rank Titles ─────────────────────────────────────────────────

export const FAME_TIERS = {
  bronze: { label: 'Bronze', color: 'fame-bronze', minScore: 0 },
  silver: { label: 'Silver', color: 'fame-silver', minScore: 1000 },
  gold: { label: 'Gold', color: 'fame-gold', minScore: 5000 },
  platinum: { label: 'Platinum', color: 'fame-platinum', minScore: 15000 },
  diamond: { label: 'Diamond', color: 'fame-diamond', minScore: 50000 },
  legendary: { label: 'Legendary', color: 'fame-legendary', minScore: 100000 },
};

// ─── Color Themes ─────────────────────────────────────────────────────

export const COLOR_THEMES = {
  default: {
    primary: 'primary',
    accent: 'accent',
  },
  sunset: {
    primary: 'orange',
    accent: 'rose',
  },
  ocean: {
    primary: 'cyan',
    accent: 'blue',
  },
  forest: {
    primary: 'emerald',
    accent: 'teal',
  },
  midnight: {
    primary: 'indigo',
    accent: 'violet',
  },
} as const;

// ─── Pagination ───────────────────────────────────────────────────────

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  FEED_LIMIT: 10,
  COMMENT_LIMIT: 15,
  SEARCH_LIMIT: 10,
} as const;

// ─── Miscellaneous ────────────────────────────────────────────────────

export const APP_NAME = 'FameWars';
export const APP_DESCRIPTION = 'Where fame is the ultimate currency';
export const TOAST_DURATION = 3000;
export const MAX_IMAGE_SIZE_MB = 10;
export const MAX_VIDEO_SIZE_MB = 100;
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
export const MAX_BIO_LENGTH = 160;
export const MAX_POST_CHARS = 2200;
export const MAX_COMMENT_CHARS = 500;
export const BATTLE_VOTE_COST = 10;
export const SOCKET_RECONNECT_DELAY = 1000;
export const SOCKET_MAX_RECONNECT_ATTEMPTS = 10;
