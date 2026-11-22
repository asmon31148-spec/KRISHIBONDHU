'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/i18n/context';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { createClient } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Sprout, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { t } = useTranslation();
  const { refreshProfile } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const supabase = createClient();
      if (!supabase) {
        setErrorMsg('Supabase is not configured. Please add your credentials in .env.local.');
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
        toast.error(error.message);
        setIsLoading(false);
        return;
      }

      if (data.user) {
        await refreshProfile();
        toast.success(t('auth.loginSuccess'));

        // Check if onboarding completed
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', data.user.id)
          .single();

        if (profile && !profile.onboarding_completed) {
          router.push('/onboarding');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setErrorMsg(msg);
      toast.error('Login failed');
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
            {t('auth.loginTitle')}
          </CardTitle>
          <CardDescription>
            {t('auth.loginSubtitle')}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {errorMsg && (
            <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label={t('auth.email')}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="farmer@example.com"
            />

            <div className="space-y-1">
              <Input
                label={t('auth.password')}
                isPassword
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
              <div className="text-right">
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-brand-leaf font-medium hover:underline"
                >
                  {t('auth.forgotPassword')}
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              {t('auth.loginCta')}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-cream-200 text-center space-y-3">
            <p className="text-xs text-brand-dark/70">
              {t('auth.dontHaveAccount')}{' '}
              <Link href="/auth/signup" className="font-bold text-brand-leaf hover:underline">
                {t('auth.registerCta')}
              </Link>
            </p>
            <p className="text-xs text-brand-dark/60">
              <Link href="/" className="hover:underline">
                {t('auth.continueAsGuest')} →
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
