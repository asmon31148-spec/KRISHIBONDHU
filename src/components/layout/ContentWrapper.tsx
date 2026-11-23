'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

export function ContentWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAssistant = pathname === '/assistant';

  if (isAssistant) {
    return (
      <main className="flex-1 min-w-0 w-full h-[calc(100vh-61px)] overflow-hidden bg-white">
        {children}
      </main>
    );
  }

  return (
    <main className="flex-1 min-w-0 w-full p-2 sm:p-4 lg:p-4 lg:py-3.5 overflow-x-clip">
      <div className="w-full max-w-[1536px] mx-auto">
        {children}
      </div>
    </main>
  );
}
