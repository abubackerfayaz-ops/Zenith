export type View = "landing" | "feed" | "profile" | "reels" | "battles" | "ai" | "messages" | "cards" | "notifications" | "settings";

export interface User {
  id: string;
  email?: string;
  username: string;
  displayName?: string;
  bio?: string;
  profilePicture?: string;
  coverImage?: string;
  role: string;
  isVerified: boolean;
  fameScore?: { score: number } | null;
  _count?: { followers: number; following: number; posts: number };
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Post {
  id: string;
  type: string;
  caption?: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  viewsCount: number;
  createdAt: string;
  user: User;
  media: { url: string; type: string }[];
}

export interface Comment {
  id: string;
  text: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    profilePicture?: string;
    isVerified: boolean;
  };
  _count?: { likes: number; replies: number };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: { total: number; page: number; limit: number };
}
