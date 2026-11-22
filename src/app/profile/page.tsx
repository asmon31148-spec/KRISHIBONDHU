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
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 text-brand-harvest flex items-center justify-center mx-auto">
          <User className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-brand-forest">
          Guest Farmer Profile
        </h2>
        <p className="text-xs sm:text-sm text-brand-dark/70 leading-relaxed">
          You are currently in guest mode. Create a free account to save your farm locations, crops, and diagnostic history.
        </p>
        <div className="pt-2">
          <Button variant="primary" onClick={() => router.push('/auth/signup')}>
            {t('nav.saveAccount')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-left">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-forest">
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
