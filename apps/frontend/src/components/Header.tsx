'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// Map routes to breadcrumb labels
const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  mapa: 'Mapa',
  satelite: 'Satélite',
  relatorios: 'Relatórios',
  calendario: 'Calendário',
  tarefas: 'Tarefas',
  parcelas: 'Terrenos',
  operacoes: 'Operações',
  insumos: 'Insumos',
  ciclos: 'Ciclos',
  culturas: 'Culturas',
  organizacoes: 'Organizações',
  propriedades: 'Propriedades',
  utilizadores: 'Utilizadores',
  novo: 'Novo',
  nova: 'Nova',
  editar: 'Editar',
};

export function Header() {
  const pathname = usePathname();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user, logout } = useAuth();

  // Get user initials
  const getUserInitials = () => {
    if (!user?.nome) return 'U';
    const names = user.nome.split(' ');
    if (names.length === 1) return names[0][0].toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };

  // Get user role label
  const getRoleLabel = () => {
    const roleLabels: Record<string, string> = {
      ADMIN: 'Administrador',
      GESTOR: 'Gestor',
      OPERADOR: 'Operador',
    };
    return user?.papel ? roleLabels[user.papel] : 'Utilizador';
  };

  // Generate breadcrumbs from pathname
  const breadcrumbs = pathname
    .split('/')
    .filter(Boolean)
    .map((segment, index, array) => {
      const href = '/' + array.slice(0, index + 1).join('/');
      const label = routeLabels[segment] || segment;
      return { href, label };
    });

  // Add home if not on dashboard
  if (pathname !== '/' && pathname !== '/dashboard') {
    breadcrumbs.unshift({ href: '/dashboard', label: 'Home' });
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left: Breadcrumbs */}
        <div className="flex items-center gap-2">
          <button className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
            <Menu className="w-5 h-5 text-gray-600" />
          </button>

          <nav className="hidden sm:flex items-center gap-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.href} className="flex items-center gap-2">
                {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
                {index === breadcrumbs.length - 1 ? (
                  <span className="font-medium text-gray-900">{crumb.label}</span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="text-gray-500 hover:text-gray-900 transition"
                  >
                    {crumb.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Right: Search, Notifications, User */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg border border-gray-200 hover:border-gray-300 transition w-64">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar..."
              className="bg-transparent border-none outline-none text-sm w-full placeholder:text-gray-400"
            />
            <kbd className="hidden xl:inline-block px-2 py-0.5 text-xs font-semibold text-gray-500 bg-white border border-gray-300 rounded">
              ⌘K
            </kbd>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 animate-slide-down">
                <div className="px-4 py-2 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Notificações</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">Nova tarefa atribuída</p>
                    <p className="text-xs text-gray-500 mt-1">Rega programada para amanhã às 8h</p>
                    <p className="text-xs text-gray-400 mt-1">Há 2 horas</p>
                  </div>
                  <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">Alerta meteorológico</p>
                    <p className="text-xs text-gray-500 mt-1">Possibilidade de chuva na próxima semana</p>
                    <p className="text-xs text-gray-400 mt-1">Há 5 horas</p>
                  </div>
                  <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                    <p className="text-sm font-medium text-gray-900">Stock baixo de insumos</p>
                    <p className="text-xs text-gray-500 mt-1">Fertilizante orgânico abaixo do mínimo</p>
                    <p className="text-xs text-gray-400 mt-1">Ontem</p>
                  </div>
                </div>
                <div className="px-4 py-2 border-t border-gray-200">
                  <button className="text-sm text-green-600 hover:text-green-700 font-medium">
                    Ver todas
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-lg transition"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">{getUserInitials()}</span>
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-medium text-gray-900">{user?.nome || 'Utilizador'}</p>
                <p className="text-xs text-gray-500">{getRoleLabel()}</p>
              </div>
            </button>

            {/* User Menu Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 animate-slide-down">
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-semibold text-gray-900">{user?.nome || 'Utilizador'}</p>
                  <p className="text-xs text-gray-500">{user?.email || ''}</p>
                </div>
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Meu Perfil
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Definições
                </button>
                <div className="border-t border-gray-200 my-2"></div>
                <button
                  onClick={logout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Terminar Sessão
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
