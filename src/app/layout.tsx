import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { I18nProvider } from '@/i18n/context';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/components/ui/Toast';
import { GoogleTranslator } from '@/components/i18n/GoogleTranslator';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { ContentWrapper } from '@/components/layout/ContentWrapper';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'KRISHIBONDHU - AI-Powered Smart Agriculture & Farmer Assistant',
  description:
    'Dedicated agritech platform for West Bengal and India: real crop disease detection, localized agronomy AI assistant, precision farm records, and live weather advisories.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#1B4332',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overflow-x-clip" suppressHydrationWarning>
      <body className={`${plusJakarta.variable} bg-[#F9F7F2] text-[#10241A] min-h-screen flex flex-col font-sans overflow-x-clip selection:bg-pine-100 selection:text-pine-900`}>
        <I18nProvider>
          <GoogleTranslator />
          <AuthProvider>
            <ToastProvider>
              <Navbar />
              <div className="flex-1 flex w-full pb-16 lg:pb-0 overflow-x-clip">
                <Sidebar />
                <ContentWrapper>{children}</ContentWrapper>
              </div>
              <MobileNav />
            </ToastProvider>
          </AuthProvider>
        </I18nProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                // Unregister stale service workers to eliminate reload hangs and chunk mismatch glitches
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  for (var i = 0; i < registrations.length; i++) {
                    registrations[i].unregister();
                  }
                });
                if (window.caches) {
                  caches.keys().then(function(names) {
                    for (var i = 0; i < names.length; i++) {
                      caches.delete(names[i]);
                    }
                  });
                }
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
