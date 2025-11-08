'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import FloatingChat from './FloatingChat';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Don't show app layout on home/landing page and auth pages
  const authPages = ['/', '/login', '/register'];
  const showAppLayout = !authPages.includes(pathname);

  if (!showAppLayout) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col ml-[260px] transition-all duration-300">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Floating Chat - Acessível globalmente */}
      <FloatingChat />
    </div>
  );
}
