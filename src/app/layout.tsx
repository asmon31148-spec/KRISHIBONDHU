import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { I18nProvider } from '@/i18n/context';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/components/ui/Toast';
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
          <AuthProvider>
            <ToastProvider>
              <Navbar />
              <div className="flex-1 flex w-full pb-16 lg:pb-0 overflow-x-clip min-h-[calc(100vh-57px)]">
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
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  if (registrations && registrations.length > 0) {
                    for (var i = 0; i < registrations.length; i++) {
                      registrations[i].unregister();
                    }
                    if (window.caches) {
                      caches.keys().then(function(names) {
                        for (var j = 0; j < names.length; j++) {
                          if (names[j].indexOf('workbox') !== -1 || names[j].indexOf('sw-') !== -1) {
                            caches.delete(names[j]);
                          }
                        }
                      });
                    }
                  }
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
