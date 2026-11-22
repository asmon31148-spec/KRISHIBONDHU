'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/i18n/context';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Bell,
  CloudSun,
  Calendar,
  ExternalLink,
  Check,
} from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: 'weather' | 'disease_risk' | 'irrigation' | 'harvest' | 'system';
  is_read: boolean;
  action_url: string | null;
  created_at: string;
}

export default function NotificationsPage() {
  const { t } = useTranslation();
  const { user, isGuest } = useAuth();
  const toast = useToast();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.notifications) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error('Error loading notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const markAsRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id || id === 'all' ? { ...n, is_read: true } : n))
      );
      toast.success(id === 'all' ? 'All alerts marked as read.' : 'Alert marked as read.');
    } catch {
      toast.error('Could not update notification.');
    }
  };

  if (isGuest) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 text-brand-harvest flex items-center justify-center mx-auto">
          <Bell className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-brand-forest">
          Notifications (Account Required)
        </h2>
        <p className="text-xs sm:text-sm text-brand-dark/70 leading-relaxed">
          In-app alerts for weather risks, spraying warnings, and harvest reminders require a signed-in farmer profile.
        </p>
        <div className="pt-2">
          <Link href="/auth/signup">
            <Button variant="primary">
              {t('nav.saveAccount')}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-forest">
              Farmer Alerts & Notifications
            </h1>
            {unreadCount > 0 && (
              <Badge variant="amber" size="sm">
                {unreadCount} Unread
              </Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-brand-dark/70 mt-1">
            Real weather warnings, spray advisories, and crop health notifications.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAsRead('all')}
            leftIcon={<Check className="w-3.5 h-3.5 text-emerald-600" />}
          >
            Mark All Read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-cream-100 rounded-2xl border border-cream-200" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-8 h-8" />}
          title="No Active Alerts"
          description="Your farm plots and crops currently have no active disease or extreme weather warnings."
          actionLabel="Check Weather Advisory"
          onAction={() => (window.location.href = '/weather')}
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((item) => (
            <Card
              key={item.id}
              className={`transition-all ${
                item.is_read
                  ? 'bg-white opacity-80'
                  : 'bg-cream-50/80 border-brand-leaf/40 shadow-xs'
              }`}
            >
              <CardContent className="p-4 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2.5 rounded-xl shrink-0 ${
                      item.category === 'weather'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-brand-forest/10 text-brand-forest'
                    }`}
                  >
                    {item.category === 'weather' ? (
                      <CloudSun className="w-5 h-5 text-brand-harvest" />
                    ) : (
                      <Bell className="w-5 h-5 text-brand-leaf" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-brand-dark">
                        {item.title}
                      </h4>
                      {!item.is_read && (
                        <span className="w-2 h-2 rounded-full bg-brand-harvest" />
                      )}
                    </div>
                    <p className="text-xs text-brand-dark/80 leading-relaxed">
                      {item.message}
                    </p>
                    <div className="flex items-center gap-3 pt-1 text-[11px] text-brand-dark/60">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                      {item.action_url && (
                        <Link
                          href={item.action_url}
                          className="font-bold text-brand-forest hover:underline inline-flex items-center gap-0.5"
                        >
                          <span>View Action</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {!item.is_read && (
                  <button
                    onClick={() => markAsRead(item.id)}
                    className="p-1.5 rounded-lg text-brand-dark/50 hover:text-brand-dark hover:bg-cream-200 transition-colors shrink-0"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4 text-emerald-600" />
                  </button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
