'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Don't show navbar on home page
  const showNavbar = pathname !== '/';

  return (
    <>
      {showNavbar && <Navbar />}
      {children}
    </>
  );
}
