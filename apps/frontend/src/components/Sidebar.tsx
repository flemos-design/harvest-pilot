'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  Calendar,
  MapPin,
  Activity,
  Map as MapIcon,
  CheckSquare,
  Package,
  Building2,
  Building,
  Users,
  RefreshCw,
  Satellite,
  ChevronLeft,
  ChevronRight,
  Sprout,
  Brain,
} from 'lucide-react';

// Navegação organizada por categorias
const navigation = [
  {
    category: 'Overview',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/assistente', label: 'Assistente IA', icon: Brain },
      { href: '/relatorios', label: 'Relatórios', icon: FileText },
    ],
  },
  {
    category: 'Gestão de Campo',
    items: [
      { href: '/mapa', label: 'Mapa', icon: MapIcon },
      { href: '/parcelas', label: 'Terrenos', icon: MapPin },
      { href: '/operacoes', label: 'Operações', icon: Activity },
      { href: '/tarefas', label: 'Tarefas', icon: CheckSquare },
      { href: '/calendario', label: 'Calendário', icon: Calendar },
    ],
  },
  {
    category: 'Dados & Monitorização',
    items: [
      { href: '/satelite', label: 'Satélite', icon: Satellite },
      { href: '/culturas', label: 'Culturas', icon: Sprout },
      { href: '/ciclos', label: 'Ciclos', icon: RefreshCw },
      { href: '/insumos', label: 'Insumos', icon: Package },
    ],
  },
  {
    category: 'Sistema',
    items: [
      { href: '/organizacoes', label: 'Organizações', icon: Building2 },
      { href: '/propriedades', label: 'Propriedades', icon: Building },
      { href: '/utilizadores', label: 'Utilizadores', icon: Users },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/' || pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700 transition-all duration-300 z-40 flex flex-col ${
        collapsed ? 'w-[72px]' : 'w-[260px]'
      }`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700 flex-shrink-0">
        {!collapsed ? (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white text-lg">HarvestPilot</span>
          </Link>
        ) : (
          <Link href="/dashboard" className="flex items-center justify-center w-full">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <Sprout className="w-5 h-5 text-white" />
            </div>
          </Link>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {navigation.map((section, idx) => (
          <div key={idx} className="mb-6">
            {!collapsed && (
              <div className="px-3 mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {section.category}
                </span>
              </div>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                      active
                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/50'
                        : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                    }`}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                    {!collapsed && (
                      <span className="font-medium text-sm">{item.label}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Toggle Button */}
      <div className="p-2 border-t border-slate-700 flex-shrink-0">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
          title={collapsed ? 'Expandir' : 'Colapsar'}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Colapsar</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
