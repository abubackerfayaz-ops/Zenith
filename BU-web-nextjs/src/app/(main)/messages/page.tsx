'use client';

import { useState } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { ChatList } from '@/components/messaging/chat-list';
import { ChatWindow } from '@/components/messaging/chat-window';
import { EmptyState } from '@/components/ui/empty-state';

export default function MessagesPage() {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const showList = !isMobile || !activeChatId;
  const showChat = !isMobile || !!activeChatId;

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-4xl overflow-hidden rounded-xl border border-border">
      {showList && (
        <div
          className={`${
            isMobile ? 'w-full' : 'w-80'
          } border-r border-border`}
        >
          <ChatList
            activeChatId={activeChatId}
            onSelectChat={setActiveChatId}
          />
        </div>
      )}
      {showChat ? (
        <div className="flex-1">
          {activeChatId ? (
            <ChatWindow
              chatId={activeChatId}
              onBack={() => setActiveChatId(null)}
            />
          ) : (
            <EmptyState
              icon="💬"
              title="Select a conversation"
              description="Choose a chat from the left to start messaging"
            />
          )}
        </div>
      ) : null}
    </div>
  );
}
