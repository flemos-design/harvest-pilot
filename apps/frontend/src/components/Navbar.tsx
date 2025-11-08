'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { LayoutDashboard, FileText, Calendar, MapPin, Activity, Map as MapIcon, CheckSquare, Package, Building2, Building, Users, RefreshCw, Satellite } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/mapa', label: 'Mapa', icon: MapIcon },
  { href: '/satelite', label: 'Satélite', icon: Satellite },
  { href: '/relatorios', label: 'Relatórios', icon: FileText },
  { href: '/calendario', label: 'Calendário', icon: Calendar },
  { href: '/tarefas', label: 'Tarefas', icon: CheckSquare },
  { href: '/parcelas', label: 'Terrenos', icon: MapPin },
  { href: '/operacoes', label: 'Operações', icon: Activity },
  { href: '/insumos', label: 'Insumos', icon: Package },
  { href: '/ciclos', label: 'Ciclos', icon: RefreshCw },
  { href: '/organizacoes', label: 'Organizações', icon: Building2 },
  { href: '/propriedades', label: 'Propriedades', icon: Building },
  { href: '/utilizadores', label: 'Utilizadores', icon: Users },
];

export function Navbar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/' || pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center hover:opacity-80 transition">
            <Image
              src="/logo.png"
              alt="HarvestPilot"
              width={320}
              height={80}
              priority
              className="h-16 w-auto"
            />
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition font-medium text-sm ${
                    active
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button - Placeholder */}
          <div className="md:hidden">
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu - Hidden for now */}
        <div className="md:hidden hidden pb-4">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition font-medium text-sm ${
                    active
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
