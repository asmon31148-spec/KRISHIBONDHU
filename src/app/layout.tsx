import type { Metadata, Viewport } from 'next';
import './globals.css';
import { I18nProvider } from '@/i18n/context';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/components/ui/Toast';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';

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
  themeColor: '#1B4332',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-cream-50 text-brand-dark min-h-screen flex flex-col font-sans selection:bg-brand-mint selection:text-brand-forest">
        <I18nProvider>
          <AuthProvider>
            <ToastProvider>
              <Navbar />
              <div className="flex-1 flex w-full pb-20 lg:pb-6">
                <Sidebar />
                <main className="flex-1 min-w-0 w-full p-4 sm:p-6 lg:p-8 xl:p-10">
                  <div className="w-full max-w-[1536px] mx-auto">
                    {children}
                  </div>
                </main>
              </div>
              <MobileNav />
            </ToastProvider>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
