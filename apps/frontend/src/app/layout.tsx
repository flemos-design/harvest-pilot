import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/lib/providers';
import { LayoutWrapper } from '@/components/LayoutWrapper';
import { ThemeProvider } from '@/contexts/ThemeContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'HarvestPilot - Gestão Agrícola Inteligente',
  description: 'Sistema de gestão agrícola com monitorização por satélite e alertas meteorológicos para produção de frutos secos',
  manifest: '/manifest.json',
  themeColor: '#22c55e',
  viewport: 'width=device-width, initial-scale=1',
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/icon-192x192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'HarvestPilot',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#22c55e" />

      </head>
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-900 dark:bg-gray-900 transition-colors`}>
        <ThemeProvider>
          <Providers>
            <LayoutWrapper>{children}</LayoutWrapper>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
