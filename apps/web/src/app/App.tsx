import { useState, lazy, Suspense } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from '../lib/auth-context';
import LoginView from './LoginView';
import AuroraBackground from '../components/AuroraBackground';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';
import ErrorBoundary from '../components/ErrorBoundary';
import type { View } from '../lib/types';

const LandingView = lazy(() => import('../views/LandingView'));
const FeedView = lazy(() => import('../views/FeedView'));
const ProfileView = lazy(() => import('../views/ProfileView'));
const ReelsView = lazy(() => import('../views/ReelsView'));
const BattlesView = lazy(() => import('../views/BattlesView'));
const AIView = lazy(() => import('../views/AIView'));
const MessagesView = lazy(() => import('../views/MessagesView'));
const SocialCardsView = lazy(() => import('../views/SocialCardsView'));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full p-8">
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-white/30 text-xs font-medium">Loading...</span>
      </div>
    </div>
  );
}
function MainApp() {
  const { isAuthenticated } = useAuth();
  const [view, setView] = useState<View>('landing');
  const [profileUsername, setProfileUsername] = useState<string | null>(null);

  const goToProfile = (username: string) => {
    setProfileUsername(username);
    setView('profile');
  };

  if (!isAuthenticated) {
    return <LoginView />;
  }

  const renderView = () => {
    const shared = { onChange: setView, onViewProfile: goToProfile };
    switch (view) {
      case 'landing': return <LandingView key="landing" onChange={setView} />;
      case 'feed': return <FeedView key="feed" {...shared} />;
      case 'profile': return <ProfileView key="profile" username={profileUsername} onViewProfile={goToProfile} />;
      case 'reels': return <ReelsView key="reels" {...shared} />;
      case 'battles': return <BattlesView key="battles" {...shared} />;
      case 'ai': return <AIView key="ai" {...shared} />;
      case 'messages': return <MessagesView key="messages" {...shared} />;
      case 'cards': return <SocialCardsView key="cards" {...shared} />;
      default: return null;
    }
  };

  return (
    <ErrorBoundary>
      <div className="dark min-h-screen overflow-hidden bg-background font-body">
        <AuroraBackground />
        <div className="flex min-h-screen relative z-10">
          <Sidebar current={view} onChange={setView} />
          <main className="flex-1 overflow-hidden h-screen pb-16 md:pb-0">
            <Suspense fallback={<LoadingFallback />}>
              <AnimatePresence mode="wait">
                {renderView()}
              </AnimatePresence>
            </Suspense>
          </main>
          <MobileNav current={view} onChange={setView} />
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
