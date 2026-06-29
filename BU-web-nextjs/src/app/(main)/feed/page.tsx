'use client';

import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { StoryAvatar } from '@/components/stories/story-avatar';

const CreatePostModal = dynamic(
  () =>
    import('@/components/layout/create-post-modal').then(
      (m) => m.CreatePostModal,
    ),
  {
    loading: () => <Spinner size="sm" />,
  },
);

const PostCard = dynamic(
  () => import('@/components/posts/post-card').then((m) => m.PostCard),
  {
    loading: () => <Spinner size="sm" />,
  },
);

const stories = Array.from({ length: 8 }, (_, i) => ({
  id: `story-${i}`,
  username: `user_${i}`,
  avatarUrl: null,
  hasStory: i < 6,
  isLive: i === 0,
}));

const feedPosts = Array.from({ length: 5 }, (_, i) => ({
  id: `post-${i}`,
}));

export default function FeedPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Feed</h1>
        <CreatePostModal />
      </div>

      <div className="scrollbar-hide mb-6 flex gap-4 overflow-x-auto">
        {stories.map((story) => (
          <StoryAvatar
            key={story.id}
            username={story.username}
            avatarUrl={story.avatarUrl}
            hasStory={story.hasStory}
            isLive={story.isLive}
          />
        ))}
      </div>

      <div className="space-y-4">
        {feedPosts.map((post) => (
          <PostCard key={post.id} postId={post.id} />
        ))}
      </div>

      <div className="mt-6 flex justify-center">
        <Button variant="ghost" size="sm">
          Load more
        </Button>
      </div>
    </div>
  );
}
