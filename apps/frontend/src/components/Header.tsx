'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  Sun,
  Moon,
  Check,
  Trash2,
  AlertTriangle,
  CloudRain,
  Sprout,
  ClipboardList,
  Info,
} from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useNotificacoes } from '@/hooks/useNotificacoes';

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
  notificacoes: 'Notificações',
  novo: 'Novo',
  nova: 'Nova',
  editar: 'Editar',
};

const tipoIconMap: Record<string, React.ReactNode> = {
  NDVI: <Sprout className="w-4 h-4 text-green-600" />,
  METEO: <CloudRain className="w-4 h-4 text-blue-600" />,
  TAREFA: <ClipboardList className="w-4 h-4 text-orange-600" />,
  STOCK: <AlertTriangle className="w-4 h-4 text-yellow-600" />,
  SISTEMA: <Info className="w-4 h-4 text-gray-600" />,
};

function timeAgo(date: string) {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'Agora';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Há ${hours}h`;
  const days = Math.floor(hours / 24);
  return `Há ${days}d`;
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notificacoes, unreadCount, markAsRead, markAllAsRead, deleteNotificacao } =
    useNotificacoes(user?.id);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const getUserInitials = () => {
    if (!user?.nome) return 'U';
    const names = user.nome.split(' ');
    if (names.length === 1) return names[0][0].toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };

  const getRoleLabel = () => {
    const roleLabels: Record<string, string> = {
      ADMIN: 'Administrador',
      GESTOR: 'Gestor',
      OPERADOR: 'Operador',
    };
    return user?.papel ? roleLabels[user.papel] : 'Utilizador';
  };

  const breadcrumbs = pathname
    .split('/')
    .filter(Boolean)
    .map((segment, index, array) => {
      const href = '/' + array.slice(0, index + 1).join('/');
      const label = routeLabels[segment] || segment;
      return { href, label };
    });

  if (pathname !== '/' && pathname !== '/dashboard') {
    breadcrumbs.unshift({ href: '/dashboard', label: 'Home' });
  }

  const closeMenus = useCallback(() => {
    setShowUserMenu(false);
    setShowNotifications(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenus();
    };
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(target) &&
        userMenuRef.current &&
        !userMenuRef.current.contains(target)
      ) {
        closeMenus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [closeMenus]);

  const handleNotifClick = (notif: (typeof notificacoes)[0]) => {
    if (!notif.lida) markAsRead(notif.id);
    setShowNotifications(false);
    if (notif.link) {
      router.push(notif.link);
    } else {
      router.push('/notificacoes');
    }
  };

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 transition-colors">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left: Breadcrumbs */}
        <div className="flex items-center gap-2">
          <button className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>

          <nav className="hidden sm:flex items-center gap-2 text-sm" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.href} className="flex items-center gap-2">
                {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
                {index === breadcrumbs.length - 1 ? (
                  <span className="font-medium text-gray-900 dark:text-gray-100" aria-current="page">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition"
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
          <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition w-64">
            <Search className="w-4 h-4 text-gray-400 dark:text-gray-300" />
            <input
              type="text"
              placeholder="Pesquisar..."
              className="bg-transparent border-none outline-none text-sm w-full placeholder:text-gray-400 dark:placeholder:text-gray-300 text-gray-900 dark:text-gray-100"
            />
            <kbd className="hidden xl:inline-block px-2 py-0.5 text-xs font-semibold text-gray-500 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded">
              ⌘K
            </kbd>
          </div>

          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              aria-expanded={showNotifications}
              aria-haspopup="menu"
              aria-controls="notifications-menu"
              aria-label="Notificações"
            >
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center" aria-hidden="true">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div
                id="notifications-menu"
                role="menu"
                className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 animate-slide-down"
              >
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Notificações</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllAsRead()}
                      className="text-xs text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      Marcar todas
                    </button>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notificacoes.length === 0 ? (
                    <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Sem notificações</p>
                    </div>
                  ) : (
                    notificacoes.slice(0, 8).map((notif) => (
                      <div
                        key={notif.id}
                        className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 ${
                          !notif.lida ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                        }`}
                        role="menuitem"
                        onClick={() => handleNotifClick(notif)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 shrink-0">{tipoIconMap[notif.tipo] || tipoIconMap.SISTEMA}</div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${!notif.lida ? 'text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-300'}`}>
                              {notif.titulo}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{notif.mensagem}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{timeAgo(notif.createdAt)}</p>
                          </div>
                          <div className="flex flex-col gap-1 shrink-0">
                            {!notif.lida && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notif.id);
                                }}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                                title="Marcar como lida"
                              >
                                <Check className="w-3 h-3 text-green-600" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotificacao(notif.id);
                              }}
                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                              title="Eliminar"
                            >
                              <Trash2 className="w-3 h-3 text-red-500" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                  <Link
                    href="/notificacoes"
                    onClick={() => setShowNotifications(false)}
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    Ver todas
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              aria-expanded={showUserMenu}
              aria-haspopup="menu"
              aria-controls="user-menu"
              aria-label="Menu do utilizador"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">{getUserInitials()}</span>
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.nome || 'Utilizador'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{getRoleLabel()}</p>
              </div>
            </button>

            {/* User Menu Dropdown */}
            {showUserMenu && (
              <div
                id="user-menu"
                role="menu"
                className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 animate-slide-down"
              >
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{user?.nome || 'Utilizador'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email || ''}</p>
                </div>
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2" role="menuitem">
                  <User className="w-4 h-4" />
                  Meu Perfil
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2" role="menuitem">
                  <Settings className="w-4 h-4" />
                  Definições
                </button>
                <button
                  onClick={toggleTheme}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                  role="menuitem"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  {theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
                </button>
                <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                <button
                  onClick={logout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                  role="menuitem"
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
