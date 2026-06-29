'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { PostGrid } from '@/components/posts/post-grid';

const trendingHashtags = [
  { name: 'viral', postsCount: 12450 },
  { name: 'famewars', postsCount: 8920 },
  { name: 'trending', postsCount: 7600 },
  { name: 'music', postsCount: 5400 },
  { name: 'dance', postsCount: 4300 },
];

const recommendedUsers = [
  { id: '1', username: 'influencer_1', displayName: 'Influencer One', avatarUrl: null },
  { id: '2', username: 'creator_2', displayName: 'Creator Two', avatarUrl: null },
  { id: '3', username: 'star_3', displayName: 'Star Three', avatarUrl: null },
];

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-6 text-2xl font-bold">Explore</h1>

      <Input
        placeholder="Search users, hashtags, or content..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-8"
      />

      <div className="mb-8 grid gap-8 md:grid-cols-[1fr_300px]">
        <div>
          <h2 className="mb-4 text-lg font-semibold">Trending posts</h2>
          <PostGrid />
        </div>

        <aside className="space-y-6">
          <Card className="p-4">
            <h3 className="mb-3 font-semibold">Trending hashtags</h3>
            <div className="space-y-2">
              {trendingHashtags.map((tag) => (
                <div
                  key={tag.name}
                  className="flex items-center justify-between"
                >
                  <Badge variant="trending">#{tag.name}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {tag.postsCount.toLocaleString()} posts
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="mb-3 font-semibold">Recommended users</h3>
            <div className="space-y-3">
              {recommendedUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-3">
                  <Avatar
                    src={user.avatarUrl}
                    alt={user.username}
                    size="md"
                  />
                  <div>
                    <p className="text-sm font-medium">{user.displayName}</p>
                    <p className="text-xs text-muted-foreground">
                      @{user.username}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
