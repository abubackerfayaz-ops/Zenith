export type View = "landing" | "feed" | "profile" | "reels" | "battles" | "ai" | "messages" | "cards";

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

export interface PaginatedResponse<T> {
  data: T[];
  meta: { total: number; page: number; limit: number };
}
