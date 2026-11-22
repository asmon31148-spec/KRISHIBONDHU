'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/i18n/context';
import { useToast } from '@/components/ui/Toast';
import { createClient } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Sprout, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const supabase = createClient();
      if (!supabase) {
        setErrorMsg('Supabase is not configured. Please check your setup.');
        setIsLoading(false);
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        setErrorMsg(error.message);
        toast.error(error.message);
      } else {
        setIsSent(true);
        toast.success('Password reset email dispatched.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to dispatch reset email';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-6 sm:py-10">
      <Card className="shadow-lg border-cream-200">
        <CardHeader className="text-center pb-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-forest/10 border border-brand-forest/20 flex items-center justify-center text-brand-forest mx-auto mb-2">
            <Sprout className="w-6 h-6 text-brand-leaf" />
          </div>
          <CardTitle className="text-2xl font-extrabold text-brand-forest">
            {t('auth.resetPasswordTitle')}
          </CardTitle>
          <CardDescription>
            {t('auth.resetPasswordDesc')}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isSent ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h4 className="text-sm font-bold text-emerald-950">
                Check Your Inbox
              </h4>
              <p className="text-xs text-emerald-900 leading-relaxed">
                We sent password reset instructions to <strong>{email}</strong>. Follow the link in the email to set a new password.
              </p>
              <Link href="/auth/login" className="inline-block mt-2">
                <Button variant="outline" size="sm">
                  {t('auth.backToLogin')}
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <Input
                label={t('auth.email')}
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="farmer@example.com"
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-2"
                isLoading={isLoading}
              >
                {t('auth.sendResetLink')}
              </Button>

              <div className="text-center pt-2">
                <Link
                  href="/auth/login"
                  className="text-xs text-brand-leaf font-semibold inline-flex items-center gap-1 hover:underline"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{t('auth.backToLogin')}</span>
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
