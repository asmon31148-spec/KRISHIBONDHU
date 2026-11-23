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
  const [bookmarkedUrls, setBookmarkedUrls] = useState<Set<string>>(new Set());
  const [isGuestPromptOpen, setIsGuestPromptOpen] = useState(false);

  const loadNews = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.set('category', selectedCategory);
      if (searchQuery.trim()) params.set('q', searchQuery.trim());

      const res = await fetch(`/api/news?${params.toString()}`);
      const data = await res.json();
      if (data.articles) {
        setArticles(data.articles);
      }
    } catch (err) {
      console.error('Failed to load news:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, searchQuery]);

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
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-forest">
          Agricultural News & Policy Bulletins
        </h1>
        <p className="text-xs sm:text-sm text-brand-dark/70 mt-1">
          Authentic extension dispatches from Ministry of Agriculture, ICAR, and Government of West Bengal.
        </p>
      </div>

      {/* Search and Category Filters */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-brand-dark/50 absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search news by crop, fertilizer, scheme name..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-300 bg-white text-xs sm:text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-emerald min-h-[44px]"
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
                  ? 'bg-brand-forest text-white border-brand-forest shadow-xs'
                  : 'bg-white text-brand-dark/75 border-cream-200 hover:border-brand-leaf/40'
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
                  <div className="flex items-center justify-between text-xs text-brand-dark/70">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-brand-forest flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" />
                        {article.source}
                      </span>
                      {article.isArchival && (
                        <span className="px-2 py-0.5 rounded-full bg-cream-200 text-brand-dark/70 text-[10px] font-semibold">
                          Archival Reference
                        </span>
                      )}
                    </div>
                    <span className="flex items-center gap-1 text-[11px] text-brand-dark/60">
                      <Calendar className="w-3 h-3" />
                      {new Date(article.publishedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-brand-dark leading-snug">
                    {article.title}
                  </h3>

                  <p className="text-xs text-brand-dark/75 leading-relaxed line-clamp-3">
                    {article.description}
                  </p>
                </div>

                {/* Footer with External Link & Bookmark */}
                <div className="px-4 sm:px-5 py-3 bg-cream-50 border-t border-cream-200/90 flex items-center justify-between">
                  <a
                    href={article.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-brand-leaf hover:text-brand-forest inline-flex items-center gap-1 hover:underline"
                  >
                    <span>Read Full Official Release</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => toggleBookmark(article)}
                    className="p-1.5 rounded-lg text-brand-dark/60 hover:text-brand-forest hover:bg-cream-200 transition-colors"
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
