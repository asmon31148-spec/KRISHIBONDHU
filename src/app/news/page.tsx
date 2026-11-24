'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { GuestSavePrompt } from '@/components/auth/GuestSavePrompt';
import {
  Newspaper,
  Search,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Calendar,
  Building2,
  RefreshCw,
} from 'lucide-react';
import type { NewsArticle } from '@/lib/news/aggregator';

const CATEGORIES = [
  { id: 'all', label: 'All Updates' },
  { id: 'schemes', label: 'Government Schemes' },
  { id: 'technology', label: 'Agronomy & Tech' },
  { id: 'fertilizer', label: 'Fertilizers & Subsidies' },
  { id: 'mandi', label: 'Mandi Rates' },
];

export default function NewsPage() {
  const { isGuest } = useAuth();
  const toast = useToast();

  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [bookmarkedUrls, setBookmarkedUrls] = useState<Set<string>>(new Set());
  const [isGuestPromptOpen, setIsGuestPromptOpen] = useState(false);

  const loadNews = useCallback(async (forceRefresh: boolean = false) => {
    if (forceRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.set('category', selectedCategory);
      if (searchQuery.trim()) params.set('q', searchQuery.trim());
      if (forceRefresh) params.set('refresh', 'true');

      const res = await fetch(`/api/news?${params.toString()}`);
      const data = await res.json();
      if (data.articles) {
        setArticles(data.articles);
      }
      if (data.lastUpdated) {
        setLastUpdated(data.lastUpdated);
      }
      if (forceRefresh) {
        toast.success('Live news feeds synchronized.');
      }
    } catch (err) {
      console.error('Failed to load news:', err);
      if (forceRefresh) {
        toast.error('Could not refresh news feeds.');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedCategory, searchQuery, toast]);

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  const toggleBookmark = async (article: NewsArticle) => {
    if (isGuest) {
      setIsGuestPromptOpen(true);
      return;
    }

    try {
      const res = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleUrl: article.sourceUrl,
          title: article.title,
          source: article.source,
          publishedAt: article.publishedAt,
          imageUrl: article.imageUrl,
        }),
      });
      const data = await res.json();
      setBookmarkedUrls((prev) => {
        const next = new Set(prev);
        if (data.bookmarked) {
          next.add(article.sourceUrl);
          toast.success('Article bookmarked.');
        } else {
          next.delete(article.sourceUrl);
          toast.info('Bookmark removed.');
        }
        return next;
      });
    } catch {
      toast.error('Could not save bookmark.');
    }
  };

  return (
    <div className="space-y-6 w-full text-left">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-forest dark:text-white">
            Agricultural News & Policy Bulletins
          </h1>
          <p className="text-xs sm:text-sm text-brand-dark/70 dark:text-slate-400 mt-1">
            Authentic extension dispatches from Ministry of Agriculture, ICAR, and Government of West Bengal.
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => loadNews(true)}
            disabled={isRefreshing || isLoading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-[#141C2B] border border-[#143224]/15 dark:border-slate-800 hover:bg-[#EAF2EC] dark:hover:bg-slate-800 text-[#143224] dark:text-white text-xs font-bold transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
            title="Fetch latest live RSS feeds"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#D9822B]' : 'text-[#1E4733] dark:text-emerald-400'}`} />
            <span>{isRefreshing ? 'Syncing Feeds...' : 'Refresh Live News'}</span>
          </button>
          {lastUpdated && (
            <span className="text-[11px] text-[#10241A]/60 dark:text-slate-400 hidden sm:inline font-medium">
              Updated: {new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </div>

      {/* Search and Category Filters */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-brand-dark/50 dark:text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search news by crop, fertilizer, scheme name..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-300 dark:border-slate-800 bg-white dark:bg-[#141C2B] text-xs sm:text-sm text-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-emerald min-h-[44px]"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`text-xs px-3.5 py-1.5 rounded-xl font-bold border transition-all ${
                selectedCategory === cat.id
                  ? 'bg-brand-forest dark:bg-emerald-600 text-white border-brand-forest dark:border-emerald-600 shadow-xs'
                  : 'bg-white dark:bg-[#141C2B] text-brand-dark/75 dark:text-slate-300 border-cream-200 dark:border-slate-800 hover:border-brand-leaf/40 dark:hover:border-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* News Articles Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 bg-cream-100 rounded-2xl border border-cream-200" />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <EmptyState
          icon={<Newspaper className="w-8 h-8" />}
          title="No Agriculture News Found"
          description="Try broadening your search keywords or switching category filters."
          actionLabel="View All News"
          onAction={() => {
            setSelectedCategory('all');
            setSearchQuery('');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {articles.map((article) => {
            const isBookmarked = bookmarkedUrls.has(article.sourceUrl);

            return (
              <Card
                key={article.id}
                className="overflow-hidden hover:border-brand-leaf/40 hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div className="p-4 sm:p-5 space-y-3">
                  {/* Source & Date Header */}
                  <div className="flex items-center justify-between text-xs text-brand-dark/70 dark:text-slate-400">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-brand-forest dark:text-emerald-400 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" />
                        {article.source}
                      </span>
                      {article.isArchival && (
                        <span className="px-2 py-0.5 rounded-full bg-cream-200 dark:bg-slate-800 text-brand-dark/70 dark:text-slate-300 text-[10px] font-semibold">
                          Archival Reference
                        </span>
                      )}
                    </div>
                    <span className="flex items-center gap-1 text-[11px] text-brand-dark/60 dark:text-slate-400">
                      <Calendar className="w-3 h-3" />
                      {new Date(article.publishedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-brand-dark dark:text-white leading-snug">
                    {article.title}
                  </h3>

                  <p className="text-xs text-brand-dark/75 dark:text-slate-300 leading-relaxed line-clamp-3">
                    {article.description}
                  </p>
                </div>

                {/* Footer with External Link & Bookmark */}
                <div className="px-4 sm:px-5 py-3 bg-cream-50 dark:bg-[#1B2537] border-t border-cream-200/90 dark:border-slate-800 flex items-center justify-between">
                  <a
                    href={article.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-brand-leaf dark:text-emerald-400 hover:text-brand-forest dark:hover:text-emerald-300 inline-flex items-center gap-1 hover:underline"
                  >
                    <span>Read Full Official Release</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => toggleBookmark(article)}
                    className="p-1.5 rounded-lg text-brand-dark/60 dark:text-slate-400 hover:text-brand-forest dark:hover:text-white hover:bg-cream-200 dark:hover:bg-slate-700 transition-colors"
                    aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
                  >
                    {isBookmarked ? (
                      <BookmarkCheck className="w-4 h-4 text-brand-harvest" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Guest Mode Bookmark Protection Prompt */}
      <GuestSavePrompt
        isOpen={isGuestPromptOpen}
        onClose={() => setIsGuestPromptOpen(false)}
        featureName="Article Bookmarking"
      />
    </div>
  );
}
