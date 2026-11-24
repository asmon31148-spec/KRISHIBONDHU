'use client';

import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';
import { useTranslation } from '@/i18n/context';

export function OfflineBanner() {
  const { language } = useTranslation();
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    setIsOffline(!navigator.onLine);
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);

    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div
      role="status"
      className="w-full bg-amber-600 dark:bg-amber-700 text-white px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 print:hidden"
    >
      <WifiOff className="w-3.5 h-3.5 shrink-0" />
      <span>
        {language === 'bn'
          ? 'অফলাইন ফিল্ড মোড চালু — সার ক্যালকুলেটর ও সংরক্ষিত তথ্য ব্যবহারযোগ্য'
          : language === 'hi'
          ? 'ऑफ़लाइन फ़ील्ड मोड सक्रिय — उर्वरक कैलकुलेटर और सहेजा गया डेटा उपलब्ध है'
          : 'Offline Field Mode Active — Fertilizer Calculator & cached advisories remain available'}
      </span>
    </div>
  );
}
