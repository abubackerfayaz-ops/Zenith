import {
  Home, Search, Play, Brain, MessageCircle, User, Zap, Share2, Bell
} from 'lucide-react';
import type { View } from './types';

export const NAV: { id: View; icon: React.ElementType; label: string; badge?: number }[] = [
  { id: 'landing',  icon: Home,          label: 'Home' },
  { id: 'feed',     icon: Search,        label: 'Discover' },
  { id: 'reels',    icon: Play,          label: 'Reels' },
  { id: 'battles',  icon: Zap,           label: 'Battles' },
  { id: 'ai',       icon: Brain,         label: 'AI Studio' },
  { id: 'notifications', icon: Bell,     label: 'Notifications' },
  { id: 'messages', icon: MessageCircle, label: 'Messages' },
  { id: 'profile',  icon: User,          label: 'Profile' },
  { id: 'cards',    icon: Share2,        label: 'My Cards' },
];

export const FEATURES = [
  { icon: 'Flame',     title: 'Fame Score',       desc: 'AI reputation scoring that ranks your global impact in real-time.', color: '#F97316' },
  { icon: 'Brain',     title: 'Viral Predictor',  desc: 'Know which posts will explode before you ever hit publish.',        color: '#8B5CF6' },
  { icon: 'Zap',       title: 'Creator Battles',  desc: 'Head-to-head competitions with live voting and real prize pools.',  color: '#EC4899' },
  { icon: 'DollarSign',title: 'Revenue Engine',   desc: 'Monetize via battles, brand deals, tipping, and subscriptions.',   color: '#10B981' },
];

export const STATS = [
  { value: '10M+', label: 'Active Creators', color: '#A78BFA' },
  { value: '$50M', label: 'Creator Payouts',  color: '#06B6D4' },
  { value: '1.2B', label: 'Daily Views',      color: '#EC4899' },
  { value: '47K',  label: 'Live Battles',     color: '#10B981' },
];
