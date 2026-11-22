'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/i18n/context';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Sprout, Sparkles, ShieldCheck } from 'lucide-react';

interface GuestSavePromptProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
}

export function GuestSavePrompt({
  isOpen,
  onClose,
  featureName,
}: GuestSavePromptProps) {
  const { t } = useTranslation();

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="text-center space-y-4 py-2">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-brand-harvest mx-auto">
          <Sparkles className="w-7 h-7" />
        </div>

        <div className="space-y-1">
          <h3 className="text-xl font-extrabold text-brand-forest">
            {t('guest.modalTitle')}
          </h3>
          <p className="text-xs sm:text-sm text-brand-dark/70 leading-relaxed max-w-sm mx-auto">
            {featureName
              ? `To use ${featureName} and save your farming data permanently across your devices, create a free farmer account.`
              : t('guest.modalDesc')}
          </p>
        </div>

        <div className="p-3 bg-cream-100 rounded-xl border border-cream-200 text-left text-xs text-brand-dark/80 space-y-1.5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Sync scan reports and download official PDFs</span>
          </div>
          <div className="flex items-center gap-2">
            <Sprout className="w-4 h-4 text-brand-leaf shrink-0" />
            <span>Manage multiple plots with Bigha/Katha land units</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <Link href="/auth/signup" onClick={onClose} className="w-full">
            <Button variant="primary" size="lg" className="w-full">
              {t('nav.saveAccount')}
            </Button>
          </Link>

          <Link href="/auth/login" onClick={onClose} className="w-full">
            <Button variant="secondary" size="md" className="w-full">
              {t('nav.login')}
            </Button>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="text-xs text-brand-dark/60 hover:text-brand-dark pt-1"
          >
            {t('guest.continueGuest')}
          </button>
        </div>
      </div>
    </Modal>
  );
}
