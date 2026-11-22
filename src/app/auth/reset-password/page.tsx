'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/i18n/context';
import { useToast } from '@/components/ui/Toast';
import { createClient } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Sprout, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const toast = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isDone, setIsDone] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

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
        setErrorMsg('Supabase is not configured.');
        setIsLoading(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setErrorMsg(error.message);
        toast.error(error.message);
      } else {
        setIsDone(true);
        toast.success('Password updated successfully.');
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Password update failed';
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
            Set New Password
          </CardTitle>
          <CardDescription>
            Choose a strong password for your farmer account.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isDone ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h4 className="text-sm font-bold text-emerald-950">
                Password Changed!
              </h4>
              <p className="text-xs text-emerald-900 leading-relaxed">
                Your password has been reset. Redirecting you to your farm dashboard...
              </p>
            </div>
          ) : (
            <form onSubmit={handleUpdate} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <Input
                label="New Password"
                isPassword
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
              />

              <Input
                label="Confirm New Password"
                isPassword
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-2"
                isLoading={isLoading}
              >
                Save New Password
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
