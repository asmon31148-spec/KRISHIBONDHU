'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

export function ContentWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAssistant = pathname === '/assistant';
  const isHome = pathname === '/';

  // The Assistant screen docks flush with zero margin gap
  if (isAssistant) {
    return (
      <main className="flex-1 min-w-0 w-full h-[calc(100dvh-57px-4rem)] lg:h-[calc(100dvh-57px)] overflow-hidden bg-[#F9F7F2] dark:bg-[#0B1711] flex flex-col transition-colors duration-200">
        {children}
      </main>
    );
  }

  // Home page has its own responsive hero container
  if (isHome) {
    return (
      <main className="flex-1 min-w-0 w-full overflow-x-clip transition-colors duration-200">
        {children}
      </main>
    );
  }

  // All other tools and dashboards get spacious, comfortable breathing room
  return (
    <main className="flex-1 min-w-0 w-full p-4 sm:p-6 lg:p-8 pt-5 sm:pt-7 lg:pt-8 overflow-x-clip transition-colors duration-200">
      <div className="w-full max-w-[1536px] mx-auto">
        {children}
      </div>
    </main>
  );
}
