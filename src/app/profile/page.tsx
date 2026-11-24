'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation, Language } from '@/i18n/context';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { createClient } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import {
  User,
  Trash2,
  Lock,
  Globe,
  Sparkles,
  CloudSun,
  Bot,
  CheckCircle2,
  PhoneCall,
  ArrowRight,
} from 'lucide-react';

export default function ProfilePage() {
  const { t, language, setLanguage } = useTranslation();
  const { user, profile, isGuest, refreshProfile, signOut } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [state, setState] = useState(profile?.state || 'West Bengal');
  const [district, setDistrict] = useState(profile?.district || '');
  const [village, setVillage] = useState(profile?.village || '');
  const [isSaving, setIsSaving] = useState(false);

  // Password Update
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Delete Account Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setState(profile.state || 'West Bengal');
      setDistrict(profile.district || '');
      setVillage(profile.village || '');
    }
  }, [profile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      const supabase = createClient();
      if (!supabase) return;

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          phone: phone.trim() || null,
          state: state.trim(),
          district: district.trim() || null,
          village: village.trim() || null,
          preferred_language: language,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        toast.error('Update failed: ' + error.message);
      } else {
        await refreshProfile();
        toast.success('Profile details updated successfully!');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating profile';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (newPassword.length < 6) {
      toast.error(t('auth.passwordTooShort'));
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t('auth.passwordMismatch'));
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const supabase = createClient();
      if (!supabase) return;

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        toast.error('Password update failed: ' + error.message);
      } else {
        toast.success('Password changed successfully.');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to change password';
      toast.error(msg);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    if (deleteConfirmationText !== 'DELETE') {
      toast.error('Please type DELETE to confirm.');
      return;
    }

    setIsDeleting(true);
    try {
      const supabase = createClient();
      if (!supabase) return;

      // Delete user's profile and cascade via foreign keys
      await supabase.from('profiles').delete().eq('id', user.id);
      await signOut();
      toast.success('Your account and all associated farming data have been permanently removed.');
      router.push('/');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Deletion error';
      toast.error(msg);
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  if (isGuest) {
    return (
      <div className="max-w-xl mx-auto py-3 sm:py-8 space-y-4 sm:space-y-6 text-left">
        {/* Farmer Guest Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-forest via-brand-forest/95 to-brand-leaf p-5 sm:p-7 text-white shadow-md">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/15  border border-white/20 flex items-center justify-center text-white shrink-0">
                <User className="w-6 h-6 sm:w-7 sm:h-7 text-brand-mint" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] sm:text-xs font-semibold mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Guest Mode Active
                </div>
                <h2 className="text-lg sm:text-2xl font-extrabold text-white leading-tight">
                  Farmer Guest Profile
                </h2>
                <p className="text-xs text-white/75 mt-0.5">
                  Using local device session
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/15 flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={() => router.push('/auth/signup')}
              className="w-full py-3 px-4 rounded-xl bg-white text-brand-forest font-bold text-xs sm:text-sm hover:bg-cream-100 transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-4 h-4 text-brand-leaf" />
            </button>
            <button
              onClick={() => router.push('/auth/login')}
              className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/25 text-white font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Sign In with Existing Account</span>
            </button>
          </div>
        </div>

        {/* Why Create an Account (Benefits) */}
        <div className="bg-white dark:bg-[#111418] rounded-3xl border border-cream-200/90 dark:border-white/10 p-4 sm:p-6 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-cream-200 dark:border-white/10">
            <Sparkles className="w-4 h-4 text-brand-harvest" />
            <h3 className="text-xs sm:text-sm font-bold text-brand-forest dark:text-emerald-400 uppercase tracking-wider">
              Why save your farmer profile?
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <div className="p-3 rounded-2xl bg-cream-50 dark:bg-[#000000] border border-cream-200/80 dark:border-white/10 flex sm:flex-col items-center sm:items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-brand-forest/10 flex items-center justify-center text-brand-forest dark:text-emerald-400 shrink-0">
                <CheckCircle2 className="w-4 h-4 text-brand-leaf dark:text-emerald-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-brand-dark dark:text-white">Cloud Sync</h4>
                <p className="text-[11px] text-brand-dark/70 dark:text-white/60 leading-snug mt-0.5">
                  Access crop diagnoses and farm records on both mobile & PC.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-cream-50 dark:bg-[#000000] border border-cream-200/80 dark:border-white/10 flex sm:flex-col items-center sm:items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-700 shrink-0">
                <CloudSun className="w-4 h-4 text-brand-harvest" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-brand-dark dark:text-white">District Alerts</h4>
                <p className="text-[11px] text-brand-dark/70 dark:text-white/60 leading-snug mt-0.5">
                  Personalized spray advisories tailored to your specific district.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-cream-50 dark:bg-[#000000] border border-cream-200/80 dark:border-white/10 flex sm:flex-col items-center sm:items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shrink-0">
                <Bot className="w-4 h-4 text-brand-leaf dark:text-emerald-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-brand-dark dark:text-white">Saved Chat History</h4>
                <p className="text-[11px] text-brand-dark/70 dark:text-white/60 leading-snug mt-0.5">
                  Never lose agronomic remedies, dosage charts, or AI advice.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick App Preferences (Language & Support) */}
        <div className="bg-white dark:bg-[#111418] rounded-3xl border border-cream-200/90 dark:border-white/10 p-4 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-cream-200 dark:border-white/10">
            <Globe className="w-4 h-4 text-brand-leaf dark:text-emerald-400" />
            <h3 className="text-xs sm:text-sm font-bold text-brand-forest dark:text-emerald-400 uppercase tracking-wider">
              Language & Settings
            </h3>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-brand-dark/80 dark:text-white/80 block">
              App Language / ভাষা / भाषा
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                  language === 'en'
                    ? 'bg-brand-forest text-white border-brand-forest shadow-xs'
                    : 'bg-cream-50 dark:bg-white/10 text-brand-dark/80 dark:text-white/80 border-cream-200 dark:border-white/15 hover:bg-cream-100'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage('bn')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                  language === 'bn'
                    ? 'bg-brand-forest text-white border-brand-forest shadow-xs'
                    : 'bg-cream-50 dark:bg-white/10 text-brand-dark/80 dark:text-white/80 border-cream-200 dark:border-white/15 hover:bg-cream-100'
                }`}
              >
                বাংলা
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                  language === 'hi'
                    ? 'bg-brand-forest text-white border-brand-forest shadow-xs'
                    : 'bg-cream-50 text-brand-dark/80 border-cream-200 hover:bg-cream-100'
                }`}
              >
                हिन्दी
              </button>
            </div>
          </div>
        </div>

        {/* Agricultural Helpline Contacts (Call directly from mobile) */}
        <div className="bg-cream-100/80 rounded-3xl border border-cream-200 p-4 sm:p-5 shadow-2xs space-y-2.5">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-brand-forest" />
            <h4 className="text-xs font-bold text-brand-forest uppercase tracking-wider">
              Emergency Farmer Helplines
            </h4>
          </div>
          <p className="text-[11px] text-brand-dark/70">
            Tap to call free government agricultural experts directly from your phone:
          </p>
          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <a
              href="tel:18001801551"
              className="flex-1 p-2.5 rounded-xl bg-white border border-cream-200 hover:border-brand-leaf/40 text-brand-dark flex items-center justify-between text-xs font-semibold shadow-2xs"
            >
              <span>Kisan Call Centre (Toll Free)</span>
              <span className="font-bold text-brand-forest">1800-180-1551</span>
            </a>
            <a
              href="tel:1551"
              className="sm:w-36 p-2.5 rounded-xl bg-white border border-cream-200 hover:border-brand-leaf/40 text-brand-dark flex items-center justify-between text-xs font-semibold shadow-2xs"
            >
              <span>Short Code</span>
              <span className="font-bold text-brand-forest">1551</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 w-full text-left pt-1 sm:pt-2">
      <div>
        <h1 className="text-xl sm:text-3xl font-extrabold text-brand-forest leading-tight">
          {t('profile.title')}
        </h1>
        <p className="text-xs sm:text-sm text-brand-dark/70 mt-1">
          {t('profile.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Personal & Location Details (7 cols) */}
        <div className="md:col-span-7 space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b border-cream-200">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-brand-leaf" />
                <CardTitle className="text-base font-bold">
                  {t('profile.personalInfo')}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <Input
                  label={t('auth.fullName')}
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />

                <Input
                  label={t('auth.email')}
                  type="email"
                  disabled
                  value={user?.email || ''}
                  helperText="Email cannot be changed directly."
                />

                <Input
                  label={t('onboarding.phone')}
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Farmer mobile number"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label={t('onboarding.state')}
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  />

                  <Input
                    label={t('onboarding.district')}
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Burdwan / Hooghly"
                  />
                </div>

                <Input
                  label={t('onboarding.village')}
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  placeholder="Village / Gram Panchayat"
                />

                <div className="pt-2">
                  <Button type="submit" variant="primary" isLoading={isSaving}>
                    {t('common.save')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Preferred Language */}
          <Card>
            <CardHeader className="pb-3 border-b border-cream-200">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-brand-leaf" />
                <CardTitle className="text-base font-bold">
                  {t('profile.languagePref')}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-3 gap-2">
                {(['en', 'bn', 'hi'] as Language[]).map((lang) => {
                  const names = { en: 'English', bn: 'বাংলা', hi: 'हिन्दी' };
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setLanguage(lang)}
                      className={`p-3 rounded-xl border text-center font-bold text-sm transition-all ${
                        language === lang
                          ? 'bg-brand-forest text-white border-brand-forest shadow-xs'
                          : 'bg-white text-brand-dark border-cream-300 hover:bg-cream-100'
                      }`}
                    >
                      {names[lang]}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Security & Privacy (5 cols) */}
        <div className="md:col-span-5 space-y-6">
          {/* Password Update */}
          <Card>
            <CardHeader className="pb-3 border-b border-cream-200">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-brand-leaf" />
                <CardTitle className="text-base font-bold">
                  {t('profile.security')}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handlePasswordChange} className="space-y-3">
                <Input
                  label="New Password"
                  isPassword
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                />

                <Input
                  label="Confirm New Password"
                  isPassword
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                />

                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  className="w-full mt-1"
                  isLoading={isUpdatingPassword}
                >
                  {t('profile.changePassword')}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Privacy & Account Deletion */}
          <Card className="border-red-200 bg-red-50/20">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-red-700">
                <Trash2 className="w-5 h-5 shrink-0" />
                <CardTitle className="text-base font-bold">
                  {t('profile.dangerZone')}
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-red-900/70">
                {t('profile.deleteWarning')}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <Button
                variant="danger"
                size="sm"
                className="w-full"
                onClick={() => setIsDeleteModalOpen(true)}
              >
                {t('profile.deleteAccount')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Account & Data Deletion"
        maxWidth="sm"
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-red-800 leading-relaxed">
            This action is <strong>irreversible</strong>. Type <strong>DELETE</strong> in the box below to permanently wipe your farmer profile, crops, soil logs, and scan history.
          </p>

          <Input
            placeholder="Type DELETE to confirm"
            value={deleteConfirmationText}
            onChange={(e) => setDeleteConfirmationText(e.target.value)}
          />

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-cream-200">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={deleteConfirmationText !== 'DELETE'}
              isLoading={isDeleting}
              onClick={handleDeleteAccount}
            >
              Permanently Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
