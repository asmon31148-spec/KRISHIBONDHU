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
import { Sprout, Sparkles, AlertCircle } from 'lucide-react';

export default function SignupPage() {
  const { t, language } = useTranslation();
  const { guestToken, guestScanCount } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strength = getPasswordStrength(password);
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const strengthColors = ['bg-red-500', 'bg-amber-500', 'bg-yellow-500', 'bg-emerald-500', 'bg-green-600'];

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg(t('auth.passwordTooShort'));
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg(t('auth.passwordMismatch'));
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      if (!supabase) {
        // Honest notification about Supabase configuration
        setErrorMsg('Supabase is not yet configured. Please configure your project keys in .env.local.');
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            preferred_language: language,
            guest_token: guestToken,
          },
        },
      });

      if (error) {
        setErrorMsg(error.message);
        toast.error(error.message);
        setIsLoading(false);
        return;
      }

      toast.success(t('auth.signupSuccess'));

      // If session exists immediately (email confirmation disabled in Supabase), proceed to onboarding
      if (data.session) {
        router.push('/onboarding');
      } else {
        // Email verification required
        router.push('/auth/login?verified=pending');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      setErrorMsg(msg);
      toast.error('Registration failed');
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
            {t('auth.signupTitle')}
          </CardTitle>
          <CardDescription>
            {t('auth.signupSubtitle')}
          </CardDescription>

          {/* Guest scan carry-over banner */}
          {guestScanCount > 0 && (
            <div className="mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-left flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-brand-harvest shrink-0 mt-0.5" />
              <p className="text-xs text-amber-900 leading-snug">
                You have {guestScanCount} guest scan{guestScanCount > 1 ? 's' : ''}. Creating an account will automatically link them to your permanent profile!
              </p>
            </div>
          )}
        </CardHeader>

        <CardContent>
          {errorMsg && (
            <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <Input
              label={t('auth.fullName')}
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Subir Ghosh"
            />

            <Input
              label={t('auth.email')}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="farmer@example.com"
            />

            <div className="space-y-1.5">
              <Input
                label={t('auth.password')}
                isPassword
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
              />
              {password && (
                <div className="space-y-1">
                  <div className="h-1.5 w-full bg-cream-200 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full transition-all duration-300 ${strengthColors[strength - 1] || 'bg-red-500'}`}
                      style={{ width: `${Math.min(100, strength * 20)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-right text-brand-dark/60 font-medium">
                    Strength: {strengthLabels[Math.max(0, strength - 1)]}
                  </p>
                </div>
              )}
            </div>

            <Input
              label={t('auth.confirmPassword')}
              isPassword
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              {t('auth.registerCta')}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-cream-200 text-center space-y-3">
            <p className="text-xs text-brand-dark/70">
              {t('auth.alreadyHaveAccount')}{' '}
              <Link href="/auth/login" className="font-bold text-brand-leaf hover:underline">
                {t('auth.loginCta')}
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
