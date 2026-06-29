'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  Clock,
  TrendingUp,
  Hash,
  User,
  Image,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';

interface SearchResult {
  id: string;
  type: 'user' | 'hashtag' | 'post';
  label: string;
  subtitle?: string;
  imageUrl?: string | null;
}

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch?: (query: string) => void;
  searchResults?: SearchResult[];
  trending?: { tag: string; postsCount: number }[];
  recentSearches?: string[];
  onClearRecent?: () => void;
  onResultClick?: (result: SearchResult) => void;
  isLoading?: boolean;
  className?: string;
}

export function SearchOverlay({
  isOpen,
  onClose,
  onSearch,
  searchResults,
  trending = [],
  recentSearches = [],
  onClearRecent,
  onResultClick,
  isLoading = false,
  className,
}: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (debouncedQuery) {
      onSearch?.(debouncedQuery);
    }
  }, [debouncedQuery, onSearch]);

  const handleClose = () => {
    setQuery('');
    onClose();
  };

  const hasQuery = query.trim().length > 0;
  const showResults = hasQuery && searchResults;
  const showTrending = !hasQuery && trending.length > 0;
  const showRecent = !hasQuery && recentSearches.length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            className={cn(
              'relative max-w-2xl mx-auto mt-16 mx-4 glass-heavy rounded-2xl shadow-2xl max-h-[80vh] overflow-hidden',
              className,
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 p-4 border-b border-white/10">
              <button
                onClick={handleClose}
                className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-glass-light transition-colors lg:hidden"
              >
                <ArrowLeft size={20} />
              </button>

              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="Search FameWars..."
                  className="glass-input w-full pl-10 pr-4 py-2.5 text-sm rounded-xl"
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <button
                onClick={handleClose}
                className="hidden lg:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(80vh-73px)] custom-scrollbar">
              {isLoading && (
                <div className="flex justify-center py-8">
                  <Spinner size="md" />
                </div>
              )}

              {showResults && searchResults && (
                <div className="p-2">
                  {searchResults.length === 0 ? (
                    <div className="text-center py-8">
                      <Search size={32} className="mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No results for &ldquo;{query}&rdquo;
                      </p>
                    </div>
                  ) : (
                    searchResults.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => onResultClick?.(result)}
                        className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-glass-light transition-colors"
                      >
                        {result.type === 'user' ? (
                          <Avatar
                            src={result.imageUrl}
                            name={result.label}
                            size="md"
                          />
                        ) : result.type === 'hashtag' ? (
                          <div className="size-10 rounded-full bg-glass-light flex items-center justify-center text-primary-500">
                            <Hash size={18} />
                          </div>
                        ) : (
                          <div className="size-10 rounded-lg bg-glass-light flex items-center justify-center overflow-hidden">
                            {result.imageUrl ? (
                              <img
                                src={result.imageUrl}
                                alt=""
                                className="size-full object-cover"
                              />
                            ) : (
                              <Image size={18} className="text-muted-foreground" />
                            )}
                          </div>
                        )}

                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-sm font-medium text-foreground truncate">
                            {result.label}
                          </p>
                          {result.subtitle && (
                            <p className="text-xs text-muted-foreground truncate">
                              {result.subtitle}
                            </p>
                          )}
                        </div>

                        <Badge variant="default" className="shrink-0">
                          {result.type}
                        </Badge>
                      </button>
                    ))
                  )}
                </div>
              )}

              {showTrending && (
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={16} className="text-primary-500" />
                    <h3 className="text-sm font-semibold text-foreground">
                      Trending
                    </h3>
                  </div>

                  <div className="space-y-1">
                    {trending.map((item, i) => (
                      <button
                        key={item.tag}
                        onClick={() => setQuery(item.tag)}
                        className="flex items-center justify-between w-full p-3 rounded-xl hover:bg-glass-light transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-muted-foreground w-5 text-right">
                            {i + 1}
                          </span>
                          <div className="text-left">
                            <p className="text-sm font-medium text-foreground">
                              #{item.tag}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.postsCount.toLocaleString()} posts
                            </p>
                          </div>
                        </div>
                        <TrendingUp size={14} className="text-rose-500" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {showRecent && (
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-muted-foreground" />
                      <h3 className="text-sm font-semibold text-foreground">
                        Recent
                      </h3>
                    </div>
                    <button
                      onClick={onClearRecent}
                      className="text-xs font-medium text-primary-500 hover:text-primary-400 transition-colors"
                    >
                      Clear all
                    </button>
                  </div>

                  <div className="space-y-1">
                    {recentSearches.map((search, i) => (
                      <button
                        key={`${search}-${i}`}
                        onClick={() => setQuery(search)}
                        className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-glass-light transition-colors"
                      >
                        <Clock size={16} className="text-muted-foreground shrink-0" />
                        <span className="text-sm text-foreground flex-1 text-left truncate">
                          {search}
                        </span>
                        <X
                          size={14}
                          className="text-muted-foreground hover:text-foreground shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!hasQuery && !showTrending && !showRecent && (
                <div className="text-center py-12">
                  <Search size={40} className="mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Search for people, hashtags, and posts
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
