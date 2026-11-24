import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { I18nProvider } from '@/i18n/context';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/components/ui/Toast';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { ContentWrapper } from '@/components/layout/ContentWrapper';
import { SplashScreen } from '@/components/ui/SplashScreen';

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
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#143224',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overflow-x-clip" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var saved = localStorage.getItem('krishibondhu-theme');
                var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (saved === 'dark' || (!saved && prefersDark)) {
                  document.documentElement.classList.add('dark');
                  document.documentElement.classList.remove('light');
                } else {
                  document.documentElement.classList.add('light');
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className={`${plusJakarta.variable} bg-[#F9F7F2] dark:bg-[#000000] text-[#10241A] dark:text-white min-h-screen flex flex-col font-sans overflow-x-clip selection:bg-pine-100 selection:text-pine-900 transition-colors duration-200`}>
        <SplashScreen />
        <ThemeProvider>
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
        </ThemeProvider>
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
